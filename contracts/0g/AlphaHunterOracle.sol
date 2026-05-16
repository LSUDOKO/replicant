// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract AlphaHunterOracle is AccessControl, ReentrancyGuard {
    bytes32 public constant TEE_ORACLE_ROLE = keccak256("TEE_ORACLE_ROLE");
    bytes32 public constant ALIGNMENT_NODE_ROLE = keccak256("ALIGNMENT_NODE_ROLE");

    enum SignalType { HOLD, BUY, SELL }

    struct Signal {
        bytes32 signalHash;
        bytes32 teeAttestation;
        uint256 timestamp;
        uint256 agentId;
        SignalType signalType;
        uint8 confidence;
        bool verified;
        string target;
        string reasoning;
    }

    struct AgentConfig {
        address owner;
        uint256 genesisTimestamp;
        uint8 speciesType;
        bytes32 latestGenomeHash;
        bool active;
        uint256 stake;
    }

    mapping(uint256 => AgentConfig) public agents;
    mapping(uint256 => Signal[]) public agentSignals;
    mapping(bytes32 => bool) public verifiedSignals;
    mapping(uint256 => uint256) public signalCount;
    mapping(uint256 => uint256) public cumulativeAccuracy;

    uint256 public nextAgentId = 1;

    event AgentMinted(uint256 indexed agentId, address indexed owner, bytes32 genomeHash);
    event SignalPublished(
        uint256 indexed agentId,
        uint256 indexed signalIndex,
        bytes32 indexed signalHash,
        SignalType signalType,
        uint8 confidence,
        bytes32 teeAttestation,
        string target
    );
    event SignalVerified(uint256 indexed agentId, uint256 indexed signalIndex, bool passed);
    event AgentSlashed(uint256 indexed agentId, bytes32 reason);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(TEE_ORACLE_ROLE, msg.sender);
        _grantRole(ALIGNMENT_NODE_ROLE, msg.sender);
    }

    function mintGenesis(
        bytes32 _genomeHash,
        uint256 _stake
    ) external payable nonReentrant returns (uint256 agentId) {
        require(msg.value >= _stake, "Insufficient stake");
        require(_stake >= 0.01 ether, "Minimum stake 0.01 OG");

        agentId = nextAgentId++;
        
        agents[agentId] = AgentConfig({
            owner: msg.sender,
            genesisTimestamp: block.timestamp,
            speciesType: 0,
            latestGenomeHash: _genomeHash,
            active: true,
            stake: _stake
        });

        emit AgentMinted(agentId, msg.sender, _genomeHash);
    }

    function publishSignal(
        uint256 _agentId,
        bytes32 _signalHash,
        bytes32 _teeAttestation,
        SignalType _signalType,
        uint8 _confidence,
        string calldata _target,
        string calldata _reasoning
    ) external onlyRole(TEE_ORACLE_ROLE) nonReentrant {
        require(agents[_agentId].active, "Agent not active");
        require(_confidence <= 100, "Invalid confidence");
        require(_teeAttestation != bytes32(0), "Missing attestation");

        uint256 signalIndex = agentSignals[_agentId].length;
        
        Signal memory sig = Signal({
            signalHash: _signalHash,
            teeAttestation: _teeAttestation,
            timestamp: block.timestamp,
            agentId: _agentId,
            signalType: _signalType,
            confidence: _confidence,
            verified: false,
            target: _target,
            reasoning: _reasoning
        });

        agentSignals[_agentId].push(sig);
        signalCount[_agentId]++;
        verifiedSignals[_signalHash] = false;

        emit SignalPublished(_agentId, signalIndex, _signalHash, _signalType, _confidence, _teeAttestation, _target);
    }

    function verifySignal(
        uint256 _agentId,
        uint256 _signalIndex,
        bool _passed
    ) external onlyRole(ALIGNMENT_NODE_ROLE) {
        require(_signalIndex < agentSignals[_agentId].length, "Invalid signal index");
        
        Signal storage sig = agentSignals[_agentId][_signalIndex];
        sig.verified = _passed;
        verifiedSignals[sig.signalHash] = _passed;

        emit SignalVerified(_agentId, _signalIndex, _passed);
    }

    function updateAccuracy(
        uint256 _agentId,
        uint256 _accuracyScore
    ) external onlyRole(ALIGNMENT_NODE_ROLE) {
        cumulativeAccuracy[_agentId] = (_accuracyScore * 100) + cumulativeAccuracy[_agentId];
    }

    function slashAgent(uint256 _agentId, bytes32 _reason) external onlyRole(ALIGNMENT_NODE_ROLE) {
        require(agents[_agentId].active, "Already slashed");
        
        agents[_agentId].active = false;
        uint256 stake = agents[_agentId].stake;
        agents[_agentId].stake = 0;
        
        (bool sent, ) = payable(address(this)).call{value: stake}("");
        require(sent, "Stake transfer failed");

        emit AgentSlashed(_agentId, _reason);
    }

    function getLatestVerifiedSignal(uint256 _agentId) external view returns (Signal memory) {
        Signal[] storage signals = agentSignals[_agentId];
        require(signals.length > 0, "No signals");
        
        for (uint256 i = signals.length; i > 0; i--) {
            if (signals[i-1].verified) {
                return signals[i-1];
            }
        }
        revert("No verified signals");
    }

    function getSignalHistory(
        uint256 _agentId,
        uint256 _offset,
        uint256 _limit
    ) external view returns (Signal[] memory) {
        Signal[] storage all = agentSignals[_agentId];
        uint256 end = _offset + _limit;
        if (end > all.length) end = all.length;
        if (_offset >= all.length) return new Signal[](0);
        
        Signal[] memory result = new Signal[](end - _offset);
        for (uint256 i = _offset; i < end; i++) {
            result[i - _offset] = all[i];
        }
        return result;
    }

    function getAgentStats(uint256 _agentId) external view returns (
        uint256 totalSignals,
        uint256 verifiedCount,
        uint256 avgConfidence,
        uint256 avgAccuracy
    ) {
        Signal[] storage signals = agentSignals[_agentId];
        totalSignals = signals.length;
        
        uint256 verified = 0;
        uint256 totalConf = 0;
        
        for (uint256 i = 0; i < signals.length; i++) {
            if (signals[i].verified) verified++;
            totalConf += signals[i].confidence;
        }
        verifiedCount = verified;
        avgConfidence = totalSignals > 0 ? totalConf / totalSignals : 0;
        avgAccuracy = signalCount[_agentId] > 0 ? cumulativeAccuracy[_agentId] / signalCount[_agentId] : 0;
    }

    receive() external payable {}
}