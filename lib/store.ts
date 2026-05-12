"use client";

import { create } from "zustand";
import type { Address, Hash } from "viem";

import type { Agent } from "@/types";

export type ChainHealth = "online" | "degraded" | "offline";

export interface ZeroGChainState {
  chainId: 16602 | 16661;
  networkName: "0G-Galileo-Testnet" | "0G Mainnet";
  latestBlock: number;
  finalityMs: number;
  storageIndexer: string;
  computeAttestation?: Hash;
  health: ChainHealth;
}

interface ReplicantState {
  walletAddress?: Address;
  activeAgentId?: Agent["id"];
  zeroGChain: ZeroGChainState;
  setWalletAddress: (walletAddress?: Address) => void;
  setActiveAgent: (agentId?: Agent["id"]) => void;
  setZeroGChain: (zeroGChain: Partial<ZeroGChainState>) => void;
}

export const useReplicantStore = create<ReplicantState>((set) => ({
  walletAddress: undefined,
  activeAgentId: "agent-001",
  zeroGChain: {
    chainId: 16602,
    networkName: "0G-Galileo-Testnet",
    latestBlock: 940000,
    finalityMs: 850,
    storageIndexer: "https://indexer-storage-testnet-turbo.0g.ai",
    computeAttestation:
      "0x8f3a1d2c9b7e6f4051a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708",
    health: "online",
  },
  setWalletAddress: (walletAddress) => set({ walletAddress }),
  setActiveAgent: (activeAgentId) => set({ activeAgentId }),
  setZeroGChain: (zeroGChain) =>
    set((state) => ({
      zeroGChain: {
        ...state.zeroGChain,
        ...zeroGChain,
      },
    })),
}));
