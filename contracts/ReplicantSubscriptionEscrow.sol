// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IReplicantAgent {
    function ownerOf(uint256 tokenId) external view returns (address);
}

contract ReplicantSubscriptionEscrow {
    struct Subscription {
        address subscriber;
        address receiver;
        uint256 agentId;
        uint256 tierId;
        uint256 prepaidUntil;
        uint256 amountPaid;
        bool active;
    }

    address public owner;
    IReplicantAgent public AGENT_CONTRACT;
    uint256 public subscriptionCount;
    mapping(uint256 => Subscription) public subscriptions;
    
    // Track active subscriptions per agent per user
    mapping(uint256 => mapping(address => uint256)) public activeSubscriptionId;

    event SubscriptionStarted(uint256 indexed subscriptionId, uint256 indexed agentId, address indexed subscriber, address receiver, uint256 tierId, uint256 prepaidUntil, uint256 amountPaid);
    event SubscriptionCancelled(uint256 indexed subscriptionId);
    event SubscriptionRefunded(uint256 indexed subscriptionId, uint256 refundAmount);

    error NotSubscriber();
    error InvalidPayment();
    error InvalidDuration();
    error InvalidSubscription();
    error AgentNotFound();

    constructor(address agentContractAddr) {
        owner = msg.sender;
        AGENT_CONTRACT = IReplicantAgent(agentContractAddr);
    }

    function startSubscription(uint256 agentId, address receiver, uint256 tierId, uint256 durationSeconds)
        external payable returns (uint256 subscriptionId)
    {
        if (msg.value == 0) revert InvalidPayment();
        if (durationSeconds == 0) revert InvalidDuration();
        
        // Verify agent exists
        try AGENT_CONTRACT.ownerOf(agentId) returns (address agentOwner) {
            if (agentOwner == address(0)) revert AgentNotFound();
        } catch {
            revert AgentNotFound();
        }

        subscriptionId = ++subscriptionCount;
        uint256 prepaidUntil = block.timestamp + durationSeconds;
        
        subscriptions[subscriptionId] = Subscription({
            subscriber: msg.sender,
            receiver: receiver,
            agentId: agentId,
            tierId: tierId,
            prepaidUntil: prepaidUntil,
            amountPaid: msg.value,
            active: true
        });
        
        // Track active subscription for this user + agent
        activeSubscriptionId[agentId][msg.sender] = subscriptionId;

        // Send payment to receiver (agent owner)
        (bool sent,) = payable(receiver).call{value: msg.value}("");
        require(sent, "RECEIVER_PAYMENT_FAILED");

        emit SubscriptionStarted(subscriptionId, agentId, msg.sender, receiver, tierId, prepaidUntil, msg.value);
    }

    function cancelSubscription(uint256 subscriptionId) external {
        Subscription storage subscription = subscriptions[subscriptionId];
        if (!subscription.active) revert InvalidSubscription();
        if (subscription.subscriber != msg.sender) revert NotSubscriber();

        subscription.active = false;
        
        // Clear active subscription tracking
        activeSubscriptionId[subscription.agentId][msg.sender] = 0;

        // Calculate refund for unused time
        if (subscription.prepaidUntil > block.timestamp) {
            uint256 totalDuration = subscription.prepaidUntil - (block.timestamp - (subscription.prepaidUntil - block.timestamp));
            uint256 remainingDuration = subscription.prepaidUntil - block.timestamp;
            uint256 refundAmount = (subscription.amountPaid * remainingDuration) / totalDuration;
            
            if (refundAmount > 0) {
                (bool sent,) = payable(msg.sender).call{value: refundAmount}("");
                require(sent, "REFUND_FAILED");
                emit SubscriptionRefunded(subscriptionId, refundAmount);
            }
        }

        emit SubscriptionCancelled(subscriptionId);
    }

    function hasAccess(uint256 subscriptionId, address account) external view returns (bool) {
        Subscription memory subscription = subscriptions[subscriptionId];
        return subscription.active && subscription.subscriber == account && subscription.prepaidUntil >= block.timestamp;
    }
    
    function getActiveSubscription(uint256 agentId, address subscriber) external view returns (uint256) {
        return activeSubscriptionId[agentId][subscriber];
    }
    
    function isSubscriptionActive(uint256 agentId, address subscriber) external view returns (bool) {
        uint256 subId = activeSubscriptionId[agentId][subscriber];
        if (subId == 0) return false;
        
        Subscription memory subscription = subscriptions[subId];
        return subscription.active && subscription.prepaidUntil >= block.timestamp;
    }
}
