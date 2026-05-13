// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ReplicantEvolutionCoordinator} from "../contracts/ReplicantEvolutionCoordinator.sol";
import {ReplicantMarketplace} from "../contracts/ReplicantMarketplace.sol";
import {ReplicantSubscriptionEscrow} from "../contracts/ReplicantSubscriptionEscrow.sol";
import {ReplicantAgentNFT} from "../contracts/0g/ReplicantAgentNFT.sol";
import {SimpleVerifier} from "../contracts/0g/SimpleVerifier.sol";
import {TransferValidityProof} from "../contracts/0g/interfaces/IERC7857DataVerifier.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

contract MarketplaceBuyer {
    function buy(ReplicantMarketplace marketplace, uint256 tokenId) external payable {
        marketplace.buy{value: msg.value}(tokenId);
    }

    function onERC721Received(address, address, uint256, bytes calldata) external pure returns (bytes4) {
        return this.onERC721Received.selector;
    }

    receive() external payable {}
}

contract ReplicantAgentNFTTest {
    ReplicantAgentNFT private agentNft;
    SimpleVerifier private verifier;
    ReplicantEvolutionCoordinator private coordinator;
    ReplicantMarketplace private marketplace;
    ReplicantSubscriptionEscrow private subscriptions;
    MarketplaceBuyer private buyer;

    receive() external payable {}

    function onERC721Received(address, address, uint256, bytes calldata) external pure returns (bytes4) {
        return this.onERC721Received.selector;
    }

    function _deploy() internal {
        verifier = new SimpleVerifier();

        ReplicantAgentNFT impl = new ReplicantAgentNFT();
        ERC1967Proxy proxy = new ERC1967Proxy(
            address(impl),
            abi.encodeWithSelector(
                ReplicantAgentNFT.initializeReplicant.selector,
                "REPLICANT Agent", "REP", "replicant://storage",
                address(verifier), address(this), address(this), address(this)
            )
        );
        agentNft = ReplicantAgentNFT(address(proxy));
        coordinator = new ReplicantEvolutionCoordinator(address(agentNft));
        marketplace = new ReplicantMarketplace(address(agentNft), address(this));
        subscriptions = new ReplicantSubscriptionEscrow();
        buyer = new MarketplaceBuyer();
        agentNft.setEvolutionExecutor(address(coordinator));
        agentNft.setAlignmentNode(address(coordinator));
    }

    function testMintGenesisStoresAgent() external {
        _deploy();
        uint256 agent = agentNft.mintGenesis{value: 1 ether}(keccak256("genome-v1"), 1);
        assert(agent == 1);
        assert(agentNft.ownerOf(agent) == address(this));

        ReplicantAgentNFT.AgentMetadata memory meta = agentNft.getAgentMetadata(agent);
        assert(meta.speciesType == 1);
        assert(meta.generation == 0);
        assert(uint8(meta.status) == uint8(ReplicantAgentNFT.Status.Active));
        assert(meta.stake == 1 ether);
        assert(meta.parentId == 0);
        assert(agentNft.creatorOf(agent) == address(this));
    }

    function testEvolutionCoordinatorClonesAndArchivesParent() external {
        _deploy();
        uint256 parent = agentNft.mintGenesis(keccak256("parent"), 2);
        uint256 requestId = coordinator.requestEvolution(parent, keccak256("parent"), keccak256("history"));

        ReplicantAgentNFT.AgentMetadata memory evolvingMeta = agentNft.getAgentMetadata(parent);
        assert(uint8(evolvingMeta.status) == uint8(ReplicantAgentNFT.Status.Evolving));

        TransferValidityProof[] memory emptyProofs = new TransferValidityProof[](0);

        uint256 child = coordinator.completeEvolution(
            requestId,
            keccak256("child"),
            keccak256("storage-root"),
            keccak256("tee-attestation"),
            keccak256("alignment-pass"),
            91,
            emptyProofs
        );

        assert(child == 2);
        assert(agentNft.ownerOf(child) == address(this));

        uint256[] memory lineage = agentNft.getLineage(child);
        assert(lineage.length == 1);
        assert(lineage[0] == parent);

        ReplicantAgentNFT.AgentMetadata memory parentMeta = agentNft.getAgentMetadata(parent);
        assert(uint8(parentMeta.status) == uint8(ReplicantAgentNFT.Status.Archived));

        ReplicantAgentNFT.AgentMetadata memory childMeta = agentNft.getAgentMetadata(child);
        assert(uint8(childMeta.status) == uint8(ReplicantAgentNFT.Status.Active));
        assert(childMeta.generation == 1);
        assert(childMeta.fitnessScore == 91);
        assert(agentNft.creatorOf(child) == address(this));
    }

    function testSlashBlocksDescendantEvolution() external {
        _deploy();
        uint256 parent = agentNft.mintGenesis{value: 1 ether}(keccak256("parent"), 3);
        uint256 requestId = coordinator.requestEvolution(parent, keccak256("parent"), keccak256("history"));

        TransferValidityProof[] memory emptyProofs = new TransferValidityProof[](0);
        uint256 child = coordinator.completeEvolution(
            requestId,
            keccak256("child"),
            keccak256("storage-root"),
            keccak256("tee-attestation"),
            keccak256("alignment-pass"),
            88,
            emptyProofs
        );

        coordinator.failEvolution(
            coordinator.requestEvolution(child, keccak256("child"), keccak256("bad-history")),
            keccak256("goal-divergence"),
            true
        );

        ReplicantAgentNFT.AgentMetadata memory childMeta = agentNft.getAgentMetadata(child);
        assert(uint8(childMeta.status) == uint8(ReplicantAgentNFT.Status.Slashed));
    }

    function testMarketplaceSaleTransfersAgent() external {
        _deploy();
        uint256 tokenId = agentNft.mintGenesis(keccak256("sale"), 1);
        agentNft.approve(address(marketplace), tokenId);
        marketplace.list(tokenId, 1 ether);

        buyer.buy{value: 1 ether}(marketplace, tokenId);
        assert(agentNft.ownerOf(tokenId) == address(buyer));
    }

    function testSubscriptionEscrowStartsAccess() external {
        _deploy();
        uint256 subscriptionId = subscriptions.startSubscription{value: 0.1 ether}(1, address(this), 2, 30 days);
        assert(subscriptions.hasAccess(subscriptionId, address(this)));
    }
}