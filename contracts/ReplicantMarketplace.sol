// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IReplicantAgentID {
    function ownerOf(uint256 tokenId) external view returns (address);
    function transferFrom(address from, address to, uint256 tokenId) external;
    function royaltyInfo(uint256 tokenId, uint256 salePrice) external view returns (address receiver, uint256 royaltyAmount);
}

contract ReplicantMarketplace {
    struct Listing {
        address seller;
        uint256 price;
        bool active;
    }

    IReplicantAgentID public immutable AGENT_ID;
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

    constructor(address agentIdAddress, address initialTreasury) {
        AGENT_ID = IReplicantAgentID(agentIdAddress);
        owner = msg.sender;
        treasury = initialTreasury == address(0) ? msg.sender : initialTreasury;
    }

    function setProtocolFeeBps(uint96 newProtocolFeeBps) external onlyOwner {
        require(newProtocolFeeBps <= 2_000, "FEE_TOO_HIGH");
        protocolFeeBps = newProtocolFeeBps;
    }

    function list(uint256 tokenId, uint256 price) external {
        if (price == 0) revert InvalidPrice();
        if (AGENT_ID.ownerOf(tokenId) != msg.sender) revert NotAgentOwner();

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
        (address royaltyReceiver, uint256 royaltyAmount) = AGENT_ID.royaltyInfo(tokenId, listing.price);
        uint256 sellerProceeds = listing.price - protocolFee - royaltyAmount;

        AGENT_ID.transferFrom(listing.seller, msg.sender, tokenId);
        _pay(treasury, protocolFee);
        if (royaltyAmount > 0 && royaltyReceiver != address(0) && royaltyReceiver != listing.seller) {
            _pay(royaltyReceiver, royaltyAmount);
            emit RoyaltyPaid(tokenId, royaltyReceiver, royaltyAmount);
        } else {
            sellerProceeds += royaltyAmount;
        }
        _pay(listing.seller, sellerProceeds);

        if (msg.value > listing.price) {
            _pay(msg.sender, msg.value - listing.price);
        }

        emit AgentSold(tokenId, listing.seller, msg.sender, listing.price, protocolFee, royaltyAmount);
    }

    function _pay(address receiver, uint256 amount) internal {
        if (amount == 0) return;
        (bool sent,) = payable(receiver).call{value: amount}("");
        require(sent, "PAYMENT_FAILED");
    }
}
