import { publicEnv } from "@/lib/env";

export const replicantEvolutionCoordinatorAbi = [
  {
    type: "function",
    name: "requestEvolution",
    stateMutability: "nonpayable",
    inputs: [
      { name: "parentId", type: "uint256" },
      { name: "parentGenomeHash", type: "bytes32" },
      { name: "performanceHistoryHash", type: "bytes32" },
    ],
    outputs: [{ name: "requestId", type: "uint256" }],
  },
  {
    type: "function",
    name: "completeEvolution",
    stateMutability: "nonpayable",
    inputs: [
      { name: "requestId", type: "uint256" },
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
    name: "failEvolution",
    stateMutability: "nonpayable",
    inputs: [
      { name: "requestId", type: "uint256" },
      { name: "reasonHash", type: "bytes32" },
      { name: "slashParent", type: "bool" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "requests",
    stateMutability: "view",
    inputs: [{ name: "requestId", type: "uint256" }],
    outputs: [
      { name: "parentId", type: "uint256" },
      { name: "requester", type: "address" },
      { name: "status", type: "uint8" },
      { name: "parentGenomeHash", type: "bytes32" },
      { name: "performanceHistoryHash", type: "bytes32" },
      { name: "createdAt", type: "uint256" },
      { name: "childId", type: "uint256" },
    ],
  },
  {
    type: "event",
    name: "EvolutionRequested",
    inputs: [
      { name: "requestId", type: "uint256", indexed: true },
      { name: "parentId", type: "uint256", indexed: true },
      { name: "requester", type: "address", indexed: true },
      { name: "parentGenomeHash", type: "bytes32", indexed: false },
      { name: "performanceHistoryHash", type: "bytes32", indexed: false },
    ],
  },
  {
    type: "event",
    name: "EvolutionCompleted",
    inputs: [
      { name: "requestId", type: "uint256", indexed: true },
      { name: "parentId", type: "uint256", indexed: true },
      { name: "childId", type: "uint256", indexed: true },
      { name: "childGenomeHash", type: "bytes32", indexed: false },
      { name: "teeAttestationHash", type: "bytes32", indexed: false },
      { name: "alignmentVerdictHash", type: "bytes32", indexed: false },
      { name: "fitnessScore", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "EvolutionFailed",
    inputs: [
      { name: "requestId", type: "uint256", indexed: true },
      { name: "parentId", type: "uint256", indexed: true },
      { name: "reasonHash", type: "bytes32", indexed: false },
    ],
  },
] as const;

export const evolutionCoordinatorContractAddresses = {
  galileo:
    publicEnv.network === "galileo"
      ? publicEnv.contracts.evolutionCoordinator
      : undefined,
  mainnet:
    publicEnv.network === "mainnet"
      ? publicEnv.contracts.evolutionCoordinator
      : undefined,
} as const;