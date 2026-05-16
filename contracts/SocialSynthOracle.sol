// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SocialSynthOracle {
    struct ContentPiece {
        bytes32 contentHash;
        string platform;
        string contentFormat;
        string topic;
        string tone;
        uint256 predictedEngagement;
        bytes32 teeAttestation;
        uint256 timestamp;
        bool published;
    }

    struct AgentConfig {
        address owner;
        uint256 genesisTimestamp;
        bytes32 latestGenomeHash;
        bool active;
        uint256 stake;
        uint256 totalGenerations;
        uint256 totalPublications;
        uint256 lowEngagementCount;
        uint256 currentStreak;
        uint256 bestStreak;
        string dominantTone;
        string dominantFormat;
    }

    mapping(uint256 => AgentConfig) public agents;
    mapping(uint256 => ContentPiece[]) public agentContent;

    uint256 public nextAgentId = 1;
    address public admin;

    event AgentMinted(uint256 indexed agentId, address indexed owner, bytes32 genomeHash);
    event ContentGenerated(uint256 indexed agentId, bytes32 indexed contentHash, string platform, string contentFormat, uint256 predictedEngagement);
    event ContentPublished(uint256 indexed agentId, bytes32 indexed contentHash, string platformPostId);
    event AgentEvolved(uint256 indexed parentId, uint256 indexed childId, string reason, string newTone, string newFormat);

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
            owner: msg.sender, genesisTimestamp: block.timestamp, latestGenomeHash: _genomeHash,
            active: true, stake: msg.value, totalGenerations: 0, totalPublications: 0,
            lowEngagementCount: 0, currentStreak: 0, bestStreak: 0,
            dominantTone: "educational", dominantFormat: "thread"
        });
        emit AgentMinted(agentId, msg.sender, _genomeHash);
    }

    function registerGeneration(uint256 _agentId, bytes32 _contentHash, string calldata _platform,
        string calldata _contentFormat, string calldata _topic, string calldata _tone,
        uint256 _predictedEngagement, bytes32 _teeAttestation
    ) external onlyAdmin {
        require(agents[_agentId].active, "Not active");
        agentContent[_agentId].push(ContentPiece({
            contentHash: _contentHash, platform: _platform, contentFormat: _contentFormat,
            topic: _topic, tone: _tone, predictedEngagement: _predictedEngagement,
            teeAttestation: _teeAttestation, timestamp: block.timestamp, published: false
        }));
        agents[_agentId].totalGenerations++;
        emit ContentGenerated(_agentId, _contentHash, _platform, _contentFormat, _predictedEngagement);
    }

    function markPublished(uint256 _agentId, bytes32 _contentHash, string calldata _platformPostId) external onlyAdmin {
        require(agents[_agentId].active, "Not active");
        ContentPiece[] storage contents = agentContent[_agentId];
        for (uint256 i = 0; i < contents.length; i++) {
            if (contents[i].contentHash == _contentHash && !contents[i].published) {
                contents[i].published = true;
                agents[_agentId].totalPublications++;
                break;
            }
        }
        emit ContentPublished(_agentId, _contentHash, _platformPostId);
    }

    function getAgentStats(uint256 _agentId) external view returns (
        uint256 totalGenerations, uint256 totalPublications,
        uint256 currentStreak, uint256 bestStreak,
        string memory dominantTone, string memory dominantFormat
    ) {
        AgentConfig storage agent = agents[_agentId];
        return (agent.totalGenerations, agent.totalPublications,
            agent.currentStreak, agent.bestStreak,
            agent.dominantTone, agent.dominantFormat);
    }

    receive() external payable {}
}
