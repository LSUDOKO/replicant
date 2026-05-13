"use client";

import { useState } from "react";
import { parseEther } from "viem";
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { Brain, Dna, Link2, Lock, Shield, Target } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ActionButton } from "@/components/ui/action-button";
import { SpeciesIcon } from "@/components/shared/SpeciesIcon";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ExplorerLink } from "@/components/shared/ExplorerLink";
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
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  if (!agent) return null;
  const species = SPECIES_INFO[agent.species];

  const txStatus = isPending
    ? "signing"
    : isConfirming
      ? "pending"
      : isConfirmed
        ? "confirmed"
        : buyError
          ? "failed"
          : null;

  async function handleBuy() {
    if (!MARKETPLACE_ADDRESS || !agent?.price) return;
    setBuyError(null);
    reset();
    try {
      await writeContractAsync({
        address: MARKETPLACE_ADDRESS,
        abi: replicantMarketplaceAbi,
        functionName: "buy",
        args: [BigInt(agent.id)],
        value: parseEther(String(agent.price)),
      });
    } catch (err) {
      setBuyError(err instanceof Error ? (err as any).shortMessage ?? err.message : "Buy failed");
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { reset(); setBuyError(null); } onOpenChange(o); }}>
      <DialogContent className="max-w-lg border-border bg-card sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border-bright bg-surface">
              <SpeciesIcon species={agent.species} size={24} />
            </div>
            <div>
              <DialogTitle className="text-lg">{agent.name}</DialogTitle>
              <DialogDescription className="mt-0.5 flex items-center gap-2">
                <Badge variant="outline" className="border-border-bright text-[10px] text-muted-foreground">
                  {species.domain}
                </Badge>
                <StatusBadge status={agent.status} />
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="stats" className="mt-2">
          <TabsList className="border border-border bg-surface">
            <TabsTrigger value="stats">Stats</TabsTrigger>
            <TabsTrigger value="lineage">Lineage</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>

          <TabsContent value="stats" className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { icon: Dna,    label: "Generation", value: `Gen-${agent.generation}`, color: "text-foreground" },
                { icon: Target, label: "Fitness",    value: `${agent.fitnessScore}%`,  color: "text-primary" },
                { icon: Shield, label: "Alignment",  value: `${agent.alignmentScore}%`, color: "text-success" },
                { icon: Brain,  label: "Evolutions", value: String(agent.evolutionCount), color: "text-violet" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-lg border border-border bg-surface/50 p-3 text-center">
                  <stat.icon size={16} className="mx-auto text-muted-foreground" />
                  <p className={`mt-1.5 font-mono text-lg font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="label-uppercase mt-0.5 text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>

            {agent.price ? (
              <>
                <Separator className="bg-border" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="label-uppercase text-muted-foreground">Price</p>
                    <p className="text-2xl font-bold">{agent.price} ETH</p>
                  </div>
                  <ActionButton
                    size="lg"
                    onClick={handleBuy}
                    disabled={!isConnected || !MARKETPLACE_ADDRESS || isPending || isConfirming || isConfirmed}
                  >
                    {isConfirmed ? "Purchased" : isPending || isConfirming ? "Processing" : "Buy Now"}
                  </ActionButton>
                </div>
                {txStatus ? (
                  <TxStatusCard status={txStatus} hash={hash} error={buyError ?? undefined} />
                ) : null}
                {!MARKETPLACE_ADDRESS && (
                  <p className="text-xs text-accent-alert">
                    Marketplace contract not configured — set NEXT_PUBLIC_MARKETPLACE_CONTRACT.
                  </p>
                )}
              </>
            ) : null}
          </TabsContent>

          <TabsContent value="lineage" className="mt-4 space-y-3">
            {[
              { icon: Lock,  title: "Sealed Handover",   desc: "Strategy remains encrypted in TEE during ownership transfer" },
              { icon: Brain, title: "Memory Preserved",  desc: "All learned patterns transfer via 0G Storage" },
              { icon: Link2, title: "Lineage Proven",    desc: "On-chain family tree shows every ancestor" },
            ].map((item) => (
              <div key={item.title} className="flex items-center gap-3 rounded-lg border border-border bg-surface/50 p-3">
                <item.icon size={16} className="text-primary shrink-0" />
                <div>
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
            <p className="text-xs text-muted-foreground">
              Parent: {agent.parentId ?? "Genesis (no parent)"}
            </p>
          </TabsContent>

          <TabsContent value="details" className="mt-4 space-y-2">
            {[
              { label: "Agent ID",  value: agent.id },
              { label: "Creator",   value: agent.creator },
              { label: "Owner",     value: agent.owner },
              { label: "Created",   value: new Date(agent.createdAt).toLocaleDateString() },
              { label: "Stake",     value: `${agent.stake} 0G` },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-lg border border-border bg-surface/30 px-3 py-2">
                <span className="text-xs text-muted-foreground">{item.label}</span>
                <span className="font-mono text-xs">{item.value}</span>
              </div>
            ))}
            <ExplorerLink hash={agent.txHash} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
