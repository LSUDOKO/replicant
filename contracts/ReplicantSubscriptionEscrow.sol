// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

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
    uint256 public subscriptionCount;
    mapping(uint256 => Subscription) public subscriptions;

    event SubscriptionStarted(
        uint256 indexed subscriptionId,
        uint256 indexed agentId,
        address indexed subscriber,
        address receiver,
        uint256 tierId,
        uint256 prepaidUntil,
        uint256 amountPaid
    );
    event SubscriptionCancelled(uint256 indexed subscriptionId);

    error NotSubscriber();
    error InvalidPayment();
    error InvalidDuration();
    error InvalidSubscription();

    constructor() {
        owner = msg.sender;
    }

    function startSubscription(uint256 agentId, address receiver, uint256 tierId, uint256 durationSeconds)
        external
        payable
        returns (uint256 subscriptionId)
    {
        if (msg.value == 0) revert InvalidPayment();
        if (durationSeconds == 0) revert InvalidDuration();

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

        (bool sent,) = payable(receiver).call{value: msg.value}("");
        require(sent, "RECEIVER_PAYMENT_FAILED");

        emit SubscriptionStarted(subscriptionId, agentId, msg.sender, receiver, tierId, prepaidUntil, msg.value);
    }

    function cancelSubscription(uint256 subscriptionId) external {
        Subscription storage subscription = subscriptions[subscriptionId];
        if (!subscription.active) revert InvalidSubscription();
        if (subscription.subscriber != msg.sender) revert NotSubscriber();

        subscription.active = false;
        emit SubscriptionCancelled(subscriptionId);
    }

    function hasAccess(uint256 subscriptionId, address account) external view returns (bool) {
        Subscription memory subscription = subscriptions[subscriptionId];
        return subscription.active && subscription.subscriber == account && subscription.prepaidUntil >= block.timestamp;
    }
}
