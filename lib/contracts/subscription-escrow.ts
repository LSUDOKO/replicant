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
] as const;

export const subscriptionEscrowContractAddresses = {
  galileo:
    publicEnv.network === "galileo"
      ? publicEnv.contracts.subscriptionEscrow
      : undefined,
  mainnet:
    publicEnv.network === "mainnet"
      ? publicEnv.contracts.subscriptionEscrow
      : undefined,
} as const;
