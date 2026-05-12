// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ReplicantAgentID} from "../contracts/ReplicantAgentID.sol";
import {ReplicantEvolutionCoordinator} from "../contracts/ReplicantEvolutionCoordinator.sol";
import {ReplicantMarketplace} from "../contracts/ReplicantMarketplace.sol";
import {ReplicantSubscriptionEscrow} from "../contracts/ReplicantSubscriptionEscrow.sol";

contract MarketplaceBuyer {
    function buy(ReplicantMarketplace marketplace, uint256 tokenId) external payable {
        marketplace.buy{value: msg.value}(tokenId);
    }

    receive() external payable {}
}

contract ReplicantAgentIDTest {
    ReplicantAgentID private agentId;
    ReplicantEvolutionCoordinator private coordinator;
    ReplicantMarketplace private marketplace;
    ReplicantSubscriptionEscrow private subscriptions;
    MarketplaceBuyer private buyer;

    receive() external payable {}

    function _deploy() internal {
        agentId = new ReplicantAgentID("REPLICANT Agent ID", "RAID", address(this));
        coordinator = new ReplicantEvolutionCoordinator(address(agentId));
        marketplace = new ReplicantMarketplace(address(agentId), address(this));
        subscriptions = new ReplicantSubscriptionEscrow();
        buyer = new MarketplaceBuyer();
        agentId.setEvolutionExecutor(address(coordinator));
        agentId.setAlignmentNode(address(coordinator));
    }

    function testMintGenesisStoresAgent() external {
        _deploy();
        uint256 agent = agentId.mintGenesis{value: 1 ether}(keccak256("genome-v1"), 1);
        assert(agent == 1);
        assert(agentId.ownerOf(agent) == address(this));

        (
            bytes32 encryptedGenomeHash,
            ,
            ,
            ,
            uint8 speciesType,
            uint32 generation,
            ReplicantAgentID.Status status,
            ,
            ,
            uint256 stake,
        ) = agentId.agents(agent);

        assert(encryptedGenomeHash == keccak256("genome-v1"));
        assert(speciesType == 1);
        assert(generation == 0);
        assert(status == ReplicantAgentID.Status.Active);
        assert(stake == 1 ether);
    }

    function testEvolutionCoordinatorClonesAndArchivesParent() external {
        _deploy();
        uint256 parent = agentId.mintGenesis(keccak256("parent"), 2);
        uint256 requestId = coordinator.requestEvolution(parent, keccak256("parent"), keccak256("history"));
        (,,,,,, ReplicantAgentID.Status evolvingStatus,,,,) = agentId.agents(parent);
        assert(evolvingStatus == ReplicantAgentID.Status.Evolving);

        uint256 child = coordinator.completeEvolution(
            requestId,
            keccak256("child"),
            keccak256("storage-root"),
            keccak256("tee-attestation"),
            keccak256("alignment-pass"),
            91
        );

        assert(child == 2);
        assert(agentId.ownerOf(child) == address(this));

        uint256[] memory lineage = agentId.getLineage(child);
        assert(lineage.length == 1);
        assert(lineage[0] == parent);

        (,,,,,, ReplicantAgentID.Status parentStatus,,,,) = agentId.agents(parent);
        (,,,,, uint32 childGeneration, ReplicantAgentID.Status childStatus,, uint256 fitnessScore,,) = agentId.agents(child);
        assert(parentStatus == ReplicantAgentID.Status.Archived);
        assert(childStatus == ReplicantAgentID.Status.Active);
        assert(childGeneration == 1);
        assert(fitnessScore == 91);
    }

    function testSlashBlocksDescendantEvolution() external {
        _deploy();
        uint256 parent = agentId.mintGenesis{value: 1 ether}(keccak256("parent"), 3);
        uint256 requestId = coordinator.requestEvolution(parent, keccak256("parent"), keccak256("history"));
        uint256 child = coordinator.completeEvolution(
            requestId,
            keccak256("child"),
            keccak256("storage-root"),
            keccak256("tee-attestation"),
            keccak256("alignment-pass"),
            88
        );

        coordinator.failEvolution(
            coordinator.requestEvolution(child, keccak256("child"), keccak256("bad-history")),
            keccak256("goal-divergence"),
            true
        );

        (,,,,,, ReplicantAgentID.Status childStatus,,,,) = agentId.agents(child);
        assert(childStatus == ReplicantAgentID.Status.Slashed);
        assert(agentId.descendantsBlocked(child));
    }

    function testMarketplaceSaleTransfersAgent() external {
        _deploy();
        uint256 tokenId = agentId.mintGenesis(keccak256("sale"), 1);
        agentId.approve(address(marketplace), tokenId);
        marketplace.list(tokenId, 1 ether);

        buyer.buy{value: 1 ether}(marketplace, tokenId);
        assert(agentId.ownerOf(tokenId) == address(buyer));
    }

    function testSubscriptionEscrowStartsAccess() external {
        _deploy();
        uint256 subscriptionId = subscriptions.startSubscription{value: 0.1 ether}(1, address(this), 2, 30 days);
        assert(subscriptions.hasAccess(subscriptionId, address(this)));
    }
}
