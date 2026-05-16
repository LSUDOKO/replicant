import { publicEnv } from "@/lib/env";

export const replicantMarketplaceAbi = [
  {
    type: "function",
    name: "list",
    stateMutability: "nonpayable",
    inputs: [
      { name: "tokenId", type: "uint256" },
      { name: "price", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "cancel",
    stateMutability: "nonpayable",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "buy",
    stateMutability: "payable",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "buySealed",
    stateMutability: "payable",
    inputs: [
      { name: "tokenId", type: "uint256" },
      {
        name: "proofs",
        type: "tuple[]",
        components: [
          {
            name: "accessProof",
            type: "tuple",
            components: [
              { name: "dataHash", type: "bytes32" },
              { name: "targetPubkey", type: "bytes" },
              { name: "nonce", type: "bytes" },
              { name: "proof", type: "bytes" },
            ],
          },
          {
            name: "ownershipProof",
            type: "tuple",
            components: [
              { name: "oracleType", type: "uint8" },
              { name: "dataHash", type: "bytes32" },
              { name: "sealedKey", type: "bytes" },
              { name: "targetPubkey", type: "bytes" },
              { name: "nonce", type: "bytes" },
              { name: "proof", type: "bytes" },
            ],
          },
        ],
      },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "listings",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [
      { name: "seller", type: "address" },
      { name: "price", type: "uint256" },
      { name: "active", type: "bool" },
    ],
  },
  {
    type: "function",
    name: "setProtocolFeeBps",
    stateMutability: "nonpayable",
    inputs: [{ name: "newProtocolFeeBps", type: "uint96" }],
    outputs: [],
  },
  {
    type: "function",
    name: "setTreasury",
    stateMutability: "nonpayable",
    inputs: [{ name: "newTreasury", type: "address" }],
    outputs: [],
  },
  {
    type: "event",
    name: "AgentListed",
    inputs: [
      { name: "agentId", type: "uint256", indexed: true },
      { name: "seller", type: "address", indexed: true },
      { name: "price", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "AgentSold",
    inputs: [
      { name: "agentId", type: "uint256", indexed: true },
      { name: "seller", type: "address", indexed: true },
      { name: "buyer", type: "address", indexed: true },
      { name: "price", type: "uint256", indexed: false },
      { name: "protocolFee", type: "uint256", indexed: false },
      { name: "royaltyAmount", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "AgentSoldSealed",
    inputs: [
      { name: "agentId", type: "uint256", indexed: true },
      { name: "seller", type: "address", indexed: true },
      { name: "buyer", type: "address", indexed: true },
      { name: "price", type: "uint256", indexed: false },
      { name: "protocolFee", type: "uint256", indexed: false },
      { name: "royaltyAmount", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "ListingCancelled",
    inputs: [{ name: "agentId", type: "uint256", indexed: true }],
  },
  {
    type: "event",
    name: "RoyaltyPaid",
    inputs: [
      { name: "agentId", type: "uint256", indexed: true },
      { name: "receiver", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
] as const;

export const marketplaceContractAddresses: Record<string, `0x${string}` | undefined> = {
  galileo: publicEnv.contracts.marketplace,
  mainnet: publicEnv.contracts.marketplace,
} as const;