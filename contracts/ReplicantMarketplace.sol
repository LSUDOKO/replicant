// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./0g/interfaces/IERC7857Metadata.sol";
import "./0g/interfaces/IERC7857DataVerifier.sol";

/**
 * @title ReplicantMarketplace
 * @notice ERC-7857-aware marketplace for REPLICANT agents with sealed handover support.
 * @dev Provides two purchase paths:
 *      - buy()        — standard ERC-721 safeTransferFrom (no sealed handover)
 *      - buySealed()  — ERC-7857 iTransferFrom with TEE/ZKP proofs (genome stays encrypted)
 *
 *      The marketplace tracks creators for royalty distribution using AgentNFT.creatorOf.
 *      For ReplicantAgentNFT, the creator is set during mintGenesis via _setCreator.
 */

interface IReplicantAgentContract {
    function ownerOf(uint256 tokenId) external view returns (address);
    function creatorOf(uint256 tokenId) external view returns (address);
    function safeTransferFrom(address from, address to, uint256 tokenId) external;
    function iTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        TransferValidityProof[] calldata proofs
    ) external;
}

contract ReplicantMarketplace {
    struct Listing {
        address seller;
        uint256 price;
        bool active;
    }

    IReplicantAgentContract public immutable AGENT_CONTRACT;
    address public owner;
    address public treasury;
    uint96 public protocolFeeBps = 1_000;

    mapping(uint256 => Listing) public listings;

    event AgentListed(uint256 indexed agentId, address indexed seller, uint256 price);
    event ListingCancelled(uint256 indexed agentId);
    event AgentSold(
        uint256 indexed agentId,
        address indexed seller,
        address indexed buyer,
        uint256 price,
        uint256 protocolFee,
        uint256 royaltyAmount
    );
    event AgentSoldSealed(
        uint256 indexed agentId,
        address indexed seller,
        address indexed buyer,
        uint256 price,
        uint256 protocolFee,
        uint256 royaltyAmount
    );
    event RoyaltyPaid(uint256 indexed agentId, address indexed receiver, uint256 amount);

    error NotOwner();
    error NotAgentOwner();
    error InvalidPrice();
    error InvalidListing();
    error Underpaid();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    constructor(address agentContractAddr, address initialTreasury) {
        AGENT_CONTRACT = IReplicantAgentContract(agentContractAddr);
        owner = msg.sender;
        treasury = initialTreasury == address(0) ? msg.sender : initialTreasury;
    }

    function setProtocolFeeBps(uint96 newProtocolFeeBps) external onlyOwner {
        require(newProtocolFeeBps <= 2_000, "FEE_TOO_HIGH");
        protocolFeeBps = newProtocolFeeBps;
    }

    function setTreasury(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), "INVALID_TREASURY");
        treasury = newTreasury;
    }

    function list(uint256 tokenId, uint256 price) external {
        if (price == 0) revert InvalidPrice();
        if (AGENT_CONTRACT.ownerOf(tokenId) != msg.sender) revert NotAgentOwner();

        listings[tokenId] = Listing({seller: msg.sender, price: price, active: true});
        emit AgentListed(tokenId, msg.sender, price);
    }

    function cancel(uint256 tokenId) external {
        Listing memory listing = listings[tokenId];
        if (!listing.active) revert InvalidListing();
        if (listing.seller != msg.sender) revert NotAgentOwner();

        delete listings[tokenId];
        emit ListingCancelled(tokenId);
    }

    function buy(uint256 tokenId) external payable {
        Listing memory listing = listings[tokenId];
        if (!listing.active) revert InvalidListing();
        if (msg.value < listing.price) revert Underpaid();

        delete listings[tokenId];

        uint256 protocolFee = (listing.price * protocolFeeBps) / 10_000;
        address creator = AGENT_CONTRACT.creatorOf(tokenId);
        uint256 royaltyAmount = (listing.price * 500) / 10_000;
        uint256 sellerProceeds = listing.price - protocolFee - royaltyAmount;

        AGENT_CONTRACT.safeTransferFrom(listing.seller, msg.sender, tokenId);
        _pay(treasury, protocolFee);
        if (royaltyAmount > 0 && creator != address(0) && creator != listing.seller) {
            _pay(creator, royaltyAmount);
            emit RoyaltyPaid(tokenId, creator, royaltyAmount);
        } else {
            sellerProceeds += royaltyAmount;
        }
        _pay(listing.seller, sellerProceeds);

        if (msg.value > listing.price) {
            _pay(msg.sender, msg.value - listing.price);
        }

        emit AgentSold(tokenId, listing.seller, msg.sender, listing.price, protocolFee, royaltyAmount);
    }

    function buySealed(
        uint256 tokenId,
        TransferValidityProof[] calldata proofs
    ) external payable {
        Listing memory listing = listings[tokenId];
        if (!listing.active) revert InvalidListing();
        if (msg.value < listing.price) revert Underpaid();

        delete listings[tokenId];

        uint256 protocolFee = (listing.price * protocolFeeBps) / 10_000;
        address creator = AGENT_CONTRACT.creatorOf(tokenId);
        uint256 royaltyAmount = (listing.price * 500) / 10_000;
        uint256 sellerProceeds = listing.price - protocolFee - royaltyAmount;

        AGENT_CONTRACT.iTransferFrom(listing.seller, msg.sender, tokenId, proofs);
        _pay(treasury, protocolFee);
        if (royaltyAmount > 0 && creator != address(0) && creator != listing.seller) {
            _pay(creator, royaltyAmount);
            emit RoyaltyPaid(tokenId, creator, royaltyAmount);
        } else {
            sellerProceeds += royaltyAmount;
        }
        _pay(listing.seller, sellerProceeds);

        if (msg.value > listing.price) {
            _pay(msg.sender, msg.value - listing.price);
        }

        emit AgentSoldSealed(tokenId, listing.seller, msg.sender, listing.price, protocolFee, royaltyAmount);
    }

    function _pay(address receiver, uint256 amount) internal {
        if (amount == 0) return;
        (bool sent,) = payable(receiver).call{value: amount}("");
        require(sent, "PAYMENT_FAILED");
    }
}