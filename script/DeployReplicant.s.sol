// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ReplicantEvolutionCoordinator} from "../contracts/ReplicantEvolutionCoordinator.sol";
import {ReplicantMarketplace} from "../contracts/ReplicantMarketplace.sol";
import {ReplicantSubscriptionEscrow} from "../contracts/ReplicantSubscriptionEscrow.sol";
import {ReplicantAgentNFT} from "../contracts/0g/ReplicantAgentNFT.sol";
import {SimpleVerifier} from "../contracts/0g/SimpleVerifier.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

contract DeployReplicant {
    struct Deployment {
        ReplicantAgentNFT agentNFT;
        SimpleVerifier verifier;
        ReplicantEvolutionCoordinator evolutionCoordinator;
        ReplicantMarketplace marketplace;
        ReplicantSubscriptionEscrow subscriptionEscrow;
    }

    function run() external returns (Deployment memory d) {
        d.verifier = new SimpleVerifier();

        ReplicantAgentNFT impl = new ReplicantAgentNFT();
        ERC1967Proxy proxy = new ERC1967Proxy(
            address(impl),
            abi.encodeWithSelector(
                ReplicantAgentNFT.initializeReplicant.selector,
                "REPLICANT Agent",
                "REP",
                "replicant://storage",
                address(d.verifier),
                msg.sender,
                msg.sender,
                msg.sender
            )
        );
        d.agentNFT = ReplicantAgentNFT(address(proxy));

        d.evolutionCoordinator = new ReplicantEvolutionCoordinator(address(d.agentNFT));
        d.marketplace = new ReplicantMarketplace(address(d.agentNFT), msg.sender);
        d.subscriptionEscrow = new ReplicantSubscriptionEscrow();

        d.agentNFT.setEvolutionExecutor(address(d.evolutionCoordinator));
        d.agentNFT.setAlignmentNode(address(d.evolutionCoordinator));
    }
}