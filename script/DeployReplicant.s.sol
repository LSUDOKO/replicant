// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ReplicantAgentID} from "../contracts/ReplicantAgentID.sol";
import {ReplicantEvolutionCoordinator} from "../contracts/ReplicantEvolutionCoordinator.sol";
import {ReplicantMarketplace} from "../contracts/ReplicantMarketplace.sol";
import {ReplicantSubscriptionEscrow} from "../contracts/ReplicantSubscriptionEscrow.sol";

contract DeployReplicant {
    struct Deployment {
        ReplicantAgentID agentId;
        ReplicantEvolutionCoordinator evolutionCoordinator;
        ReplicantMarketplace marketplace;
        ReplicantSubscriptionEscrow subscriptionEscrow;
    }

    function run() external returns (Deployment memory deployment) {
        deployment.agentId = new ReplicantAgentID("REPLICANT Agent ID", "RAID", msg.sender);
        deployment.evolutionCoordinator = new ReplicantEvolutionCoordinator(address(deployment.agentId));
        deployment.marketplace = new ReplicantMarketplace(address(deployment.agentId), msg.sender);
        deployment.subscriptionEscrow = new ReplicantSubscriptionEscrow();

        deployment.agentId.setEvolutionExecutor(address(deployment.evolutionCoordinator));
        deployment.agentId.setAlignmentNode(address(deployment.evolutionCoordinator));
    }
}
