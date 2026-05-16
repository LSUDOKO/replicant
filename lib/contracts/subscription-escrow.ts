import { publicEnv } from "@/lib/env";

export const replicantSubscriptionEscrowAbi = [
  {
    type: "function",
    name: "startSubscription",
    stateMutability: "payable",
    inputs: [
      { name: "agentId", type: "uint256" },
      { name: "receiver", type: "address" },
      { name: "tierId", type: "uint256" },
      { name: "durationSeconds", type: "uint256" },
    ],
    outputs: [{ name: "subscriptionId", type: "uint256" }],
  },
  {
    type: "function",
    name: "cancelSubscription",
    stateMutability: "nonpayable",
    inputs: [{ name: "subscriptionId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "hasAccess",
    stateMutability: "view",
    inputs: [
      { name: "subscriptionId", type: "uint256" },
      { name: "account", type: "address" },
    ],
    outputs: [{ name: "hasAccess", type: "bool" }],
  },
  {
    type: "function",
    name: "getActiveSubscription",
    stateMutability: "view",
    inputs: [
      { name: "agentId", type: "uint256" },
      { name: "subscriber", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "isSubscriptionActive",
    stateMutability: "view",
    inputs: [
      { name: "agentId", type: "uint256" },
      { name: "subscriber", type: "address" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "subscriptions",
    stateMutability: "view",
    inputs: [{ name: "subscriptionId", type: "uint256" }],
    outputs: [
      { name: "subscriber", type: "address" },
      { name: "receiver", type: "address" },
      { name: "agentId", type: "uint256" },
      { name: "tierId", type: "uint256" },
      { name: "prepaidUntil", type: "uint256" },
      { name: "amountPaid", type: "uint256" },
      { name: "active", type: "bool" },
    ],
  },
  {
    type: "event",
    name: "SubscriptionStarted",
    inputs: [
      { name: "subscriptionId", type: "uint256", indexed: true },
      { name: "agentId", type: "uint256", indexed: true },
      { name: "subscriber", type: "address", indexed: true },
      { name: "receiver", type: "address", indexed: false },
      { name: "tierId", type: "uint256", indexed: false },
      { name: "prepaidUntil", type: "uint256", indexed: false },
      { name: "amountPaid", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "SubscriptionCancelled",
    inputs: [
      { name: "subscriptionId", type: "uint256", indexed: true },
    ],
  },
  {
    type: "event",
    name: "SubscriptionRefunded",
    inputs: [
      { name: "subscriptionId", type: "uint256", indexed: true },
      { name: "refundAmount", type: "uint256", indexed: false },
    ],
  },
  {
    type: "error",
    name: "NotSubscriber",
    inputs: [],
  },
  {
    type: "error",
    name: "InvalidPayment",
    inputs: [],
  },
  {
    type: "error",
    name: "InvalidDuration",
    inputs: [],
  },
  {
    type: "error",
    name: "InvalidSubscription",
    inputs: [],
  },
  {
    type: "error",
    name: "AgentNotFound",
    inputs: [],
  },
] as const;

export const subscriptionEscrowContractAddresses: Record<string, `0x${string}` | undefined> = {
  galileo: publicEnv.contracts.subscriptionEscrow,
  mainnet: publicEnv.contracts.subscriptionEscrow,
} as const;
