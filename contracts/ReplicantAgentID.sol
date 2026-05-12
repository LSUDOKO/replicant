// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract ReplicantAgentID {
    enum Status {
        Active,
        Archived,
        Slashed,
        Evolving
    }

    struct Agent {
        bytes32 encryptedGenomeHash;
        bytes32 storageRootHash;
        bytes32 teeAttestationHash;
        bytes32 alignmentVerdictHash;
        uint8 speciesType;
        uint32 generation;
        Status status;
        uint256 parentId;
        uint256 fitnessScore;
        uint256 stake;
        uint256 createdAt;
    }

    string public name;
    string public symbol;
    address public owner;
    address public treasury;
    address public evolutionExecutor;
    address public alignmentNode;
    uint96 public royaltyBps = 500;
    uint256 public totalSupply;

    mapping(uint256 => Agent) public agents;
    mapping(uint256 => uint256[]) private children;
    mapping(uint256 => bool) public descendantsBlocked;
    mapping(uint256 => address) private tokenOwner;
    mapping(address => uint256) private balances;
    mapping(uint256 => address) private tokenApprovals;
    mapping(address => mapping(address => bool)) private operatorApprovals;
    mapping(uint256 => mapping(address => uint256)) public usageExpiry;
    mapping(uint256 => address) public creators;

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed tokenOwner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed tokenOwner, address indexed operator, bool approved);
    event GenesisMinted(
        uint256 indexed agentId,
        address indexed creator,
        bytes32 encryptedGenomeHash,
        uint8 speciesType
    );
    event AgentCloned(
        uint256 indexed parentId,
        uint256 indexed childId,
        bytes32 childGenomeHash,
        uint256 fitnessScore
    );
    event AgentArchived(uint256 indexed agentId);
    event AgentSlashed(uint256 indexed agentId, bytes32 alignmentViolationHash, uint256 slashAmount);
    event UsageAuthorized(uint256 indexed agentId, address indexed user, uint256 expiry);
    event GenomeUpdated(
        uint256 indexed agentId,
        bytes32 storageRootHash,
        bytes32 teeAttestationHash,
        bytes32 alignmentVerdictHash
    );
    event EvolutionStatusSet(uint256 indexed agentId);

    error NotOwner();
    error NotTokenOwnerOrApproved();
    error NotEvolutionExecutor();
    error NotAlignmentNode();
    error InvalidToken();
    error InvalidRecipient();
    error InvalidParent();
    error AgentBlocked();
    error AgentAlreadySlashed();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    modifier onlyEvolutionExecutor() {
        if (msg.sender != evolutionExecutor) revert NotEvolutionExecutor();
        _;
    }

    modifier onlyAlignmentNode() {
        if (msg.sender != alignmentNode) revert NotAlignmentNode();
        _;
    }

    constructor(string memory tokenName, string memory tokenSymbol, address initialTreasury) {
        name = tokenName;
        symbol = tokenSymbol;
        owner = msg.sender;
        treasury = initialTreasury == address(0) ? msg.sender : initialTreasury;
        evolutionExecutor = msg.sender;
        alignmentNode = msg.sender;
    }

    function setEvolutionExecutor(address executor) external onlyOwner {
        evolutionExecutor = executor;
    }

    function setAlignmentNode(address node) external onlyOwner {
        alignmentNode = node;
    }

    function setTreasury(address newTreasury) external onlyOwner {
        if (newTreasury == address(0)) revert InvalidRecipient();
        treasury = newTreasury;
    }

    function setRoyaltyBps(uint96 newRoyaltyBps) external onlyOwner {
        require(newRoyaltyBps <= 2_000, "ROYALTY_TOO_HIGH");
        royaltyBps = newRoyaltyBps;
    }

    function mintGenesis(bytes32 encryptedGenomeHash, uint8 speciesType) external payable returns (uint256 agentId) {
        agentId = _mintAgent({
            to: msg.sender,
            parentId: 0,
            generation: 0,
            encryptedGenomeHash: encryptedGenomeHash,
            storageRootHash: bytes32(0),
            teeAttestationHash: bytes32(0),
            alignmentVerdictHash: bytes32(0),
            speciesType: speciesType,
            fitnessScore: 0,
            stake: msg.value,
            creator: msg.sender
        });

        emit GenesisMinted(agentId, msg.sender, encryptedGenomeHash, speciesType);
    }

    function clone(uint256 parentId, bytes32 childGenomeHash, uint256 fitnessScore)
        external
        onlyEvolutionExecutor
        returns (uint256 childId)
    {
        childId = cloneWithProof(parentId, childGenomeHash, bytes32(0), bytes32(0), bytes32(0), fitnessScore);
    }

    function cloneWithProof(
        uint256 parentId,
        bytes32 childGenomeHash,
        bytes32 storageRootHash,
        bytes32 teeAttestationHash,
        bytes32 alignmentVerdictHash,
        uint256 fitnessScore
    ) public onlyEvolutionExecutor returns (uint256 childId) {
        if (!_exists(parentId)) revert InvalidParent();
        Agent storage parent = agents[parentId];
        if (parent.status == Status.Slashed || descendantsBlocked[parentId]) revert AgentBlocked();

        address currentOwner = ownerOf(parentId);
        parent.status = Status.Archived;

        childId = _mintAgent({
            to: currentOwner,
            parentId: parentId,
            generation: parent.generation + 1,
            encryptedGenomeHash: childGenomeHash,
            storageRootHash: storageRootHash,
            teeAttestationHash: teeAttestationHash,
            alignmentVerdictHash: alignmentVerdictHash,
            speciesType: parent.speciesType,
            fitnessScore: fitnessScore,
            stake: parent.stake,
            creator: creators[parentId]
        });

        children[parentId].push(childId);
        emit AgentArchived(parentId);
        emit GenomeUpdated(childId, storageRootHash, teeAttestationHash, alignmentVerdictHash);
        emit AgentCloned(parentId, childId, childGenomeHash, fitnessScore);
    }

    function authorizeUsage(uint256 agentId, address user, uint256 expiry) external {
        if (!_isApprovedOrOwner(msg.sender, agentId)) revert NotTokenOwnerOrApproved();
        usageExpiry[agentId][user] = expiry;
        emit UsageAuthorized(agentId, user, expiry);
    }

    function slash(uint256 agentId, bytes32 alignmentViolationHash) external onlyAlignmentNode {
        if (!_exists(agentId)) revert InvalidToken();
        Agent storage agent = agents[agentId];
        if (agent.status == Status.Slashed) revert AgentAlreadySlashed();

        agent.status = Status.Slashed;
        agent.alignmentVerdictHash = alignmentViolationHash;
        uint256 slashAmount = agent.stake;
        agent.stake = 0;
        descendantsBlocked[agentId] = true;
        _blockDescendants(agentId);

        if (slashAmount > 0) {
            (bool sent,) = payable(treasury).call{value: slashAmount}("");
            require(sent, "TREASURY_TRANSFER_FAILED");
        }

        emit AgentSlashed(agentId, alignmentViolationHash, slashAmount);
    }

    function markEvolving(uint256 agentId) external onlyEvolutionExecutor {
        if (!_exists(agentId)) revert InvalidToken();
        Agent storage agent = agents[agentId];
        if (agent.status == Status.Slashed || descendantsBlocked[agentId]) revert AgentBlocked();
        agent.status = Status.Evolving;
        emit EvolutionStatusSet(agentId);
    }

    function getLineage(uint256 agentId) external view returns (uint256[] memory ancestors) {
        if (!_exists(agentId)) revert InvalidToken();

        uint256 depth;
        uint256 cursor = agents[agentId].parentId;
        while (cursor != 0) {
            depth++;
            cursor = agents[cursor].parentId;
        }

        ancestors = new uint256[](depth);
        cursor = agents[agentId].parentId;
        for (uint256 i; i < depth; i++) {
            ancestors[i] = cursor;
            cursor = agents[cursor].parentId;
        }
    }

    function getChildren(uint256 agentId) external view returns (uint256[] memory) {
        if (!_exists(agentId)) revert InvalidToken();
        return children[agentId];
    }

    function ownerOf(uint256 tokenId) public view returns (address) {
        address currentOwner = tokenOwner[tokenId];
        if (currentOwner == address(0)) revert InvalidToken();
        return currentOwner;
    }

    function balanceOf(address account) external view returns (uint256) {
        if (account == address(0)) revert InvalidRecipient();
        return balances[account];
    }

    function approve(address spender, uint256 tokenId) external {
        address currentOwner = ownerOf(tokenId);
        if (msg.sender != currentOwner && !operatorApprovals[currentOwner][msg.sender]) {
            revert NotTokenOwnerOrApproved();
        }
        tokenApprovals[tokenId] = spender;
        emit Approval(currentOwner, spender, tokenId);
    }

    function getApproved(uint256 tokenId) external view returns (address) {
        if (!_exists(tokenId)) revert InvalidToken();
        return tokenApprovals[tokenId];
    }

    function setApprovalForAll(address operator, bool approved) external {
        operatorApprovals[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }

    function isApprovedForAll(address account, address operator) external view returns (bool) {
        return operatorApprovals[account][operator];
    }

    function transferFrom(address from, address to, uint256 tokenId) public {
        if (!_isApprovedOrOwner(msg.sender, tokenId)) revert NotTokenOwnerOrApproved();
        if (ownerOf(tokenId) != from) revert NotTokenOwnerOrApproved();
        if (to == address(0)) revert InvalidRecipient();

        delete tokenApprovals[tokenId];
        unchecked {
            balances[from]--;
            balances[to]++;
        }
        tokenOwner[tokenId] = to;
        emit Transfer(from, to, tokenId);
    }

    function royaltyInfo(uint256 tokenId, uint256 salePrice) external view returns (address receiver, uint256 royaltyAmount) {
        if (!_exists(tokenId)) revert InvalidToken();
        receiver = creators[tokenId];
        royaltyAmount = (salePrice * royaltyBps) / 10_000;
    }

    function _mintAgent(
        address to,
        uint256 parentId,
        uint32 generation,
        bytes32 encryptedGenomeHash,
        bytes32 storageRootHash,
        bytes32 teeAttestationHash,
        bytes32 alignmentVerdictHash,
        uint8 speciesType,
        uint256 fitnessScore,
        uint256 stake,
        address creator
    ) internal returns (uint256 agentId) {
        if (to == address(0)) revert InvalidRecipient();
        agentId = ++totalSupply;
        tokenOwner[agentId] = to;
        balances[to]++;
        creators[agentId] = creator;
        agents[agentId] = Agent({
            encryptedGenomeHash: encryptedGenomeHash,
            storageRootHash: storageRootHash,
            teeAttestationHash: teeAttestationHash,
            alignmentVerdictHash: alignmentVerdictHash,
            speciesType: speciesType,
            generation: generation,
            status: Status.Active,
            parentId: parentId,
            fitnessScore: fitnessScore,
            stake: stake,
            createdAt: block.timestamp
        });

        emit Transfer(address(0), to, agentId);
    }

    function _exists(uint256 tokenId) internal view returns (bool) {
        return tokenOwner[tokenId] != address(0);
    }

    function _isApprovedOrOwner(address spender, uint256 tokenId) internal view returns (bool) {
        address currentOwner = ownerOf(tokenId);
        return spender == currentOwner || tokenApprovals[tokenId] == spender || operatorApprovals[currentOwner][spender];
    }

    function _blockDescendants(uint256 agentId) internal {
        uint256[] storage directChildren = children[agentId];
        for (uint256 i; i < directChildren.length; i++) {
            uint256 childId = directChildren[i];
            descendantsBlocked[childId] = true;
            _blockDescendants(childId);
        }
    }
}
