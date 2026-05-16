// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract OracleKeeperOracle {
    struct PriceData {
        bytes32 priceHash;
        bytes32 teeAttestation;
        uint256 timestamp;
        uint256 agentId;
        string pair;
        uint256 price;
        uint256 twap;
        uint8 confidence;
        string riskLevel;
        uint8 sourcesUsed;
        uint8 sourcesRejected;
        bool verified;
    }

    struct AgentConfig {
        address owner;
        uint256 genesisTimestamp;
        bytes32 latestGenomeHash;
        bool active;
        uint256 stake;
        uint256 totalPublications;
        uint256 badPublications;
        uint256 currentStreak;
        uint256 bestStreak;
    }

    mapping(uint256 => AgentConfig) public agents;
    mapping(string => PriceData[]) public priceHistory;
    mapping(bytes32 => bool) public verifiedPrices;
    mapping(string => PriceData) public latestPrices;

    uint256 public nextAgentId = 1;
    uint256 public constant STALE_THRESHOLD = 300;
    address public admin;

    event AgentMinted(uint256 indexed agentId, address indexed owner, bytes32 genomeHash);
    event PricePublished(uint256 indexed agentId, string indexed pair, uint256 price, uint8 confidence, string riskLevel, bytes32 teeAttestation);
    event BadPriceReported(uint256 indexed agentId, string indexed pair, uint256 reportedPrice, uint256 truePrice, uint256 deviation);
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
            owner: msg.sender, genesisTimestamp: block.timestamp, latestGenomeHash: _genomeHash,
            active: true, stake: msg.value, totalPublications: 0, badPublications: 0,
            currentStreak: 0, bestStreak: 0
        });
        emit AgentMinted(agentId, msg.sender, _genomeHash);
    }

    function publishPrice(
        uint256 _agentId, bytes32 _priceHash, bytes32 _teeAttestation,
        string calldata _pair, uint256 _price, uint256 _twap, uint8 _confidence,
        string calldata _riskLevel, uint8 _sourcesUsed, uint8 _sourcesRejected
    ) external onlyAdmin {
        require(agents[_agentId].active, "Not active");
        priceHistory[_pair].push(PriceData({
            priceHash: _priceHash, teeAttestation: _teeAttestation, timestamp: block.timestamp,
            agentId: _agentId, pair: _pair, price: _price, twap: _twap,
            confidence: _confidence, riskLevel: _riskLevel, sourcesUsed: _sourcesUsed,
            sourcesRejected: _sourcesRejected, verified: false
        }));
        latestPrices[_pair] = priceHistory[_pair][priceHistory[_pair].length - 1];
        AgentConfig storage agent = agents[_agentId];
        agent.totalPublications++;
        agent.currentStreak++;
        if (agent.currentStreak > agent.bestStreak) agent.bestStreak = agent.currentStreak;
        emit PricePublished(_agentId, _pair, _price, _confidence, _riskLevel, _teeAttestation);
    }

    function reportBadPrice(uint256 _agentId, string calldata _pair, uint256 _reportedPrice, uint256 _truePrice) external {
        require(agents[_agentId].active, "Not active");
        uint256 deviation = _reportedPrice > _truePrice
            ? ((_reportedPrice - _truePrice) * 10000) / _truePrice
            : ((_truePrice - _reportedPrice) * 10000) / _truePrice;
        if (deviation > 100) {
            AgentConfig storage agent = agents[_agentId];
            agent.badPublications++;
            agent.currentStreak = 0;
            emit BadPriceReported(_agentId, _pair, _reportedPrice, _truePrice, deviation);
            if (agent.totalPublications >= 50 && ((agent.totalPublications - agent.badPublications) * 100) / agent.totalPublications < 98) {
                emit AgentEvolved(_agentId, 0, "Accuracy threshold breached");
            }
        }
    }

    function getPrice(string calldata _pair) external view returns (PriceData memory) {
        PriceData memory latest = latestPrices[_pair];
        require(latest.price > 0, "No price");
        require(block.timestamp - latest.timestamp < STALE_THRESHOLD, "Stale");
        return latest;
    }

    function getAgentAccuracy(uint256 _agentId) external view returns (uint256 accuracy, uint256 streak) {
        AgentConfig storage agent = agents[_agentId];
        if (agent.totalPublications == 0) return (0, 0);
        accuracy = ((agent.totalPublications - agent.badPublications) * 100) / agent.totalPublications;
        streak = agent.currentStreak;
    }

    receive() external payable {}
}
