import type { Address } from "viem";

export type ReplicantNetwork = "galileo" | "mainnet";

function readNetwork(): ReplicantNetwork {
  return process.env.NEXT_PUBLIC_0G_NETWORK === "mainnet" ? "mainnet" : "galileo";
}

function readOptionalAddress(key: string): Address | undefined {
  const value = process.env[key];
  if (!value) return undefined;
  if (!/^0x[a-fA-F0-9]{40}$/.test(value)) {
    throw new Error(`${key} must be a valid EVM address`);
  }
  return value as Address;
}

export const publicEnv = {
  network: readNetwork(),
  rpcUrl:
    process.env.NEXT_PUBLIC_0G_RPC_URL ??
    (readNetwork() === "mainnet"
      ? "https://evmrpc.0g.ai"
      : "https://evmrpc-testnet.0g.ai"),
  storageIndexer:
    process.env.NEXT_PUBLIC_0G_STORAGE_INDEXER ??
    (readNetwork() === "mainnet"
      ? "https://indexer-storage-turbo.0g.ai"
      : "https://indexer-storage-testnet-turbo.0g.ai"),
  contracts: {
    agentId: readOptionalAddress("NEXT_PUBLIC_AGENT_ID_CONTRACT"),
    evolutionCoordinator: readOptionalAddress("NEXT_PUBLIC_EVOLUTION_COORDINATOR_CONTRACT"),
    marketplace: readOptionalAddress("NEXT_PUBLIC_MARKETPLACE_CONTRACT"),
    subscriptionEscrow: readOptionalAddress("NEXT_PUBLIC_SUBSCRIPTION_ESCROW_CONTRACT"),
    superfluidHost: readOptionalAddress("NEXT_PUBLIC_SUPERFLUID_HOST"),
    superfluidCfa: readOptionalAddress("NEXT_PUBLIC_SUPERFLUID_CFA"),
  },
} as const;
