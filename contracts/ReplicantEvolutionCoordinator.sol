// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IReplicantEvolutionAgentID {
    function ownerOf(uint256 tokenId) external view returns (address);
    function markEvolving(uint256 agentId) external;
    function cloneWithProof(
        uint256 parentId,
        bytes32 childGenomeHash,
        bytes32 storageRootHash,
        bytes32 teeAttestationHash,
        bytes32 alignmentVerdictHash,
        uint256 fitnessScore
    ) external returns (uint256 childId);
    function slash(uint256 agentId, bytes32 alignmentViolationHash) external;
}

contract ReplicantEvolutionCoordinator {
    enum RequestStatus {
        Pending,
        Completed,
        Failed
    }

    struct EvolutionRequest {
        uint256 parentId;
        address requester;
        RequestStatus status;
        bytes32 parentGenomeHash;
        bytes32 performanceHistoryHash;
        uint256 createdAt;
        uint256 childId;
    }

    IReplicantEvolutionAgentID public immutable AGENT_ID;
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

    constructor(address agentIdAddress) {
        AGENT_ID = IReplicantEvolutionAgentID(agentIdAddress);
        owner = msg.sender;
        teeExecutor = msg.sender;
    }

    function setTeeExecutor(address executor) external onlyOwner {
        teeExecutor = executor;
    }

    function requestEvolution(uint256 parentId, bytes32 parentGenomeHash, bytes32 performanceHistoryHash)
        external
        returns (uint256 requestId)
    {
        if (AGENT_ID.ownerOf(parentId) != msg.sender) revert NotAgentOwner();

        requestId = ++requestCount;
        requests[requestId] = EvolutionRequest({
            parentId: parentId,
            requester: msg.sender,
            status: RequestStatus.Pending,
            parentGenomeHash: parentGenomeHash,
            performanceHistoryHash: performanceHistoryHash,
            createdAt: block.timestamp,
            childId: 0
        });
        AGENT_ID.markEvolving(parentId);

        emit EvolutionRequested(requestId, parentId, msg.sender, parentGenomeHash, performanceHistoryHash);
    }

    function completeEvolution(
        uint256 requestId,
        bytes32 childGenomeHash,
        bytes32 storageRootHash,
        bytes32 teeAttestationHash,
        bytes32 alignmentVerdictHash,
        uint256 fitnessScore
    ) external onlyTeeExecutor returns (uint256 childId) {
        EvolutionRequest storage request = requests[requestId];
        if (request.status != RequestStatus.Pending) revert InvalidRequest();

        childId = AGENT_ID.cloneWithProof(
            request.parentId,
            childGenomeHash,
            storageRootHash,
            teeAttestationHash,
            alignmentVerdictHash,
            fitnessScore
        );
        request.status = RequestStatus.Completed;
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

    function failEvolution(uint256 requestId, bytes32 reasonHash, bool slashParent) external onlyTeeExecutor {
        EvolutionRequest storage request = requests[requestId];
        if (request.status != RequestStatus.Pending) revert InvalidRequest();

        request.status = RequestStatus.Failed;
        if (slashParent) {
            AGENT_ID.slash(request.parentId, reasonHash);
        }

        emit EvolutionFailed(requestId, request.parentId, reasonHash);
    }
}
