"use client";

import { useState } from "react";
import { keccak256, parseEther, toHex, type Address, type Hash } from "viem";
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { FlaskConical, Loader2, ShieldCheck, CheckCircle2, XCircle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ActionButton } from "@/components/ui/action-button";
import { SpeciesIcon } from "@/components/shared/SpeciesIcon";
import { TxStatusCard } from "@/components/shared/TxStatusCard";
import { ExplorerLinkWrapper } from "@/components/shared/ExplorerLink";
import { replicantEvolutionCoordinatorAbi, evolutionCoordinatorContractAddresses } from "@/lib/contracts/evolution-coordinator";
import { publicEnv } from "@/lib/env";
import { useDashboardData } from "@/lib/queries/use-dashboard-data";
import { useReplicantStore } from "@/lib/store";

type Stage = "idle" | "requesting" | "requested" | "computing" | "aligning" | "minting" | "done" | "failed";

const COORDINATOR_ADDRESS = evolutionCoordinatorContractAddresses[publicEnv.network] as Address | undefined;

const STAGE_LABELS: Record<Stage, string> = {
  idle:       "Ready",
  requesting: "Submitting request",
  requested:  "Queued",
  computing:  "Generating 50 candidates",
  aligning:   "Alignment scan",
  minting:    "Minting child",
  done:       "Complete",
  failed:     "Failed",
};

const STAGE_PROGRESS: Record<Stage, number> = {
  idle: 0, requesting: 15, requested: 25,
  computing: 55, aligning: 75, minting: 90, done: 100, failed: 0,
};

export function EvolutionCard() {
  const { isConnected } = useAccount();
  const { agents } = useDashboardData();
  const activeAgentId = useReplicantStore((s) => s.activeAgentId);

  const [stage, setStage] = useState<Stage>("idle");
  const [error, setError] = useState<string | null>(null);
  const [childId, setChildId] = useState<bigint | null>(null);

  const { data: reqHash, isPending: reqPending, writeContractAsync: writeRequest, reset: resetReq } = useWriteContract();
  const { isSuccess: reqConfirmed } = useWaitForTransactionReceipt({ hash: reqHash });

  const activeAgent = agents.find((a) => a.id === activeAgentId) ?? agents[0];
  const canEvolve = activeAgent?.status === "active" && isConnected && !!COORDINATOR_ADDRESS;

  async function handleRequestEvolution() {
    if (!activeAgent || !COORDINATOR_ADDRESS) return;
    setError(null);
    setStage("requesting");
    resetReq();

    try {
      // parentGenomeHash = agent's stored txHash (encryptedGenomeHash on-chain)
      const parentGenomeHash = activeAgent.txHash as Hash;
      const performanceHistoryHash = keccak256(
        toHex(`perf-history-${activeAgent.id}-${Date.now()}`)
      );

      await writeRequest({
        address: COORDINATOR_ADDRESS,
        abi: replicantEvolutionCoordinatorAbi,
        functionName: "requestEvolution",
        args: [BigInt(activeAgent.id), parentGenomeHash, performanceHistoryHash],
      });

      setStage("requested");
      await delay(500);

      setStage("computing");
      const evolveRes = await fetch("/api/compute/evolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parentId: activeAgent.id,
          parentGenomeHash,
          performanceHistoryHash,
        }),
      });
      const evolveData = await evolveRes.json();
      if (!evolveRes.ok) throw new Error(evolveData.error ?? "Evolution failed");

      setStage("aligning");
      await delay(500);

      const alignRes = await fetch("/api/alignment/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId: activeAgent.id, genomeHash: evolveData.childGenomeHash }),
      });
      const alignData = await alignRes.json();
      if (!alignRes.ok) throw new Error(alignData.error ?? "Alignment scan failed");

      setChildId(BigInt(evolveData.requestId));
      setStage("done");
    } catch (err) {
      setError(err instanceof Error ? (err as any).shortMessage ?? err.message : "Evolution failed");
      setStage("failed");
    }
  }

  function reset() {
    setStage("idle");
    setError(null);
    setChildId(null);
    resetReq();
  }

  const txStatus =
    reqPending ? "signing"
    : stage === "requesting" ? "pending"
    : stage === "done" ? "confirmed"
    : stage === "failed" ? "failed"
    : null;

  if (!activeAgent) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <FlaskConical size={40} className="text-muted-foreground/30" />
          <p className="mt-4 text-sm text-muted-foreground">No agents found. Mint a Genesis agent first.</p>
        </CardContent>
      </Card>
    );
  }

  const isActive = stage !== "idle" && stage !== "done" && stage !== "failed";
  const progress = STAGE_PROGRESS[stage];

  return (
    <Card className={`overflow-hidden border-border bg-card ${isActive ? "border-primary/20 glow-cyan" : ""}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <FlaskConical size={18} className={isActive ? "text-primary animate-pulse" : "text-muted-foreground"} />
            Evolution Chamber
          </CardTitle>
          {isActive && (
            <Badge className="border-cyan/20 bg-cyan/10 text-cyan">
              <Loader2 size={12} className="mr-1 animate-spin" />
              {STAGE_LABELS[stage]}
            </Badge>
          )}
          {stage === "done" && (
            <Badge className="border-success/20 bg-success/10 text-success">
              <CheckCircle2 size={12} className="mr-1" />
              Complete
            </Badge>
          )}
          {stage === "failed" && (
            <Badge className="border-accent-alert/20 bg-accent-alert/10 text-accent-alert">
              <XCircle size={12} className="mr-1" />
              Failed
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Agent info */}
        <div className="flex items-center gap-3 rounded-lg border border-border bg-surface/50 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border-bright bg-surface">
            <SpeciesIcon species={activeAgent.species} size={20} />
          </div>
          <div>
            <p className="font-medium">{activeAgent.name}</p>
            <p className="text-xs text-muted-foreground">
              Gen-{activeAgent.generation} · Fitness {activeAgent.fitnessScore}%
            </p>
          </div>
        </div>

        {/* Progress bar */}
        {stage !== "idle" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{STAGE_LABELS[stage]}</span>
              <span className="font-mono text-xs text-primary">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2 bg-surface" />
          </div>
        )}

        {/* Stage indicators */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { key: "computing", label: "Mutation",  icon: FlaskConical },
            { key: "aligning",  label: "Alignment", icon: ShieldCheck },
            { key: "done",      label: "Clone",     icon: CheckCircle2 },
          ].map(({ key, label, icon: Icon }) => {
            const stageOrder: Stage[] = ["computing", "aligning", "done"];
            const currentIdx = stageOrder.indexOf(stage as Stage);
            const thisIdx = stageOrder.indexOf(key as Stage);
            const isDone = currentIdx > thisIdx || stage === "done";
            const isNow = stage === key;
            return (
              <div
                key={key}
                className={`rounded-lg border p-3 text-center text-xs transition-colors ${
                  isNow  ? "border-primary/30 bg-primary/5"
                  : isDone ? "border-success/20 bg-success/5"
                  : "border-border bg-surface/50"
                }`}
              >
                <Icon
                  size={16}
                  className={`mx-auto ${
                    isNow  ? "animate-pulse text-primary"
                    : isDone ? "text-success"
                    : "text-muted-foreground/50"
                  }`}
                />
                <p className="mt-1.5 font-medium">{label}</p>
              </div>
            );
          })}
        </div>

        {/* Tx status */}
        {txStatus && (
          <TxStatusCard
            status={txStatus}
            hash={reqHash}
            error={error ?? undefined}
            label={STAGE_LABELS[stage]}
          />
        )}

        {/* Child link */}
        {childId && (
          <div className="rounded-xl border border-success/20 bg-success/5 p-3 text-sm text-success">
            Child Agent #{childId.toString()} minted
          </div>
        )}

        {/* Request tx link */}
        {reqHash && stage !== "idle" && (
          <ExplorerLinkWrapper value={reqHash} type="tx" className="text-xs" />
        )}

        {/* CTA */}
        {stage === "idle" && (
          <ActionButton
            className="w-full"
            onClick={handleRequestEvolution}
            disabled={!canEvolve}
            title={!COORDINATOR_ADDRESS ? "Set NEXT_PUBLIC_EVOLUTION_COORDINATOR_CONTRACT" : undefined}
          >
            Trigger Evolution
          </ActionButton>
        )}
        {(stage === "done" || stage === "failed") && (
          <ActionButton variant="outline" className="w-full" onClick={reset}>
            Reset
          </ActionButton>
        )}

        {!COORDINATOR_ADDRESS && (
          <p className="text-center text-xs text-accent-alert">
            Evolution Coordinator not configured.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}
