// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ReplicantEvolutionCoordinator
 * @notice Orchestrates the evolution lifecycle: request → TEE execution → clone or slash.
 *
 * Targets ReplicantAgentNFT (ERC-7857 upgradeable) which handles TEE proofs internally
 * via cloneWithEvolution. The coordinator passes through TransferValidityProofs from the
 * TEE executor so the sealed handover can be verified on-chain.
 */

import "./0g/interfaces/IERC7857DataVerifier.sol";

interface IReplicantEvolvableAgent {
    function ownerOf(uint256 tokenId) external view returns (address);
    function markEvolving(uint256 agentId) external;
    function cloneWithEvolution(
        uint256 parentId,
        bytes32 childGenomeHash,
        bytes32 storageRootHash,
        bytes32 teeAttestationHash,
        bytes32 alignmentVerdictHash,
        uint256 fitnessScore,
        TransferValidityProof[] calldata proofs
    ) external returns (uint256 childId);
    function slash(uint256 agentId, bytes32 alignmentViolationHash) external;
}

contract ReplicantEvolutionCoordinator {
    enum RequestStatus { Pending, Completed, Failed }

    struct EvolutionRequest {
        uint256       parentId;
        address       requester;
        RequestStatus status;
        bytes32       parentGenomeHash;
        bytes32       performanceHistoryHash;
        uint256       createdAt;
        uint256       childId;
    }

    IReplicantEvolvableAgent public immutable AGENT_CONTRACT;
    address public owner;
    address public teeExecutor;
    uint256 public requestCount;

    mapping(uint256 => EvolutionRequest) public requests;

    event EvolutionRequested(
        uint256 indexed requestId,
        uint256 indexed parentId,
        address indexed requester,
        bytes32 parentGenomeHash,
        bytes32 performanceHistoryHash
    );
    event EvolutionCompleted(
        uint256 indexed requestId,
        uint256 indexed parentId,
        uint256 indexed childId,
        bytes32 childGenomeHash,
        bytes32 teeAttestationHash,
        bytes32 alignmentVerdictHash,
        uint256 fitnessScore
    );
    event EvolutionFailed(uint256 indexed requestId, uint256 indexed parentId, bytes32 reasonHash);

    error NotOwner();
    error NotTEEExecutor();
    error NotAgentOwner();
    error InvalidRequest();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    modifier onlyTeeExecutor() {
        if (msg.sender != teeExecutor) revert NotTEEExecutor();
        _;
    }

    constructor(address agentContractAddress) {
        AGENT_CONTRACT = IReplicantEvolvableAgent(agentContractAddress);
        owner          = msg.sender;
        teeExecutor    = msg.sender;
    }

    function setTeeExecutor(address executor) external onlyOwner {
        teeExecutor = executor;
    }

    /**
     * @notice Agent owner requests evolution. Locks the agent as Evolving.
     * @param parentId               Token ID of the agent to evolve
     * @param parentGenomeHash       0G Storage root hash of the parent genome
     * @param performanceHistoryHash 0G Storage root hash of performance history
     */
    function requestEvolution(
        uint256 parentId,
        bytes32 parentGenomeHash,
        bytes32 performanceHistoryHash
    ) external returns (uint256 requestId) {
        if (AGENT_CONTRACT.ownerOf(parentId) != msg.sender) revert NotAgentOwner();

        requestId = ++requestCount;
        requests[requestId] = EvolutionRequest({
            parentId:               parentId,
            requester:              msg.sender,
            status:                 RequestStatus.Pending,
            parentGenomeHash:       parentGenomeHash,
            performanceHistoryHash: performanceHistoryHash,
            createdAt:              block.timestamp,
            childId:                0
        });

        AGENT_CONTRACT.markEvolving(parentId);

        emit EvolutionRequested(requestId, parentId, msg.sender, parentGenomeHash, performanceHistoryHash);
    }

    /**
     * @notice TEE executor submits evolution result with sealed TEE transfer proofs.
     * @param requestId            The evolution request ID
     * @param childGenomeHash      Encrypted genome hash of the evolved child
     * @param storageRootHash      0G Storage root hash for child genome blob
     * @param teeAttestationHash   TEE attestation hash from 0G Compute
     * @param alignmentVerdictHash Alignment Node verdict hash
     * @param fitnessScore         Child fitness score (species-specific metric)
     * @param proofs               TEE TransferValidityProofs for sealed handover
     */
    function completeEvolution(
        uint256 requestId,
        bytes32 childGenomeHash,
        bytes32 storageRootHash,
        bytes32 teeAttestationHash,
        bytes32 alignmentVerdictHash,
        uint256 fitnessScore,
        TransferValidityProof[] calldata proofs
    ) external onlyTeeExecutor returns (uint256 childId) {
        EvolutionRequest storage request = requests[requestId];
        if (request.status != RequestStatus.Pending) revert InvalidRequest();

        childId = AGENT_CONTRACT.cloneWithEvolution(
            request.parentId,
            childGenomeHash,
            storageRootHash,
            teeAttestationHash,
            alignmentVerdictHash,
            fitnessScore,
            proofs
        );

        request.status  = RequestStatus.Completed;
        request.childId = childId;

        emit EvolutionCompleted(
            requestId,
            request.parentId,
            childId,
            childGenomeHash,
            teeAttestationHash,
            alignmentVerdictHash,
            fitnessScore
        );
    }

    /**
     * @notice TEE executor reports a failed evolution (bad alignment verdict or compute error).
     * @param slashParent If true, the parent agent is slashed (alignment violation).
     */
    function failEvolution(
        uint256 requestId,
        bytes32 reasonHash,
        bool    slashParent
    ) external onlyTeeExecutor {
        EvolutionRequest storage request = requests[requestId];
        if (request.status != RequestStatus.Pending) revert InvalidRequest();

        request.status = RequestStatus.Failed;

        if (slashParent) {
            AGENT_CONTRACT.slash(request.parentId, reasonHash);
        }

        emit EvolutionFailed(requestId, request.parentId, reasonHash);
    }
}