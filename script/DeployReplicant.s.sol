// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {ReplicantEvolutionCoordinator} from "../contracts/ReplicantEvolutionCoordinator.sol";
import {ReplicantMarketplace} from "../contracts/ReplicantMarketplace.sol";
import {ReplicantSubscriptionEscrow} from "../contracts/ReplicantSubscriptionEscrow.sol";
import {MinReplicantAgentNFT} from "../contracts/0g/MinReplicantAgentNFT.sol";
import {SimpleVerifier} from "../contracts/0g/SimpleVerifier.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

/**
 * @notice Deploy all Replicant contracts and set the metadata base URI in one batch.
 *
 * Usage:
 *   forge script script/DeployReplicant.s.sol:DeployReplicant \
 *     --rpc-url $ZERO_G_GALILEO_RPC_URL \
 *     --broadcast \
 *     --private-key $PRIVATE_KEY
 *
 * Set METADATA_BASE_URI in .env.local to your hosted app URL (must end with /):
 *   METADATA_BASE_URI=https://your-app.vercel.app/api/metadata/
 *
 * After deploy, copy the printed addresses into .env.local.
 */
contract DeployReplicant is Script {
    struct Deployment {
        MinReplicantAgentNFT agentNFT;
        SimpleVerifier verifier;
        ReplicantEvolutionCoordinator evolutionCoordinator;
        ReplicantMarketplace marketplace;
        ReplicantSubscriptionEscrow subscriptionEscrow;
    }

    function run() external returns (Deployment memory d) {
        uint256 deployerKey   = vm.envUint("PRIVATE_KEY");
        address deployer      = vm.addr(deployerKey);
        string memory baseURI = vm.envOr("METADATA_BASE_URI", string(""));

        vm.startBroadcast(deployerKey);

        // 1. Verifier
        d.verifier = new SimpleVerifier();

        // 2. MinReplicantAgentNFT implementation + ERC1967 proxy
        MinReplicantAgentNFT impl = new MinReplicantAgentNFT();
        ERC1967Proxy proxy = new ERC1967Proxy(
            address(impl),
            abi.encodeWithSelector(
                MinReplicantAgentNFT.initialize.selector,
                "REPLICANT Agent ID",  // name
                "RAID",                // symbol
                address(d.verifier),   // verifier
                deployer,              // admin
                deployer,              // evolutionExecutor (updated below)
                deployer               // alignmentNode
            )
        );
        d.agentNFT = MinReplicantAgentNFT(address(proxy));

        // 3. Set baseURI so tokenURI returns HTTP URLs block explorers can fetch
        if (bytes(baseURI).length > 0) {
            d.agentNFT.setBaseURI(baseURI);
        }

        // 4. Supporting contracts
        d.evolutionCoordinator = new ReplicantEvolutionCoordinator(address(d.agentNFT));
        d.marketplace          = new ReplicantMarketplace(address(d.agentNFT), deployer);
        d.subscriptionEscrow   = new ReplicantSubscriptionEscrow(address(d.agentNFT));

        // 5. Wire the real evolution executor
        d.agentNFT.setEvolutionExecutor(address(d.evolutionCoordinator));

        vm.stopBroadcast();

        console.log("=== Replicant Deployment ===");
        console.log("NEXT_PUBLIC_AGENT_ID_CONTRACT=", address(d.agentNFT));
        console.log("NEXT_PUBLIC_EVOLUTION_COORDINATOR_CONTRACT=", address(d.evolutionCoordinator));
        console.log("NEXT_PUBLIC_MARKETPLACE_CONTRACT=", address(d.marketplace));
        console.log("NEXT_PUBLIC_SUBSCRIPTION_ESCROW_CONTRACT=", address(d.subscriptionEscrow));
        if (bytes(baseURI).length > 0) {
            console.log("baseURI set to:", baseURI);
        } else {
            console.log("baseURI not set -- run SetBaseURI.s.sol after deploying your app.");
        }
    }
}
