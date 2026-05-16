// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract GameMasterOracle {
    bytes32 public constant TEE_ORACLE_ROLE = keccak256("TEE_ORACLE_ROLE");

    struct GameMove {
        bytes32 moveHash;
        bytes32 teeAttestation;
        uint256 timestamp;
        uint256 agentId;
        string gameType;
        string strategy;
        uint8 confidence;
        string reasoning;
    }

    struct GameResult {
        bytes32 gameId;
        string winner;
        uint256 agentMoves;
        uint256 humanMoves;
        uint256 duration;
        bytes32 finalStateHash;
    }

    struct AgentConfig {
        address owner;
        uint256 genesisTimestamp;
        bytes32 latestGenomeHash;
        bool active;
        uint256 stake;
        uint256 gamesPlayed;
        uint256 gamesWon;
        uint256 gamesLost;
        uint256 currentWinStreak;
        uint256 bestWinStreak;
    }

    mapping(uint256 => AgentConfig) public agents;
    mapping(uint256 => GameMove[]) public agentMoves;
    mapping(uint256 => GameResult[]) public agentGames;
    mapping(bytes32 => bool) public verifiedMoves;

    uint256 public nextAgentId = 1;
    address public admin;

    event AgentMinted(uint256 indexed agentId, address indexed owner, bytes32 genomeHash);
    event MovePublished(uint256 indexed agentId, bytes32 indexed gameId, bytes32 moveHash, string strategy, uint8 confidence);
    event GameCompleted(uint256 indexed agentId, bytes32 indexed gameId, string winner, uint256 duration);
    event WinStreakRecord(uint256 indexed agentId, uint256 streak);
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
            gamesPlayed: 0,
            gamesWon: 0,
            gamesLost: 0,
            currentWinStreak: 0,
            bestWinStreak: 0
        });

        emit AgentMinted(agentId, msg.sender, _genomeHash);
    }

    function publishMove(
        uint256 _agentId,
        bytes32 _gameId,
        bytes32 _moveHash,
        bytes32 _teeAttestation,
        string calldata _gameType,
        string calldata _strategy,
        uint8 _confidence,
        string calldata _reasoning
    ) external onlyAdmin {
        require(agents[_agentId].active, "Agent not active");

        agentMoves[_agentId].push(GameMove({
            moveHash: _moveHash,
            teeAttestation: _teeAttestation,
            timestamp: block.timestamp,
            agentId: _agentId,
            gameType: _gameType,
            strategy: _strategy,
            confidence: _confidence,
            reasoning: _reasoning
        }));

        emit MovePublished(_agentId, _gameId, _moveHash, _strategy, _confidence);
    }

    function reportGameResult(
        uint256 _agentId,
        bytes32 _gameId,
        string calldata _winner,
        uint256 _agentMoves,
        uint256 _humanMoves,
        bytes32 _finalStateHash
    ) external onlyAdmin {
        require(agents[_agentId].active, "Agent not active");

        AgentConfig storage agent = agents[_agentId];
        agent.gamesPlayed++;

        agentGames[_agentId].push(GameResult({
            gameId: _gameId,
            winner: _winner,
            agentMoves: _agentMoves,
            humanMoves: _humanMoves,
            duration: block.timestamp,
            finalStateHash: _finalStateHash
        }));

        if (keccak256(bytes(_winner)) == keccak256(bytes("agent"))) {
            agent.gamesWon++;
            agent.currentWinStreak++;
            if (agent.currentWinStreak > agent.bestWinStreak) {
                agent.bestWinStreak = agent.currentWinStreak;
                emit WinStreakRecord(_agentId, agent.bestWinStreak);
            }
        } else {
            agent.gamesLost++;
            agent.currentWinStreak = 0;
        }

        emit GameCompleted(_agentId, _gameId, _winner, block.timestamp);
    }

    function getAgentStats(uint256 _agentId) external view returns (
        uint256 gamesPlayed,
        uint256 gamesWon,
        uint256 gamesLost,
        uint256 winRate,
        uint256 bestStreak,
        uint256 currentStreak
    ) {
        AgentConfig storage agent = agents[_agentId];
        gamesPlayed = agent.gamesPlayed;
        gamesWon = agent.gamesWon;
        gamesLost = agent.gamesLost;
        winRate = agent.gamesPlayed > 0 ? (agent.gamesWon * 100) / agent.gamesPlayed : 0;
        bestStreak = agent.bestWinStreak;
        currentStreak = agent.currentWinStreak;
    }

    receive() external payable {}
}
