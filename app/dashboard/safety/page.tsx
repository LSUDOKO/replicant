"use client";

import { useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { keccak256, toHex, type Address } from "viem";
import { Loader2, Zap, Shield, AlertTriangle } from "lucide-react";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { AlignmentGauge } from "@/components/dashboard/AlignmentGauge";
import { GlassCard } from "@/components/ui/glass-card";
import { ActionButton } from "@/components/ui/action-button";
import { Input } from "@/components/ui/input";
import { ExplorerLinkWrapper } from "@/components/shared/ExplorerLink";
import { replicantAgentNftAbi, agentIdContractAddresses } from "@/lib/contracts/erc7857-agent-id";
import { publicEnv } from "@/lib/env";

export default function SafetyPage() {
  const { isConnected } = useAccount();
  const [agentId, setAgentId] = useState("");
  const [violationHash, setViolationHash] = useState("");

  const nftAddr = agentIdContractAddresses[publicEnv.network] as Address | undefined;

  const { data: slashTx, isPending, writeContractAsync } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: slashTx });

  async function handleSlash() {
    if (!nftAddr || !agentId) return;
    const vHash = violationHash ? (violationHash as `0x${string}`) : keccak256(toHex("demo-alignment-violation"));
    await writeContractAsync({
      address: nftAddr,
      abi: replicantAgentNftAbi,
      functionName: "slash",
      args: [BigInt(agentId), vHash],
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Safety</h1>
        <p className="text-sm text-muted-foreground">
          Alignment monitoring, violation attestations, and slashing readiness
          for autonomous evolution.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <AlignmentGauge />
        <div className="lg:col-span-2">
          <GlassCard className="p-5">
            <p className="label-uppercase text-accent-evolution">
              0G Alignment Layer
            </p>
            <h2 className="mt-3 text-xl font-semibold tracking-tight">
              TEE Attestation Watch
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Alignment nodes monitor drift, bias, anomaly, and goal divergence before
              a child Agent ID can be promoted.
            </p>
          </GlassCard>
        </div>
      </div>

      {/* Slashing Console */}
      <GlassCard className="border-destructive/20 p-5">
        <div className="flex items-center gap-2 text-destructive">
          <Zap size={18} />
          <h2 className="text-base font-medium">Slashing Console</h2>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Trigger a slashing event. This will burn the agent&apos;s stake and block all descendants.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-4 sm:items-end">
          <div className="sm:col-span-2">
            <label className="label-uppercase text-muted-foreground">Agent ID</label>
            <Input
              value={agentId}
              onChange={(e) => setAgentId(e.target.value)}
              placeholder="e.g. 1"
              className="mt-1 border-destructive/30 bg-surface"
            />
          </div>
          <div className="sm:col-span-1">
            <label className="label-uppercase text-muted-foreground">Violation Hash (optional)</label>
            <Input
              value={violationHash}
              onChange={(e) => setViolationHash(e.target.value)}
              placeholder="Defaults to demo violation"
              className="mt-1 border-destructive/30 bg-surface"
            />
          </div>
          <ActionButton
            variant="destructive"
            onClick={handleSlash}
            disabled={!isConnected || !agentId || !nftAddr || isPending || isConfirming}
          >
            {isPending || isConfirming ? (
              <><Loader2 size={14} className="mr-1 animate-spin" /> Slashing</>
            ) : (
              <><AlertTriangle size={14} className="mr-1" /> Slash Agent</>
            )}
          </ActionButton>
        </div>
        {slashTx && (
          <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {isConfirmed ? "Agent slashed successfully — stake burned!" : "Slashing transaction submitted..."}
            <ExplorerLinkWrapper value={slashTx} className="mt-1 block" />
          </div>
        )}
      </GlassCard>

      <ActivityFeed />
    </div>
  );
}