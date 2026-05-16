// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {ReplicantEvolutionCoordinator} from "../contracts/ReplicantEvolutionCoordinator.sol";

/**
 * @notice Set the TEE executor address for the Evolution Coordinator
 *
 * Usage:
 *   forge script script/SetTeeExecutor.s.sol:SetTeeExecutor \
 *     --rpc-url $ZERO_G_GALILEO_RPC_URL \
 *     --broadcast \
 *     --private-key $PRIVATE_KEY
 *
 * Make sure PRIVATE_KEY is the deployer/owner of the coordinator.
 * Set TEE_EXECUTOR_ADDRESS to your server's wallet address.
 */
contract SetTeeExecutor is Script {
    function run() external {
        uint256 ownerKey = vm.envUint("PRIVATE_KEY");
        address coordinatorAddr = vm.envAddress("NEXT_PUBLIC_EVOLUTION_COORDINATOR_CONTRACT");
        address teeExecutorAddr = vm.envAddress("TEE_EXECUTOR_ADDRESS");

        vm.startBroadcast(ownerKey);

        ReplicantEvolutionCoordinator coordinator = ReplicantEvolutionCoordinator(coordinatorAddr);
        coordinator.setTeeExecutor(teeExecutorAddr);

        vm.stopBroadcast();

        console.log("=== TEE Executor Updated ===");
        console.log("Coordinator:", coordinatorAddr);
        console.log("New TEE Executor:", teeExecutorAddr);
    }
}
