import { publicEnv } from "@/lib/env";

export const erc7857AgentIdAbi = [
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
    name: "clone",
    stateMutability: "nonpayable",
    inputs: [
      { name: "parentId", type: "uint256" },
      { name: "childGenomeHash", type: "bytes32" },
      { name: "fitnessScore", type: "uint256" },
    ],
    outputs: [{ name: "childId", type: "uint256" }],
  },
  {
    type: "function",
    name: "cloneWithProof",
    stateMutability: "nonpayable",
    inputs: [
      { name: "parentId", type: "uint256" },
      { name: "childGenomeHash", type: "bytes32" },
      { name: "storageRootHash", type: "bytes32" },
      { name: "teeAttestationHash", type: "bytes32" },
      { name: "alignmentVerdictHash", type: "bytes32" },
      { name: "fitnessScore", type: "uint256" },
    ],
    outputs: [{ name: "childId", type: "uint256" }],
  },
  {
    type: "function",
    name: "authorizeUsage",
    stateMutability: "nonpayable",
    inputs: [
      { name: "agentId", type: "uint256" },
      { name: "user", type: "address" },
      { name: "expiry", type: "uint256" },
    ],
    outputs: [],
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
    name: "ownerOf",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "owner", type: "address" }],
  },
  {
    type: "function",
    name: "agents",
    stateMutability: "view",
    inputs: [{ name: "agentId", type: "uint256" }],
    outputs: [
      { name: "encryptedGenomeHash", type: "bytes32" },
      { name: "storageRootHash", type: "bytes32" },
      { name: "teeAttestationHash", type: "bytes32" },
      { name: "alignmentVerdictHash", type: "bytes32" },
      { name: "speciesType", type: "uint8" },
      { name: "generation", type: "uint32" },
      { name: "status", type: "uint8" },
      { name: "parentId", type: "uint256" },
      { name: "fitnessScore", type: "uint256" },
      { name: "stake", type: "uint256" },
      { name: "createdAt", type: "uint256" },
    ],
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
] as const;

export const agentIdContractAddresses = {
  galileo: publicEnv.network === "galileo" ? publicEnv.contracts.agentId : undefined,
  mainnet: publicEnv.network === "mainnet" ? publicEnv.contracts.agentId : undefined,
} as const;
