// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DocuMindOracle {
    bytes32 public constant TEE_ORACLE_ROLE = keccak256("TEE_ORACLE_ROLE");

    struct RiskFlag {
        string clauseType;
        string severity;
        uint256 lineStart;
        uint256 lineEnd;
        string text;
        string reason;
        string suggestion;
        string standardReference;
        uint8 confidence;
    }

    struct ClauseAnalysis {
        string id;
        string header;
        string text;
        uint256 lineStart;
        uint256 lineEnd;
        string classification;
        string riskLevel;
        string standardComparison;
        RiskFlag[] riskFlags;
        string summary;
    }

    struct AuditReport {
        bytes32 documentHash;
        string documentName;
        string jurisdiction;
        uint256 totalClauses;
        string overallRisk;
        uint256 criticalFlags;
        uint256 highFlags;
        uint256 mediumFlags;
        uint256 lowFlags;
        bytes32 teeAttestation;
        uint256 timestamp;
        bool verified;
    }

    struct AgentConfig {
        address owner;
        uint256 genesisTimestamp;
        bytes32 latestGenomeHash;
        bool active;
        uint256 stake;
        uint256 totalAudits;
        uint256 missedClauses;
    }

    mapping(uint256 => AgentConfig) public agents;
    mapping(uint256 => AuditReport[]) public agentAudits;
    mapping(bytes32 => bool) public verifiedReports;

    uint256 public nextAgentId = 1;
    address public admin;

    event AgentMinted(uint256 indexed agentId, address indexed owner, bytes32 genomeHash);
    event AuditPublished(uint256 indexed agentId, bytes32 indexed documentHash, string documentName, string riskLevel, uint256 totalFlags);
    event MissedClauseReported(uint256 indexed agentId, bytes32 documentHash, string missedClauseType);
    event AgentEvolved(uint256 indexed parentId, uint256 indexed childId, string reason);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function mintGenesis(bytes32 _genomeHash) external payable returns (uint256 agentId) {
        require(msg.value >= 0.01 ether, "Minimum stake 0.01 ETH");

        agentId = nextAgentId++;

        agents[agentId] = AgentConfig({
            owner: msg.sender,
            genesisTimestamp: block.timestamp,
            latestGenomeHash: _genomeHash,
            active: true,
            stake: msg.value,
            totalAudits: 0,
            missedClauses: 0
        });

        emit AgentMinted(agentId, msg.sender, _genomeHash);
    }

    function publishAudit(
        uint256 _agentId,
        bytes32 _documentHash,
        string calldata _documentName,
        string calldata _jurisdiction,
        uint256 _totalClauses,
        string calldata _overallRisk,
        uint256 _criticalFlags,
        uint256 _highFlags,
        uint256 _mediumFlags,
        uint256 _lowFlags,
        bytes32 _teeAttestation
    ) external onlyAdmin {
        require(agents[_agentId].active, "Agent not active");

        agentAudits[_agentId].push(AuditReport({
            documentHash: _documentHash,
            documentName: _documentName,
            jurisdiction: _jurisdiction,
            totalClauses: _totalClauses,
            overallRisk: _overallRisk,
            criticalFlags: _criticalFlags,
            highFlags: _highFlags,
            mediumFlags: _mediumFlags,
            lowFlags: _lowFlags,
            teeAttestation: _teeAttestation,
            timestamp: block.timestamp,
            verified: false
        }));

        agents[_agentId].totalAudits++;

        emit AuditPublished(_agentId, _documentHash, _documentName, _overallRisk, _criticalFlags + _highFlags + _mediumFlags + _lowFlags);
    }

    function reportMissedClause(uint256 _agentId, bytes32 _documentHash, string calldata _missedClauseType) external {
        require(agents[_agentId].active, "Agent not active");
        agents[_agentId].missedClauses++;

        emit MissedClauseReported(_agentId, _documentHash, _missedClauseType);

        if (agents[_agentId].missedClauses >= 3) {
            emit AgentEvolved(_agentId, 0, "Missed clause threshold");
        }
    }

    function getAgentStats(uint256 _agentId) external view returns (
        uint256 totalAudits, uint256 missedClauses, uint256 accuracyScore
    ) {
        AgentConfig storage agent = agents[_agentId];
        totalAudits = agent.totalAudits;
        missedClauses = agent.missedClauses;
        accuracyScore = agent.totalAudits > 0 ? ((agent.totalAudits - agent.missedClauses) * 100) / agent.totalAudits : 0;
    }

    receive() external payable {}
}
