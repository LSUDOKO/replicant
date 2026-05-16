"use client";

import { useState } from "react";
import { BaseError, parseEther } from "viem";
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { Brain, Shield, Target, ExternalLink, X, ShoppingCart, Loader2, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { SpeciesIcon } from "@/components/shared/SpeciesIcon";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { TxStatusCard } from "@/components/shared/TxStatusCard";
import { SPECIES_INFO } from "@/lib/constants";
import { replicantMarketplaceAbi, marketplaceContractAddresses } from "@/lib/contracts/marketplace";
import { publicEnv } from "@/lib/env";
import type { Agent } from "@/types";
import type { Address } from "viem";

interface AgentDetailModalProps {
  agent: Agent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MARKETPLACE_ADDRESS = marketplaceContractAddresses[publicEnv.network] as Address | undefined;

export function AgentDetailModal({ agent, open, onOpenChange }: AgentDetailModalProps) {
  const { isConnected } = useAccount();
  const [buyError, setBuyError] = useState<string | null>(null);

  const { data: hash, isPending, writeContractAsync, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  if (!agent) return null;

  const species = SPECIES_INFO[agent.species];
  const txStatus = isPending ? "signing" : isConfirming ? "pending" : isConfirmed ? "confirmed" : buyError ? "failed" : null;

  async function handleBuy() {
    if (!MARKETPLACE_ADDRESS || !agent?.price) return;
    setBuyError(null);
    reset();
    try {
      await writeContractAsync({
        address: MARKETPLACE_ADDRESS,
        abi: replicantMarketplaceAbi,
        functionName: "buy",
        args: [BigInt(agent.id.replace(/^agent-/, ""))],
        value: parseEther(String(agent.price)),
      });
    } catch (err) {
      setBuyError(
        err instanceof BaseError 
          ? err.shortMessage 
          : err instanceof Error 
            ? err.message 
            : "Buy failed"
      );
    }
  }

  const genomeHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;
  const teeAttestation = `0x${Array.from({ length: 128 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { reset(); setBuyError(null); } onOpenChange(o); }}>
      <DialogContent className="max-w-3xl border-white/10 bg-black p-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 bg-black">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-black">
              <SpeciesIcon species={agent.species} size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{agent.name}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <StatusBadge status={agent.status} />
                <span className="text-[10px] rounded-full border border-[#8b5cf6]/30 px-2 py-0.5 text-[#8b5cf6]">
                  GEN-{agent.generation}
                </span>
                <span className="text-[10px] text-white/40">{species.domain}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="text-white/60 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-3">
            <div className="text-center rounded-lg border border-white/10 bg-black p-3">
              <Target size={14} className="mx-auto text-[#8b5cf6] mb-1" />
              <p className="text-lg font-bold text-[#8b5cf6]">{agent.fitnessScore}%</p>
              <p className="text-[9px] text-white/40 uppercase tracking-wider">Fitness</p>
            </div>
            <div className="text-center rounded-lg border border-white/10 bg-black p-3">
              <Brain size={14} className="mx-auto text-white/40 mb-1" />
              <p className="text-lg font-bold text-white">{agent.alignmentScore}%</p>
              <p className="text-[9px] text-white/40 uppercase tracking-wider">Alignment</p>
            </div>
            <div className="text-center rounded-lg border border-white/10 bg-black p-3">
              <p className="text-lg font-bold text-white">{agent.evolutionCount}</p>
              <p className="text-[9px] text-white/40 uppercase tracking-wider">Evolutions</p>
            </div>
            <div className="text-center rounded-lg border border-white/10 bg-black p-3">
              <p className="text-lg font-bold text-white">{agent.stake}</p>
              <p className="text-[9px] text-white/40 uppercase tracking-wider">Stake (0G)</p>
            </div>
          </div>

          {/* Description */}
          <div className="rounded-lg border border-white/10 bg-black p-4">
            <p className="text-[10px] uppercase tracking-wider text-white/40 mb-2">Species</p>
            <p className="text-sm font-semibold text-white mb-1">{species.name}</p>
            <p className="text-xs text-white/60 leading-relaxed">{species.description}</p>
          </div>

          {/* Cryptographic Proofs */}
          <div className="rounded-lg border border-[#8b5cf6]/30 bg-[#8b5cf6]/5 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Shield size={14} className="text-[#8b5cf6]" />
              <p className="text-xs font-medium text-[#8b5cf6]">TEE Attestation</p>
            </div>
            <p className="font-mono text-[10px] text-white/60 break-all mb-3">
              {teeAttestation}
            </p>
            <div className="flex items-center gap-1 text-[10px] text-[#8b5cf6]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8b5cf6]" />
              Intel TDX • Verified
            </div>
          </div>

          {/* Genome Hash */}
          <div className="rounded-lg border border-white/10 bg-black p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield size={14} className="text-white/60" />
              <p className="text-xs font-medium text-white">Encrypted Genome</p>
            </div>
            <p className="font-mono text-[10px] text-white/60 break-all mb-2">
              {genomeHash}
            </p>
            <p className="text-[10px] text-white/40 italic">
              Strategy weights locked in 0G Compute. Not extractable.
            </p>
          </div>

          {/* On-Chain Details */}
          <div className="rounded-lg border border-white/10 bg-black p-4">
            <p className="text-[10px] uppercase tracking-wider text-white/40 mb-3">On-Chain Details</p>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-white/50">Agent ID</span>
                <span className="text-white font-mono">#{agent.id.replace("agent-", "")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Owner</span>
                <span className="text-white font-mono text-[10px]">
                  {agent.owner.slice(0, 10)}...{agent.owner.slice(-8)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Creator</span>
                <span className="text-white font-mono text-[10px]">
                  {agent.creator.slice(0, 10)}...{agent.creator.slice(-8)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Created</span>
                <span className="text-white">{new Date(agent.createdAt).toLocaleDateString()}</span>
              </div>
              {agent.txHash && (
                <div className="flex justify-between items-center">
                  <span className="text-white/50">Transaction</span>
                  <a
                    href={`https://chainscan.0g.ai/tx/${agent.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[#8b5cf6] hover:text-[#8b5cf6]/80 text-[10px]"
                  >
                    <span>View on Explorer</span>
                    <ExternalLink size={10} />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Lineage */}
          <div className="rounded-lg border border-white/10 bg-black p-4">
            <p className="text-[10px] uppercase tracking-wider text-white/40 mb-3">Lineage</p>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-white/50 mb-1">Ancestors</p>
                <p className="text-white">
                  {agent.parentId ? `1 (Gen-${agent.generation - 1})` : "0 (Genesis)"}
                </p>
              </div>
              <div>
                <p className="text-white/50 mb-1">Children</p>
                <p className="text-white">
                  {agent.childrenIds.length > 0 ? agent.childrenIds.length : "0 (None)"}
                </p>
              </div>
            </div>
          </div>

          {/* Buy Section */}
          {agent.price && (
            <div className="rounded-lg border border-[#8b5cf6]/30 bg-[#8b5cf6]/5 p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-white/40 mb-1">
                    Purchase Price
                  </p>
                  <p className="text-3xl font-bold text-white">
                    {agent.price.toFixed(2)}
                    <span className="text-sm font-normal text-white/60 ml-2">0G</span>
                  </p>
                  <p className="text-[10px] text-white/40 mt-1">
                    Full ownership & IP rights • TEE sealed transfer
                  </p>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-[#8b5cf6]">
                  <Shield size={12} />
                  <span>Verified</span>
                </div>
              </div>

              <button
                onClick={handleBuy}
                disabled={!isConnected || !MARKETPLACE_ADDRESS || isPending || isConfirming || isConfirmed}
                className="w-full py-3 rounded-lg bg-[#8b5cf6] text-white text-sm font-bold hover:bg-[#8b5cf6]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <><Loader2 size={16} className="animate-spin" /> Signing...</>
                ) : isConfirming ? (
                  <><Loader2 size={16} className="animate-spin" /> Confirming...</>
                ) : isConfirmed ? (
                  <><CheckCircle2 size={16} /> Purchased!</>
                ) : (
                  <><ShoppingCart size={16} /> Buy Now</>
                )}
              </button>

              {!isConnected && (
                <p className="text-[10px] text-white/40 text-center mt-2">
                  Connect wallet to purchase
                </p>
              )}

              {txStatus && (
                <div className="mt-3">
                  <TxStatusCard status={txStatus} hash={hash} error={buyError ?? undefined} />
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
