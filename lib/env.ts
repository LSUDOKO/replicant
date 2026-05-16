import type { Address } from "viem";

export type ReplicantNetwork = "galileo" | "mainnet";

function validateAddress(value: string | undefined): Address | undefined {
  if (!value) return undefined;
  if (!/^0x[a-fA-F0-9]{40}$/.test(value)) {
    throw new Error(`Invalid EVM address: ${value}`);
  }
  return value as Address;
}

export const publicEnv = {
  network: (process.env.NEXT_PUBLIC_0G_NETWORK === "mainnet" ? "mainnet" : "galileo") as ReplicantNetwork,
  rpcUrl:
    process.env.NEXT_PUBLIC_0G_RPC_URL ??
    "https://evmrpc-testnet.0g.ai",
  storageIndexer:
    process.env.NEXT_PUBLIC_0G_STORAGE_INDEXER ??
    "https://indexer-storage-testnet-turbo.0g.ai",
  walletConnectProjectId:
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "e247a5dfd6c486b41d63fd30010e74a7",
  contracts: {
    agentId: validateAddress(process.env.NEXT_PUBLIC_AGENT_ID_CONTRACT),
    evolutionCoordinator: validateAddress(process.env.NEXT_PUBLIC_EVOLUTION_COORDINATOR_CONTRACT),
    marketplace: validateAddress(process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT),
    subscriptionEscrow: validateAddress(process.env.NEXT_PUBLIC_SUBSCRIPTION_ESCROW_CONTRACT),
    superfluidHost: validateAddress(process.env.NEXT_PUBLIC_SUPERFLUID_HOST),
    superfluidCfa: validateAddress(process.env.NEXT_PUBLIC_SUPERFLUID_CFA),
  },
} as const;
