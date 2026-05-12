import { publicEnv } from "@/lib/env";

export const superfluidCfaV1Abi = [
  {
    type: "function",
    name: "createFlow",
    stateMutability: "nonpayable",
    inputs: [
      { name: "token", type: "address" },
      { name: "receiver", type: "address" },
      { name: "flowRate", type: "int96" },
      { name: "ctx", type: "bytes" },
    ],
    outputs: [{ name: "newCtx", type: "bytes" }],
  },
  {
    type: "function",
    name: "updateFlow",
    stateMutability: "nonpayable",
    inputs: [
      { name: "token", type: "address" },
      { name: "receiver", type: "address" },
      { name: "flowRate", type: "int96" },
      { name: "ctx", type: "bytes" },
    ],
    outputs: [{ name: "newCtx", type: "bytes" }],
  },
  {
    type: "function",
    name: "deleteFlow",
    stateMutability: "nonpayable",
    inputs: [
      { name: "token", type: "address" },
      { name: "sender", type: "address" },
      { name: "receiver", type: "address" },
      { name: "ctx", type: "bytes" },
    ],
    outputs: [{ name: "newCtx", type: "bytes" }],
  },
  {
    type: "function",
    name: "getFlow",
    stateMutability: "view",
    inputs: [
      { name: "token", type: "address" },
      { name: "sender", type: "address" },
      { name: "receiver", type: "address" },
    ],
    outputs: [
      { name: "timestamp", type: "uint256" },
      { name: "flowRate", type: "int96" },
      { name: "deposit", type: "uint256" },
      { name: "owedDeposit", type: "uint256" },
    ],
  },
  {
    type: "event",
    name: "FlowUpdated",
    inputs: [
      { name: "token", type: "address", indexed: true },
      { name: "sender", type: "address", indexed: true },
      { name: "receiver", type: "address", indexed: true },
      { name: "flowRate", type: "int96", indexed: false },
      { name: "totalSenderFlowRate", type: "int96", indexed: false },
      { name: "totalReceiverFlowRate", type: "int96", indexed: false },
      { name: "userData", type: "bytes", indexed: false },
    ],
  },
] as const;

export const superfluidContractAddresses = {
  galileo: publicEnv.network === "galileo" ? publicEnv.contracts.superfluidCfa : undefined,
  mainnet: publicEnv.network === "mainnet" ? publicEnv.contracts.superfluidCfa : undefined,
} as const;
