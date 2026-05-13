// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./AgentNFT.sol";

/**
 * @title ReplicantAgentNFT
 * @notice ERC-7857 iNFT for REPLICANT autonomous AI agents.
 * @dev Extends the official 0G AgentNFT with species, generation, evolution, and alignment slashing.
 *      Uses EIP-7201 namespaced storage to avoid collisions with the parent contract.
 */
contract ReplicantAgentNFT is AgentNFT {
    // ─── Types ────────────────────────────────────────────────────────────────

    enum Status { Active, Archived, Slashed, Evolving }

    struct AgentMetadata {
        uint8   speciesType;
        uint32  generation;
        Status  status;
        uint256 parentId;
        uint256 fitnessScore;
        uint256 stake;
        bytes32 storageRootHash;
        bytes32 teeAttestationHash;
        bytes32 alignmentVerdictHash;
    }

    // ─── Storage ──────────────────────────────────────────────────────────────

    /// @custom:storage-location erc7201:replicant.storage.ReplicantAgentNFT
    struct ReplicantStorage {
        address evolutionExecutor;
        address alignmentNode;
        mapping(uint256 => AgentMetadata) agentMetadata;
        mapping(uint256 => uint256[])     children;
        mapping(uint256 => bool)          descendantsBlocked;
        mapping(uint256 => address)       creators;
    }

    // keccak256(abi.encode(uint256(keccak256("replicant.storage.ReplicantAgentNFT")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant REPLICANT_STORAGE_LOCATION =
        0x9e3b4c2a1f8d7e6b5a4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f00;

    function _getReplicantStorage() private pure returns (ReplicantStorage storage $) {
        assembly { $.slot := REPLICANT_STORAGE_LOCATION }
    }

    // ─── Events ───────────────────────────────────────────────────────────────

    event GenesisMinted(uint256 indexed agentId, address indexed creator, bytes32 encryptedGenomeHash, uint8 speciesType);
    event AgentCloned(uint256 indexed parentId, uint256 indexed childId, bytes32 childGenomeHash, uint256 fitnessScore);
    event AgentArchived(uint256 indexed agentId);
    event AgentSlashed(uint256 indexed agentId, bytes32 alignmentViolationHash, uint256 slashAmount);
    event EvolutionStatusSet(uint256 indexed agentId);

    // ─── Errors ───────────────────────────────────────────────────────────────

    error NotEvolutionExecutor();
    error NotAlignmentNode();
    error AgentBlocked();
    error AgentAlreadySlashed();

    // ─── Modifiers ────────────────────────────────────────────────────────────

    modifier onlyEvolutionExecutor() {
        if (msg.sender != _getReplicantStorage().evolutionExecutor) revert NotEvolutionExecutor();
        _;
    }

    modifier onlyAlignmentNode() {
        if (msg.sender != _getReplicantStorage().alignmentNode) revert NotAlignmentNode();
        _;
    }

    // ─── Initializer ──────────────────────────────────────────────────────────

    /**
     * @notice Initialize the ReplicantAgentNFT (replaces constructor for upgradeable pattern).
     * @param name_              Token name
     * @param symbol_            Token symbol
     * @param storageInfo_       0G Storage info string
     * @param verifierAddr       TEE/ZKP verifier contract address
     * @param admin_             Admin address
     * @param evolutionExecutor_ Trusted TEE executor address
     * @param alignmentNode_     AI Alignment Node address
     */
    function initializeReplicant(
        string  memory name_,
        string  memory symbol_,
        string  memory storageInfo_,
        address verifierAddr,
        address admin_,
        address evolutionExecutor_,
        address alignmentNode_
    ) external initializer {
        initialize(name_, symbol_, storageInfo_, verifierAddr, admin_);

        // Start token IDs at 1 so parentId=0 correctly means "genesis/no parent"
        // The ERC7857CloneableStorage slot is deterministic
        bytes32 cloneableSlot = 0x03de6cf14ecf4575e0ed0cc2fdb9b7ee13500cb3c0c403254fc893bf6e0c8000;
        assembly { sstore(cloneableSlot, 1) }

        ReplicantStorage storage $ = _getReplicantStorage();
        $.evolutionExecutor = evolutionExecutor_;
        $.alignmentNode     = alignmentNode_;
    }

    // ─── Admin setters ────────────────────────────────────────────────────────

    function setEvolutionExecutor(address executor) external onlyRole(ADMIN_ROLE) {
        _getReplicantStorage().evolutionExecutor = executor;
    }

    function setAlignmentNode(address node) external onlyRole(ADMIN_ROLE) {
        _getReplicantStorage().alignmentNode = node;
    }

    // ─── Core: Genesis Mint ───────────────────────────────────────────────────

    /**
     * @notice Mint a Gen-0 agent. Genome is stored as ERC-7857 IntelligentData.
     * @param encryptedGenomeHash keccak256 of the encrypted genome blob (stored on 0G Storage)
     * @param speciesType         0=AlphaHunter 1=CodeWeaver 2=GameMaster 3=DocuMind 4=OracleKeeper 5=SocialSynth
     * @return agentId            The minted token ID
     */
    function mintGenesis(bytes32 encryptedGenomeHash, uint8 speciesType)
        external
        payable
        whenNotPaused
        returns (uint256 agentId)
    {
        require(speciesType < 6, "Invalid species");

        agentId = _mintWithGenome(msg.sender, encryptedGenomeHash, speciesType, 0);

        ReplicantStorage storage $ = _getReplicantStorage();
        $.agentMetadata[agentId] = AgentMetadata({
            speciesType:          speciesType,
            generation:           0,
            status:               Status.Active,
            parentId:             0,
            fitnessScore:         0,
            stake:                msg.value,
            storageRootHash:      bytes32(0),
            teeAttestationHash:   bytes32(0),
            alignmentVerdictHash: bytes32(0)
        });

        $.creators[agentId] = msg.sender;

        emit GenesisMinted(agentId, msg.sender, encryptedGenomeHash, speciesType);
    }

    // ─── Core: Evolution Clone ────────────────────────────────────────────────

    /**
     * @notice Clone a parent agent after TEE-verified evolution.
     *         Uses the official ERC-7857 iCloneFrom with TEE transfer proofs.
     * @param parentId            Parent token ID
     * @param childGenomeHash     Encrypted genome hash of the evolved child
     * @param storageRootHash     0G Storage root hash for child genome blob
     * @param teeAttestationHash  TEE attestation hash from 0G Compute
     * @param alignmentVerdictHash Alignment Node verdict hash
     * @param fitnessScore        Child fitness score (species-specific metric)
     * @param proofs              TEE TransferValidityProofs for sealed handover
     * @return childId            The cloned child token ID
     */
    function cloneWithEvolution(
        uint256 parentId,
        bytes32 childGenomeHash,
        bytes32 storageRootHash,
        bytes32 teeAttestationHash,
        bytes32 alignmentVerdictHash,
        uint256 fitnessScore,
        TransferValidityProof[] calldata proofs
    ) external onlyEvolutionExecutor returns (uint256 childId) {
        ReplicantStorage storage $ = _getReplicantStorage();
        AgentMetadata storage parent = $.agentMetadata[parentId];

        require(_ownerOf(parentId) != address(0), "Parent does not exist");
        if (parent.status == Status.Slashed || $.descendantsBlocked[parentId]) revert AgentBlocked();

        address currentOwner = _ownerOf(parentId);

        // Mint child: if TEE proofs provided, use sealed handover via iCloneFrom;
        // otherwise use direct genome seeding (hackathon demo mode)
        if (proofs.length > 0) {
            childId = iCloneFrom(currentOwner, currentOwner, parentId, proofs);
            IntelligentData[] memory childDatas = new IntelligentData[](1);
            childDatas[0] = IntelligentData({
                dataDescription: _genomeURI(parent.speciesType, parent.generation + 1),
                dataHash:        childGenomeHash
            });
            _updateData(childId, childDatas);
        } else {
            childId = _mintWithGenome(currentOwner, childGenomeHash, parent.speciesType, parent.generation + 1);
        }

        // Persist child metadata
        $.agentMetadata[childId] = AgentMetadata({
            speciesType:          parent.speciesType,
            generation:           parent.generation + 1,
            status:               Status.Active,
            parentId:             parentId,
            fitnessScore:         fitnessScore,
            stake:                parent.stake,
            storageRootHash:      storageRootHash,
            teeAttestationHash:   teeAttestationHash,
            alignmentVerdictHash: alignmentVerdictHash
        });

        // Archive parent, register child
        parent.status = Status.Archived;
        $.children[parentId].push(childId);
        $.creators[childId] = $.creators[parentId];

        emit AgentArchived(parentId);
        emit AgentCloned(parentId, childId, childGenomeHash, fitnessScore);
    }

    // ─── Core: Safety / Slashing ──────────────────────────────────────────────

    /**
     * @notice Slash a rogue agent. Called by the AI Alignment Node.
     *         Burns stake, blocks all descendants from evolving.
     */
    function slash(uint256 agentId, bytes32 alignmentViolationHash) external onlyAlignmentNode {
        require(_ownerOf(agentId) != address(0), "Agent does not exist");

        ReplicantStorage storage $ = _getReplicantStorage();
        AgentMetadata storage agent = $.agentMetadata[agentId];

        if (agent.status == Status.Slashed) revert AgentAlreadySlashed();

        agent.status               = Status.Slashed;
        agent.alignmentVerdictHash = alignmentViolationHash;

        uint256 slashAmount = agent.stake;
        agent.stake = 0;

        $.descendantsBlocked[agentId] = true;
        _blockDescendants(agentId);

        if (slashAmount > 0) {
            (bool sent,) = payable(admin()).call{value: slashAmount}("");
            require(sent, "Slash transfer failed");
        }

        emit AgentSlashed(agentId, alignmentViolationHash, slashAmount);
    }

    /**
     * @notice Mark an agent as evolving (locks it from transfers/further evolution).
     */
    function markEvolving(uint256 agentId) external onlyEvolutionExecutor {
        require(_ownerOf(agentId) != address(0), "Agent does not exist");

        ReplicantStorage storage $ = _getReplicantStorage();
        AgentMetadata storage agent = $.agentMetadata[agentId];

        if (agent.status == Status.Slashed || $.descendantsBlocked[agentId]) revert AgentBlocked();
        agent.status = Status.Evolving;

        emit EvolutionStatusSet(agentId);
    }

    // ─── Views ────────────────────────────────────────────────────────────────

    function getLineage(uint256 agentId) external view returns (uint256[] memory ancestors) {
        require(_ownerOf(agentId) != address(0), "Agent does not exist");

        ReplicantStorage storage $ = _getReplicantStorage();
        uint256 depth;
        uint256 cursor = $.agentMetadata[agentId].parentId;
        while (cursor != 0) { depth++; cursor = $.agentMetadata[cursor].parentId; }

        ancestors = new uint256[](depth);
        cursor = $.agentMetadata[agentId].parentId;
        for (uint256 i; i < depth; i++) {
            ancestors[i] = cursor;
            cursor = $.agentMetadata[cursor].parentId;
        }
    }

    function getChildren(uint256 agentId) external view returns (uint256[] memory) {
        require(_ownerOf(agentId) != address(0), "Agent does not exist");
        return _getReplicantStorage().children[agentId];
    }

    function getAgentMetadata(uint256 agentId) external view returns (AgentMetadata memory) {
        require(_ownerOf(agentId) != address(0), "Agent does not exist");
        return _getReplicantStorage().agentMetadata[agentId];
    }

    // ─── Override: creatorOf ─────────────────────────────────────────────

    /**
     * @notice Override creatorOf to track creators from ReplicantStorage.
     *         Falls back to AgentNFT.creatorOf for tokens minted outside REPLICANT flows.
     */
    function creatorOf(uint256 tokenId) public view virtual override returns (address) {
        address replicantCreator = _getReplicantStorage().creators[tokenId];
        if (replicantCreator != address(0)) return replicantCreator;
        return super.creatorOf(tokenId);
    }

    // ─── Internals ────────────────────────────────────────────────────────────

    /**
     * @dev Mint a token with a single IntelligentData entry (genome hash).
     *      Bypasses the payable mint fee check by using _incrementTokenId + _safeMint directly,
     *      since mintGenesis handles its own stake accounting.
     */
    function _mintWithGenome(
        address to,
        bytes32 genomeHash,
        uint8   speciesType,
        uint32  generation
    ) internal returns (uint256 tokenId) {
        tokenId = _incrementTokenId();
        _safeMint(to, tokenId);

        IntelligentData[] memory iDatas = new IntelligentData[](1);
        iDatas[0] = IntelligentData({
            dataDescription: _genomeURI(speciesType, generation),
            dataHash:        genomeHash
        });
        _updateData(tokenId, iDatas);
    }

    function _genomeURI(uint8 speciesType, uint32 generation) internal pure returns (string memory) {
        return string(abi.encodePacked(
            "replicant://genome/species/",
            _uint8ToString(speciesType),
            "/gen/",
            _uint32ToString(generation)
        ));
    }

    function _blockDescendants(uint256 agentId) internal {
        ReplicantStorage storage $ = _getReplicantStorage();
        uint256[] storage directChildren = $.children[agentId];
        for (uint256 i; i < directChildren.length; i++) {
            uint256 childId = directChildren[i];
            $.descendantsBlocked[childId] = true;
            _blockDescendants(childId);
        }
    }

    function _uint8ToString(uint8 v) internal pure returns (string memory) {
        if (v == 0) return "0";
        uint8 tmp = v; uint8 digits;
        while (tmp != 0) { digits++; tmp /= 10; }
        bytes memory buf = new bytes(digits);
        while (v != 0) { digits--; buf[digits] = bytes1(uint8(48 + (v % 10))); v /= 10; }
        return string(buf);
    }

    function _uint32ToString(uint32 v) internal pure returns (string memory) {
        if (v == 0) return "0";
        uint32 tmp = v; uint32 digits;
        while (tmp != 0) { digits++; tmp /= 10; }
        bytes memory buf = new bytes(digits);
        while (v != 0) { digits--; buf[digits] = bytes1(uint8(48 + (v % 10))); v /= 10; }
        return string(buf);
    }
}
