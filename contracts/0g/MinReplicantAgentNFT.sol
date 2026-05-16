// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./extensions/ERC7857CloneableUpgradeable.sol";
import "./extensions/ERC7857AuthorizeUpgradeable.sol";
import "./extensions/ERC7857IDataStorageUpgradeable.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {ERC721Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import {IERC721Metadata} from "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

contract MinReplicantAgentNFT is
    ERC7857CloneableUpgradeable,
    ERC7857AuthorizeUpgradeable,
    ERC7857IDataStorageUpgradeable
{
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
        0xcbc114d7deca02d22bff45c72cbd811cde0b871ce1b1e04ae910c5b96cd53d00;

    function _getReplicantStorage() private pure returns (ReplicantStorage storage $) {
        assembly { $.slot := REPLICANT_STORAGE_LOCATION }
    }

    event GenesisMinted(uint256 indexed agentId, address indexed creator, bytes32 encryptedGenomeHash, uint8 speciesType);
    event AgentCloned(uint256 indexed parentId, uint256 indexed childId, bytes32 childGenomeHash, uint256 fitnessScore);
    event AgentArchived(uint256 indexed agentId);
    event AgentSlashed(uint256 indexed agentId, bytes32 alignmentViolationHash, uint256 slashAmount);
    event EvolutionStatusSet(uint256 indexed agentId);

    error NotEvolutionExecutor();
    error NotAlignmentNode();
    error AgentBlocked();
    error AgentAlreadySlashed();
    error NotAdmin();

    modifier onlyAdmin() {
        if (msg.sender != admin) revert NotAdmin();
        _;
    }

    address public admin;
    address public evolutionExecutor;
    address public alignmentNode;

    constructor() {
        _disableInitializers();
    }

    function initialize(
        string memory name_,
        string memory symbol_,
        address verifierAddr,
        address admin_,
        address evolutionExecutor_,
        address alignmentNode_
    ) external initializer {
        require(verifierAddr != address(0), "Zero address");
        require(admin_ != address(0), "Invalid admin address");
        __ERC7857_init(name_, symbol_, verifierAddr);
        admin = admin_;
        evolutionExecutor = evolutionExecutor_;
        alignmentNode = alignmentNode_;

        // Seed nextTokenId to 1 so token IDs start at 1 (token 0 is invalid in ERC721).
        // ERC7857CloneableStorage slot: keccak256(abi.encode(uint256(keccak256("0g.storage.ERC7857Cloneable")) - 1)) & ~bytes32(uint256(0xff))
        bytes32 cloneableSlot = 0x03de6cf14ecf4575e0ed0cc2fdb9b7ee13500cb3c0c403254fc893bf6e0c8000;
        assembly { sstore(cloneableSlot, 1) }
    }

    function setEvolutionExecutor(address executor) external onlyAdmin { evolutionExecutor = executor; }
    function setAlignmentNode(address node) external onlyAdmin { alignmentNode = node; }

    /// @notice Returns the total number of tokens minted (nextTokenId - 1 since we seed at 1).
    function totalSupply() external view returns (uint256) {
        // Read nextTokenId from ERC7857CloneableStorage slot directly
        bytes32 slot = 0x03de6cf14ecf4575e0ed0cc2fdb9b7ee13500cb3c0c403254fc893bf6e0c8000;
        uint256 next;
        assembly { next := sload(slot) }
        return next > 0 ? next - 1 : 0;
    }

    // ─── Metadata URI ─────────────────────────────────────────────────────────

    string private _metadataBaseURI;

    /// @notice Set the base URI for tokenURI. Must end with "/".
    ///         tokenURI(n) returns "<baseURI><n>" — block explorers fetch this URL.
    function setBaseURI(string calldata newBaseURI) external onlyAdmin {
        _metadataBaseURI = newBaseURI;
    }

    function tokenURI(uint256 tokenId) public view virtual override(ERC721Upgradeable, IERC721Metadata) returns (string memory) {
        _requireOwned(tokenId);
        string memory base = _metadataBaseURI;
        if (bytes(base).length > 0) {
            return string(abi.encodePacked(base, Strings.toString(tokenId)));
        }
        // On-chain fallback: build a minimal JSON data URI so block explorers always work
        ReplicantStorage storage $ = _getReplicantStorage();
        AgentMetadata storage meta = $.agentMetadata[tokenId];
        return string(abi.encodePacked(
            'data:application/json;base64,',
            _base64(abi.encodePacked(
                '{"name":"', _speciesName(meta.speciesType), ' #', Strings.toString(tokenId),
                '","description":"REPLICANT autonomous AI agent on 0G network.",',
                '"attributes":[{"trait_type":"Species","value":"', _speciesName(meta.speciesType),
                '"},{"trait_type":"Generation","value":', Strings.toString(meta.generation),
                '},{"trait_type":"Status","value":"', _statusStr(meta.status), '"}]}'
            ))
        ));
    }

    function _speciesName(uint8 t) internal pure returns (string memory) {
        if (t == 0) return "AlphaHunter";
        if (t == 1) return "CodeWeaver";
        if (t == 2) return "GameMaster";
        if (t == 3) return "DocuMind";
        if (t == 4) return "OracleKeeper";
        if (t == 5) return "SocialSynth";
        return "Unknown";
    }

    function _statusStr(Status s) internal pure returns (string memory) {
        if (s == Status.Active)   return "Active";
        if (s == Status.Archived) return "Archived";
        if (s == Status.Slashed)  return "Slashed";
        return "Evolving";
    }

    // Minimal base64 encoder for on-chain JSON
    function _base64(bytes memory data) internal pure returns (string memory) {
        bytes memory TABLE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        uint256 len = data.length;
        if (len == 0) return "";
        uint256 encodedLen = 4 * ((len + 2) / 3);
        bytes memory result = new bytes(encodedLen);
        uint256 i = 0;
        uint256 j = 0;
        while (i < len) {
            uint256 a = i < len ? uint8(data[i++]) : 0;
            uint256 b = i < len ? uint8(data[i++]) : 0;
            uint256 c = i < len ? uint8(data[i++]) : 0;
            uint256 triple = (a << 16) | (b << 8) | c;
            result[j++] = TABLE[(triple >> 18) & 0x3F];
            result[j++] = TABLE[(triple >> 12) & 0x3F];
            result[j++] = TABLE[(triple >> 6) & 0x3F];
            result[j++] = TABLE[triple & 0x3F];
        }
        // Padding
        if (len % 3 == 1) { result[encodedLen - 1] = "="; result[encodedLen - 2] = "="; }
        else if (len % 3 == 2) { result[encodedLen - 1] = "="; }
        return string(result);
    }

    function mintGenesis(bytes32 encryptedGenomeHash, uint8 speciesType)
        external payable returns (uint256 agentId)
    {
        require(speciesType < 6, "Invalid species");
        agentId = _incrementTokenId();
        _safeMint(msg.sender, agentId);

        // Store the encrypted genome as intelligent data (ERC-7857 iNFT)
        IntelligentData[] memory iDatas = new IntelligentData[](1);
        iDatas[0] = IntelligentData({
            dataDescription: _genomeURI(speciesType, 0),
            dataHash: encryptedGenomeHash
        });
        _updateData(agentId, iDatas);

        ReplicantStorage storage $ = _getReplicantStorage();
        $.agentMetadata[agentId] = AgentMetadata({
            speciesType: speciesType, generation: 0, status: Status.Active,
            parentId: 0, fitnessScore: 0, stake: msg.value,
            storageRootHash: bytes32(0), teeAttestationHash: bytes32(0), alignmentVerdictHash: bytes32(0)
        });
        $.creators[agentId] = msg.sender;
        emit GenesisMinted(agentId, msg.sender, encryptedGenomeHash, speciesType);
    }

    function _genomeURI(uint8 speciesType, uint32 generation) internal pure returns (string memory) {
        return string(abi.encodePacked(
            "replicant://genome/species/",
            Strings.toString(speciesType),
            "/gen/",
            Strings.toString(generation)
        ));
    }

    function slash(uint256 agentId, bytes32 alignmentViolationHash) external {
        if (msg.sender != alignmentNode) revert NotAlignmentNode();
        ReplicantStorage storage $ = _getReplicantStorage();
        AgentMetadata storage agent = $.agentMetadata[agentId];
        if (agent.status == Status.Slashed) revert AgentAlreadySlashed();
        agent.status = Status.Slashed;
        agent.alignmentVerdictHash = alignmentViolationHash;
        uint256 slashAmount = agent.stake;
        agent.stake = 0;
        $.descendantsBlocked[agentId] = true;
        if (slashAmount > 0) {
            (bool sent,) = payable(admin).call{value: slashAmount}("");
            require(sent, "Slash transfer failed");
        }
        emit AgentSlashed(agentId, alignmentViolationHash, slashAmount);
    }

    function markEvolving(uint256 agentId) external {
        if (msg.sender != evolutionExecutor) revert NotEvolutionExecutor();
        ReplicantStorage storage $ = _getReplicantStorage();
        if ($.agentMetadata[agentId].status == Status.Slashed || $.descendantsBlocked[agentId]) revert AgentBlocked();
        $.agentMetadata[agentId].status = Status.Evolving;
        emit EvolutionStatusSet(agentId);
    }

    function cloneWithEvolution(
        uint256 parentId,
        bytes32 childGenomeHash,
        bytes32 storageRootHash,
        bytes32 teeAttestationHash,
        bytes32 alignmentVerdictHash,
        uint256 fitnessScore,
        TransferValidityProof[] calldata proofs
    ) external returns (uint256 childId) {
        if (msg.sender != evolutionExecutor) revert NotEvolutionExecutor();
        ReplicantStorage storage $ = _getReplicantStorage();
        AgentMetadata storage parent = $.agentMetadata[parentId];

        require(_ownerOf(parentId) != address(0), "Parent does not exist");
        if (parent.status == Status.Slashed || $.descendantsBlocked[parentId]) revert AgentBlocked();

        address currentOwner = _ownerOf(parentId);

        // For MinReplicant, we always mint a new token (no cloning with proofs)
        childId = _incrementTokenId();
        _safeMint(currentOwner, childId);

        // Store the child genome as intelligent data
        IntelligentData[] memory iDatas = new IntelligentData[](1);
        iDatas[0] = IntelligentData({
            dataDescription: _genomeURI(parent.speciesType, parent.generation + 1),
            dataHash: childGenomeHash
        });
        _updateData(childId, iDatas);

        $.agentMetadata[childId] = AgentMetadata({
            speciesType: parent.speciesType,
            generation: parent.generation + 1,
            status: Status.Active,
            parentId: parentId,
            fitnessScore: fitnessScore,
            stake: parent.stake,
            storageRootHash: storageRootHash,
            teeAttestationHash: teeAttestationHash,
            alignmentVerdictHash: alignmentVerdictHash
        });

        parent.status = Status.Archived;
        $.children[parentId].push(childId);
        $.creators[childId] = $.creators[parentId];

        emit AgentArchived(parentId);
        emit AgentCloned(parentId, childId, childGenomeHash, fitnessScore);
    }

    function getLineage(uint256 agentId) external view returns (uint256[] memory ancestors) {
        ReplicantStorage storage $ = _getReplicantStorage();
        uint256 depth;
        uint256 cursor = $.agentMetadata[agentId].parentId;
        while (cursor != 0) { depth++; cursor = $.agentMetadata[cursor].parentId; }
        ancestors = new uint256[](depth);
        cursor = $.agentMetadata[agentId].parentId;
        for (uint256 i; i < depth; i++) { ancestors[i] = cursor; cursor = $.agentMetadata[cursor].parentId; }
    }

    function getChildren(uint256 agentId) external view returns (uint256[] memory) {
        return _getReplicantStorage().children[agentId];
    }

    function getAgentMetadata(uint256 agentId) external view returns (AgentMetadata memory) {
        return _getReplicantStorage().agentMetadata[agentId];
    }

    function creatorOf(uint256 tokenId) external view returns (address) {
        address c = _getReplicantStorage().creators[tokenId];
        if (c != address(0)) return c;
        return address(0);
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC7857Upgradeable, IERC165) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function _update(address to, uint256 tokenId, address auth) internal virtual override(ERC721Upgradeable, ERC7857AuthorizeUpgradeable) returns (address) {
        return super._update(to, tokenId, auth);
    }

    function _updateData(uint256 tokenId, IntelligentData[] memory newDatas) internal override(ERC7857IDataStorageUpgradeable, ERC7857Upgradeable) {
        ERC7857IDataStorageUpgradeable._updateData(tokenId, newDatas);
    }

    function _intelligentDatasOf(uint tokenId) internal view virtual override(ERC7857IDataStorageUpgradeable, ERC7857Upgradeable) returns (IntelligentData[] memory) {
        return ERC7857IDataStorageUpgradeable._intelligentDatasOf(tokenId);
    }

    function _intelligentDatasLengthOf(uint tokenId) internal view virtual override(ERC7857IDataStorageUpgradeable, ERC7857Upgradeable) returns (uint) {
        return ERC7857IDataStorageUpgradeable._intelligentDatasLengthOf(tokenId);
    }
}

contract MinReplicantAgentNFTProxy {
    function deploy(
        string memory name_,
        string memory symbol_,
        address verifierAddr,
        address admin_,
        address evolutionExecutor_,
        address alignmentNode_
    ) external returns (MinReplicantAgentNFT) {
        MinReplicantAgentNFT impl = new MinReplicantAgentNFT();
        ERC1967Proxy proxy = new ERC1967Proxy(
            address(impl),
            abi.encodeWithSelector(
                MinReplicantAgentNFT.initialize.selector,
                name_, symbol_, verifierAddr, admin_, evolutionExecutor_, alignmentNode_
            )
        );
        return MinReplicantAgentNFT(address(proxy));
    }
}