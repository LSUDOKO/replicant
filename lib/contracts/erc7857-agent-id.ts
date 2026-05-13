import { publicEnv } from "@/lib/env";

export const replicantAgentNftAbi = [
  {
    type: "function",
    name: "mintGenesis",
    stateMutability: "payable",
    inputs: [
      { name: "encryptedGenomeHash", type: "bytes32" },
      { name: "speciesType", type: "uint8" },
    ],
    outputs: [{ name: "agentId", type: "uint256" }],
  },
  {
    type: "function",
    name: "cloneWithEvolution",
    stateMutability: "nonpayable",
    inputs: [
      { name: "parentId", type: "uint256" },
      { name: "childGenomeHash", type: "bytes32" },
      { name: "storageRootHash", type: "bytes32" },
      { name: "teeAttestationHash", type: "bytes32" },
      { name: "alignmentVerdictHash", type: "bytes32" },
      { name: "fitnessScore", type: "uint256" },
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
    outputs: [{ name: "childId", type: "uint256" }],
  },
  {
    type: "function",
    name: "slash",
    stateMutability: "nonpayable",
    inputs: [
      { name: "agentId", type: "uint256" },
      { name: "alignmentViolationHash", type: "bytes32" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "markEvolving",
    stateMutability: "nonpayable",
    inputs: [{ name: "agentId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "getLineage",
    stateMutability: "view",
    inputs: [{ name: "agentId", type: "uint256" }],
    outputs: [{ name: "ancestors", type: "uint256[]" }],
  },
  {
    type: "function",
    name: "getChildren",
    stateMutability: "view",
    inputs: [{ name: "agentId", type: "uint256" }],
    outputs: [{ name: "children", type: "uint256[]" }],
  },
  {
    type: "function",
    name: "getAgentMetadata",
    stateMutability: "view",
    inputs: [{ name: "agentId", type: "uint256" }],
    outputs: [
      { name: "speciesType", type: "uint8" },
      { name: "generation", type: "uint32" },
      { name: "status", type: "uint8" },
      { name: "parentId", type: "uint256" },
      { name: "fitnessScore", type: "uint256" },
      { name: "stake", type: "uint256" },
      { name: "storageRootHash", type: "bytes32" },
      { name: "teeAttestationHash", type: "bytes32" },
      { name: "alignmentVerdictHash", type: "bytes32" },
    ],
  },
  {
    type: "function",
    name: "ownerOf",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "owner", type: "address" }],
  },
  {
    type: "function",
    name: "creatorOf",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "creator", type: "address" }],
  },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "balance", type: "uint256" }],
  },
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "tokenId", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "event",
    name: "GenesisMinted",
    inputs: [
      { name: "agentId", type: "uint256", indexed: true },
      { name: "creator", type: "address", indexed: true },
      { name: "encryptedGenomeHash", type: "bytes32", indexed: false },
      { name: "speciesType", type: "uint8", indexed: false },
    ],
  },
  {
    type: "event",
    name: "AgentCloned",
    inputs: [
      { name: "parentId", type: "uint256", indexed: true },
      { name: "childId", type: "uint256", indexed: true },
      { name: "childGenomeHash", type: "bytes32", indexed: false },
      { name: "fitnessScore", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "AgentSlashed",
    inputs: [
      { name: "agentId", type: "uint256", indexed: true },
      { name: "alignmentViolationHash", type: "bytes32", indexed: false },
      { name: "slashAmount", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "AgentArchived",
    inputs: [{ name: "agentId", type: "uint256", indexed: true }],
  },
  {
    type: "event",
    name: "EvolutionStatusSet",
    inputs: [{ name: "agentId", type: "uint256", indexed: true }],
  },
  {
    type: "event",
    name: "Transfer",
    inputs: [
      { name: "from", type: "address", indexed: true },
      { name: "to", type: "address", indexed: true },
      { name: "tokenId", type: "uint256", indexed: true },
    ],
  },
] as const;

export const agentIdContractAddresses = {
  galileo: publicEnv.network === "galileo" ? publicEnv.contracts.agentId : undefined,
  mainnet: publicEnv.network === "mainnet" ? publicEnv.contracts.agentId : undefined,
} as const;