// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {MinReplicantAgentNFT} from "../contracts/0g/MinReplicantAgentNFT.sol";

/**
 * @notice Set (or update) the metadata baseURI on an already-deployed proxy.
 *         The deployer wallet must be the admin on the contract.
 *
 * Usage:
 *   forge script script/SetBaseURI.s.sol:SetBaseURI \
 *     --rpc-url $ZERO_G_GALILEO_RPC_URL \
 *     --broadcast \
 *     --private-key $PRIVATE_KEY
 *
 * Required env vars:
 *   NEXT_PUBLIC_AGENT_ID_CONTRACT  -- proxy address
 *   METADATA_BASE_URI              -- e.g. https://your-app.vercel.app/api/metadata/
 *                                     (must end with trailing slash)
 *
 * Or with cast (single tx):
 *   cast send $NEXT_PUBLIC_AGENT_ID_CONTRACT \
 *     "setBaseURI(string)" "$METADATA_BASE_URI" \
 *     --rpc-url $ZERO_G_GALILEO_RPC_URL \
 *     --private-key $PRIVATE_KEY
 */
contract SetBaseURI is Script {
    function run() external {
        address proxy         = vm.envAddress("NEXT_PUBLIC_AGENT_ID_CONTRACT");
        string memory baseURI = vm.envString("METADATA_BASE_URI");
        uint256 deployerKey   = vm.envUint("PRIVATE_KEY");

        require(bytes(baseURI).length > 0, "METADATA_BASE_URI is empty");
        require(
            bytes(baseURI)[bytes(baseURI).length - 1] == bytes1("/"),
            "METADATA_BASE_URI must end with /"
        );

        vm.startBroadcast(deployerKey);
        MinReplicantAgentNFT(proxy).setBaseURI(baseURI);
        vm.stopBroadcast();

        console.log("baseURI set on", proxy);
        console.log("tokenURI(1) will return:", string(abi.encodePacked(baseURI, "1")));
    }
}
