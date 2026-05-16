"use client";

import { useState } from "react";
import { BaseError, keccak256, toHex, type Address, type Hash, type Hex, parseEventLogs, encodeFunctionData } from "viem";
import { useAccount, useWriteContract, useSendTransaction, usePublicClient, useReadContract } from "wagmi";
import { FlaskConical, Loader2, ShieldCheck, CheckCircle2, XCircle, AlertTriangle, ExternalLink } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ActionButton } from "@/components/ui/action-button";
import { SpeciesIcon } from "@/components/shared/SpeciesIcon";
import { TxStatusCard } from "@/components/shared/TxStatusCard";
import { ExplorerLinkWrapper } from "@/components/shared/ExplorerLink";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { replicantEvolutionCoordinatorAbi, evolutionCoordinatorContractAddresses } from "@/lib/contracts/evolution-coordinator";
import { publicEnv } from "@/lib/env";
import { useDashboardData } from "@/lib/queries/use-dashboard-data";
import { useReplicantStore } from "@/lib/store";
import { SPECIES_INFO } from "@/lib/constants";

export type Stage = "idle" | "requesting" | "requested" | "computing" | "aligning" | "minting" | "done" | "failed";

const COORDINATOR_ADDRESS = evolutionCoordinatorContractAddresses[publicEnv.network] as Address | undefined;

const STAGE_LABELS: Record<Stage, string> = {
  idle:       "Ready",
  requesting: "Submitting",
  requested:  "Queued",
  computing:  "TEE Computing",
  aligning:   "Alignment Scan",
  minting:    "Minting",
  done:       "Complete",
  failed:     "Failed",
};

const STAGE_PROGRESS: Record<Stage, number> = {
  idle: 0, requesting: 15, requested: 25,
  computing: 55, aligning: 75, minting: 90, done: 100, failed: 0,
};

export function EvolutionCard({ onStageChange }: { onStageChange?: (stage: Stage) => void }) {
  const publicClient = usePublicClient();
  const { isConnected, address } = useAccount();
  const { agents, refetch } = useDashboardData();
  const activeAgentId = useReplicantStore((s) => s.activeAgentId);
  const setActiveAgent = useReplicantStore((s) => s.setActiveAgent);

  const { data: evolutionExecutor } = useReadContract({
    address: publicEnv.contracts.agentId,
    abi: [
      {
        type: "function",
        name: "evolutionExecutor",
        stateMutability: "view",
        inputs: [],
        outputs: [{ type: "address" }],
      },
    ],
    functionName: "evolutionExecutor",
    query: { enabled: !!publicEnv.contracts.agentId },
  });

  const isWired = evolutionExecutor?.toString().toLowerCase() === COORDINATOR_ADDRESS?.toLowerCase();

  const { data: coordinatorTeeExecutor } = useReadContract({
    address: COORDINATOR_ADDRESS,
    abi: [
      {
        type: "function",
        name: "teeExecutor",
        stateMutability: "view",
        inputs: [],
        outputs: [{ type: "address" }],
      },
    ],
    functionName: "teeExecutor",
    query: { enabled: !!COORDINATOR_ADDRESS },
  });

  const isTeeExecutor = coordinatorTeeExecutor?.toString().toLowerCase() === address?.toLowerCase();

  const [stage, setStageInternal] = useState<Stage>("idle");
  const setStage = (s: Stage) => {
    setStageInternal(s);
    onStageChange?.(s);
  };
  const [error, setError] = useState<string | null>(null);
  const [childId, setChildId] = useState<bigint | null>(null);
  const [evolutionData, setEvolutionData] = useState<{
    childGenomeHash?: string;
    storageRootHash?: string;
    teeAttestationHash?: string;
    alignmentVerdictHash?: string;
    fitnessImprovement?: number;
  }>({});

  const [pendingCompleteData, setPendingCompleteData] = useState<{
    requestId: number;
    childGenomeHash: string;
    storageRootHash: string;
    teeAttestationHash: string;
    alignmentVerdictHash: string;
    fitnessScore: number;
  } | null>(null);

   const userAgents = agents.filter((a) => a.owner.toLowerCase() === address?.toLowerCase());
   // Priority: Active > Evolving > Slashed > Archived
   const sortedUserAgents = [...userAgents].sort((a, b) => {
     const order: Record<string, number> = { active: 0, evolving: 1, slashed: 2, archived: 3 };
     return (order[a.status] ?? 4) - (order[b.status] ?? 4);
   });
   
   const evolvableAgents = userAgents.filter((a) => a.status === "active" || a.status === "evolving");
   const activeAgent = userAgents.find((a) => a.id === activeAgentId) ?? evolvableAgents[0] ?? userAgents[0];

   // Separate write contracts for each transaction to avoid wallet popup conflicts
   const { data: reqHash, isPending: reqPending, writeContractAsync: writeRequestEvolution, reset: resetReq } = useWriteContract();
   const { data: completeHashState, isPending: completePending, sendTransactionAsync: sendCompleteEvolution, reset: resetComplete } = useSendTransaction();

   // Pre-flight check: Verify user owns the active agent on-chain
   const { data: agentOwner } = useReadContract({
     address: publicEnv.contracts.agentId,
     abi: [
       {
         type: "function",
         name: "ownerOf",
         stateMutability: "view",
         inputs: [{ type: "uint256" }],
         outputs: [{ type: "address" }],
       },
     ],
     functionName: "ownerOf",
     args: [BigInt(activeAgent?.id ?? 0)],
     query: { enabled: !!activeAgent?.id && !!publicEnv.contracts.agentId },
   });

   // canEvolve requires: active status, wallet connected, coordinator available, and on-chain ownership verified
   const ownershipVerified = agentOwner?.toLowerCase() === address?.toLowerCase();
   const canEvolve = activeAgent?.status === "active" && isConnected && !!COORDINATOR_ADDRESS && (agentOwner === undefined || ownershipVerified);

  async function handleRequestEvolution() {
    if (!activeAgent || !COORDINATOR_ADDRESS) return;
    if (activeAgent.status === "evolving") {
      setError("This agent is already in the mutation chamber.");
      return;
    }
     setError(null);
     setStage("requesting");
     resetReq();
     resetComplete();

      try {
       // First check: UI-level ownership (from dashboard data)
       if (activeAgent.owner.toLowerCase() !== address?.toLowerCase()) {
         throw new Error("You do not own this agent (UI check). Ownership is required for evolution.");
       }

       // Second check: On-chain ownership verification (if available)
       if (agentOwner && agentOwner.toLowerCase() !== address?.toLowerCase()) {
         throw new Error(
           `On-chain ownership mismatch. You: ${address}, Owner: ${agentOwner}. The agent was possibly transferred.`
         );
       }

      // Ensure we have a valid 32-byte hash.
      const rawTxHash = activeAgent.txHash as Hash;
      const parentGenomeHash = (rawTxHash && rawTxHash.length === 66)
        ? rawTxHash
        : keccak256(toHex(`genesis-genome-${activeAgent.species}-v1`));

      // eslint-disable-next-line react-hooks/purity
      const timestamp = Date.now();
      const performanceHistoryHash = keccak256(
        toHex(`perf-history-${activeAgent.id}-${timestamp}`)
      );

      // Check if coordinator is authorized - if not, use simulation mode
      if (!isWired) {
        // SIMULATION MODE: Skip on-chain transaction, go straight to TEE computation
        setStage("computing");
        await delay(1000);

        const evolveRes = await fetch("/api/compute/evolve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            requestId: Math.floor(Math.random() * 1000000),
            parentId: activeAgent.id,
            parentGenomeHash,
            performanceHistoryHash,
          }),
        });
        const evolveData = await evolveRes.json();
        if (!evolveRes.ok) throw new Error(evolveData.error ?? "Evolution failed");

        setEvolutionData({
          childGenomeHash: evolveData.childGenomeHash,
          storageRootHash: evolveData.storageRootHash,
          teeAttestationHash: evolveData.teeAttestationHash,
          fitnessImprovement: evolveData.fitnessImprovement,
        });

        setStage("aligning");
        await delay(800);

        const alignRes = await fetch("/api/alignment/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ agentId: activeAgent.id, genomeHash: evolveData.childGenomeHash }),
        });
        const alignData = await alignRes.json();
        if (!alignRes.ok) throw new Error(alignData.error ?? "Alignment scan failed");

        if (!alignData.passed) {
          throw new Error("Alignment scan failed - agent rejected for safety violations");
        }

        setEvolutionData(prev => ({
          ...prev,
          alignmentVerdictHash: alignData.alignmentVerdictHash,
        }));

        setStage("minting");
        await delay(500);

        // Store evolution event in localStorage for persistence
        const evolutionEvent = {
          id: `evo-sim-${Date.now()}`,
          agentId: activeAgent.id,
          agentName: activeAgent.name,
          parentGeneration: activeAgent.generation,
          childGeneration: activeAgent.generation + 1,
          status: "completed",
          fitnessImprovement: evolveData.fitnessImprovement,
          mutationStrategy: "prompt_paraphrase",
          startedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          txHash: evolveData.childGenomeHash, // Use genome hash as tx identifier
          childGenomeHash: evolveData.childGenomeHash,
          storageRootHash: evolveData.storageRootHash,
          teeAttestationHash: evolveData.teeAttestationHash,
          alignmentVerdictHash: alignData.alignmentVerdictHash,
        };
        
        // Store in localStorage
        const existingEvolutions = JSON.parse(localStorage.getItem("replicant-evolutions") || "[]");
        existingEvolutions.unshift(evolutionEvent);
        localStorage.setItem("replicant-evolutions", JSON.stringify(existingEvolutions));

        setChildId(BigInt(activeAgent.id));
        setStage("done");
        refetch();
        return;
      }

       // PRODUCTION MODE: Full on-chain transaction flow
       let hash: Hash;
       try {
         hash = await writeRequestEvolution({
           address: COORDINATOR_ADDRESS,
           abi: replicantEvolutionCoordinatorAbi,
           functionName: "requestEvolution",
           args: [BigInt(activeAgent.id), parentGenomeHash, performanceHistoryHash],
         });

         setStage("requested");
       } catch (writeErr) {
         console.error("requestEvolution write error:", writeErr);
         // Provide more detailed error info
         if (writeErr instanceof Error) {
           throw new Error(`Contract call failed: ${writeErr.message}`);
         }
         throw writeErr;
       }

       // Wait for confirmation to get requestId
       if (!publicClient) throw new Error("Public client not available");
       const receipt = await publicClient.waitForTransactionReceipt({ hash });
      const logs = parseEventLogs({
        abi: replicantEvolutionCoordinatorAbi,
        eventName: "EvolutionRequested",
        logs: receipt.logs,
      });

      const requestId = logs[0]?.args?.requestId;
      if (!requestId) throw new Error("Could not find requestId in transaction logs");

      // Trigger TEE Evolution (Simulated API)
      setStage("computing");
      const evolveRes = await fetch("/api/compute/evolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: Number(requestId),
          parentId: activeAgent.id,
          parentGenomeHash,
          performanceHistoryHash,
        }),
      });
      const evolveData = await evolveRes.json();
      if (!evolveRes.ok) throw new Error(evolveData.error ?? "Evolution failed");

      setEvolutionData({
        childGenomeHash: evolveData.childGenomeHash,
        storageRootHash: evolveData.storageRootHash,
        teeAttestationHash: evolveData.teeAttestationHash,
        fitnessImprovement: evolveData.fitnessImprovement,
      });

      setStage("aligning");
      await delay(800);

      const alignRes = await fetch("/api/alignment/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId: activeAgent.id, genomeHash: evolveData.childGenomeHash }),
      });
      const alignData = await alignRes.json();
      if (!alignRes.ok) throw new Error(alignData.error ?? "Alignment scan failed");

      if (!alignData.passed) {
        throw new Error("Alignment scan failed - agent rejected for safety violations");
      }

      setEvolutionData(prev => ({
        ...prev,
        alignmentVerdictHash: alignData.alignmentVerdictHash,
      }));

       setStage("minting");
       await delay(500);

       // completion must be submitted by the authorized TEE executor
       // store request data so the Complete button can use it
       setPendingCompleteData({
         requestId: Number(requestId),
         childGenomeHash: evolveData.childGenomeHash,
         storageRootHash: evolveData.storageRootHash,
         teeAttestationHash: evolveData.teeAttestationHash,
         alignmentVerdictHash: alignData.alignmentVerdictHash,
         fitnessScore: Math.floor(activeAgent.fitnessScore + evolveData.fitnessImprovement),
       });
        setStage("minting");
        return;

     } catch (err) {
       console.error("Evolution failed:", err);
       setError(err instanceof BaseError ? err.shortMessage : err instanceof Error ? err.message : "Evolution failed");
       setStage("failed");
     }
   }

    async function handleCompleteEvolution() {
      if (!pendingCompleteData || !COORDINATOR_ADDRESS) return;
      try {
        const data = encodeFunctionData({
          abi: replicantEvolutionCoordinatorAbi,
          functionName: "completeEvolution",
          args: [
            BigInt(pendingCompleteData.requestId),
            pendingCompleteData.childGenomeHash as `0x${string}`,
            pendingCompleteData.storageRootHash as `0x${string}`,
            pendingCompleteData.teeAttestationHash as `0x${string}`,
            pendingCompleteData.alignmentVerdictHash as `0x${string}`,
            BigInt(pendingCompleteData.fitnessScore),
            [],
          ],
        });
        const completeHash = await sendCompleteEvolution({
          to: COORDINATOR_ADDRESS,
          data: data as Hex,
        });

       if (!publicClient) throw new Error("Public client not available");
       const completeReceipt = await publicClient.waitForTransactionReceipt({ hash: completeHash });
       const completeLogs = parseEventLogs({
         abi: replicantEvolutionCoordinatorAbi,
         eventName: "EvolutionCompleted",
         logs: completeReceipt.logs,
       });

       const childId = completeLogs[0]?.args?.childId;
       if (!childId) throw new Error("Could not find childId in EvolutionCompleted event");

       const evolutionEvent = {
         id: `evo-chain-${pendingCompleteData.requestId}`,
         agentId: activeAgent?.id ?? 0,
         agentName: activeAgent?.name ?? "",
         parentGeneration: activeAgent?.generation ?? 0,
         childGeneration: (activeAgent?.generation ?? 0) + 1,
         status: "completed",
         fitnessImprovement: evolutionData.fitnessImprovement ?? 0,
         mutationStrategy: "prompt_paraphrase",
         startedAt: new Date().toISOString(),
         completedAt: new Date().toISOString(),
         txHash: completeHash,
         childGenomeHash: pendingCompleteData.childGenomeHash,
         storageRootHash: pendingCompleteData.storageRootHash,
         teeAttestationHash: pendingCompleteData.teeAttestationHash,
         alignmentVerdictHash: pendingCompleteData.alignmentVerdictHash,
       };
       const existingEvolutions = JSON.parse(localStorage.getItem("replicant-evolutions") || "[]");
       existingEvolutions.unshift(evolutionEvent);
       localStorage.setItem("replicant-evolutions", JSON.stringify(existingEvolutions));

       setChildId(childId);
       setStage("done");
       setPendingCompleteData(null);
       refetch();
     } catch (err) {
       console.error("completeEvolution failed:", err);
       setError(err instanceof BaseError ? err.shortMessage : err instanceof Error ? err.message : "completeEvolution failed");
       setStage("failed");
     }
   }

   function reset() {
     setStage("idle");
     setError(null);
     setChildId(null);
     setEvolutionData({});
     setPendingCompleteData(null);
     resetReq();
     resetComplete();
   }

   const txStatus =
     reqPending ? "signing"
     : completePending ? "signing"
     : stage === "requested" ? "pending"
     : stage === "minting" ? "pending"
     : stage === "done" ? "confirmed"
     : stage === "failed" ? "failed"
     : null;

  if (!activeAgent && !isConnected) {
    return (
      <Card className="border-white/10 bg-black">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <FlaskConical size={40} className="text-white/30" />
          <p className="mt-4 text-sm text-white/60">Connect wallet to access Evolution Chamber</p>
        </CardContent>
      </Card>
    );
  }

  if (!activeAgent) {
    return (
      <Card className="border-white/10 bg-black">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <FlaskConical size={40} className="text-white/30" />
          <p className="mt-4 text-sm text-white/60">No agents found. Mint a Genesis agent first.</p>
        </CardContent>
      </Card>
    );
  }

  const isActive = stage !== "idle" && stage !== "done" && stage !== "failed";
  const progress = STAGE_PROGRESS[stage];

  return (
    <Card className={`overflow-hidden bg-black border ${isActive ? "border-violet-500/50" : "border-white/10"}`}>
      <CardHeader className="pb-3 border-b border-white/10">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-medium text-white">
            <FlaskConical size={18} className={isActive ? "text-violet-500 animate-pulse" : "text-white/60"} />
            Evolution Chamber
          </CardTitle>
          {isActive && (
            <Badge className="border-violet-500/20 bg-violet-500/10 text-violet-400">
              <Loader2 size={12} className="mr-1 animate-spin" />
              {STAGE_LABELS[stage]}
            </Badge>
          )}
          {stage === "done" && (
            <Badge className="border-violet-500/20 bg-violet-500/10 text-violet-400">
              <CheckCircle2 size={12} className="mr-1" />
              Complete
            </Badge>
          )}
          {stage === "failed" && (
            <Badge className="border-white/20 bg-white/10 text-white">
              <XCircle size={12} className="mr-1" />
              Failed
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-5 pt-6">
        {/* Agent Selector */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-white/60">Select Agent to Evolve</label>
          <Select
            value={activeAgent.id}
            onValueChange={(value) => value && setActiveAgent(value)}
            disabled={isActive}
          >
            <SelectTrigger className="w-full bg-black border-white/10 text-white">
              <SelectValue placeholder="Select an agent" />
            </SelectTrigger>
            <SelectContent className="bg-black border-white/10">
              {sortedUserAgents.map((agent) => (
                <SelectItem key={agent.id} value={agent.id} className="text-white focus:bg-white/10">
                  <div className="flex items-center gap-2">
                    <SpeciesIcon species={agent.species} size={14} />
                    <span>{agent.name}</span>
                    <span className="text-[10px] text-white/40 uppercase tracking-tighter">(Gen-{agent.generation} &middot; {agent.status})</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Agent info summary */}
        <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-black p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-black text-violet-500 font-bold text-sm">
            {SPECIES_INFO[activeAgent.species]?.name.slice(0, 2).toUpperCase() ?? "AG"}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-white">{activeAgent.name}</p>
              <Badge variant="outline" className="text-[10px] uppercase tracking-wider border-white/20 text-white/80">
                Gen-{activeAgent.generation}
              </Badge>
            </div>
            <div className="mt-1 flex items-center gap-3 text-xs text-white/60">
              <span>Fitness: {activeAgent.fitnessScore}%</span>
              <span>•</span>
              <span className="capitalize">Status: {activeAgent.status}</span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        {stage !== "idle" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/60">{STAGE_LABELS[stage]}</span>
              <span className="font-mono text-xs text-violet-400">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2 bg-white/10" />
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
                  isNow  ? "border-violet-500/30 bg-violet-500/5"
                  : isDone ? "border-violet-500/20 bg-violet-500/5"
                  : "border-white/10 bg-black"
                }`}
              >
                <Icon
                  size={16}
                  className={`mx-auto ${
                    isNow  ? "animate-pulse text-violet-500"
                    : isDone ? "text-violet-400"
                    : "text-white/30"
                  }`}
                />
                <p className="mt-1.5 font-medium text-white">{label}</p>
              </div>
            );
          })}
        </div>

        {/* Evolution Data */}
        {(evolutionData.childGenomeHash || evolutionData.storageRootHash || evolutionData.teeAttestationHash || evolutionData.alignmentVerdictHash) && (
          <div className="space-y-2 rounded-lg border border-white/10 bg-black p-3">
            <p className="text-xs font-medium text-white/80">Evolution Data</p>
            <div className="space-y-1.5 text-xs font-mono">
              {evolutionData.childGenomeHash && (
                <div className="flex justify-between">
                  <span className="text-white/60">Child Genome:</span>
                  <span className="text-violet-400 break-all">{evolutionData.childGenomeHash.slice(0, 10)}...{evolutionData.childGenomeHash.slice(-8)}</span>
                </div>
              )}
              {evolutionData.storageRootHash && (
                <div className="flex justify-between">
                  <span className="text-white/60">Storage Root:</span>
                  <span className="text-violet-400 break-all">{evolutionData.storageRootHash.slice(0, 10)}...{evolutionData.storageRootHash.slice(-8)}</span>
                </div>
              )}
              {evolutionData.teeAttestationHash && (
                <div className="flex justify-between">
                  <span className="text-white/60">TEE Attestation:</span>
                  <span className="text-violet-400 break-all">{evolutionData.teeAttestationHash.slice(0, 10)}...{evolutionData.teeAttestationHash.slice(-8)}</span>
                </div>
              )}
              {evolutionData.alignmentVerdictHash && (
                <div className="flex justify-between">
                  <span className="text-white/60">Alignment Verdict:</span>
                  <span className="text-violet-400 break-all">{evolutionData.alignmentVerdictHash.slice(0, 10)}...{evolutionData.alignmentVerdictHash.slice(-8)}</span>
                </div>
              )}
              {evolutionData.fitnessImprovement !== undefined && (
                <div className="flex justify-between">
                  <span className="text-white/60">Fitness Improvement:</span>
                  <span className="text-violet-400">+{evolutionData.fitnessImprovement}%</span>
                </div>
              )}
            </div>
          </div>
        )}

         {/* Tx status */}
         {txStatus && (
           <TxStatusCard
             status={txStatus}
             hash={stage === "minting" ? completeHashState : reqHash}
             error={error ?? undefined}
             label={STAGE_LABELS[stage]}
           />
         )}

         {/* Child link */}
         {childId && stage === "done" && (
           <div className="flex items-center gap-2 rounded-xl border border-violet-500/20 bg-violet-500/5 p-3 text-sm text-violet-400">
             <CheckCircle2 size={16} />
             {isWired 
               ? `Evolution Successful! Child Agent #${childId.toString()} minted`
               : `Evolution Simulated! Data generated for Agent #${childId.toString()}`
             }
           </div>
         )}

         {/* Wiring Warning */}
         {!isWired && COORDINATOR_ADDRESS && isConnected && (
           <div className="flex flex-col gap-2 rounded-xl border border-violet-500/20 bg-violet-500/5 p-3 text-xs text-white">
             <div className="flex items-center gap-2 font-bold text-violet-400">
               <AlertTriangle size={14} />
               SIMULATION MODE
             </div>
             <p className="text-white/80">
               Evolution Coordinator not authorized on Agent NFT contract. Running in simulation mode - evolution data will be generated but not minted on-chain.
             </p>
             <div className="mt-1 rounded bg-black/20 p-2 font-mono break-all text-white/60 text-[10px]">
               Expected: {COORDINATOR_ADDRESS.slice(0, 10)}...{COORDINATOR_ADDRESS.slice(-8)}
               <br />
               Actual: {evolutionExecutor ? `${evolutionExecutor.toString().slice(0, 10)}...${evolutionExecutor.toString().slice(-8)}` : "None"}
             </div>
           </div>
         )}

         {/* Request tx link */}
         {(reqHash || completeHashState) && stage !== "idle" && (
           <ExplorerLinkWrapper value={stage === "minting" ? completeHashState : reqHash} type="tx" className="text-xs" />
        )}

        {/* CTA */}
         {stage === "idle" && (
           <ActionButton
             className="w-full py-6 bg-violet-500 hover:bg-violet-600 text-white border-0"
             onClick={handleRequestEvolution}
             disabled={!canEvolve}
             title={
               !COORDINATOR_ADDRESS ? "Set NEXT_PUBLIC_EVOLUTION_COORDINATOR_CONTRACT"
               : !activeAgent ? "No agent selected"
               : activeAgent.status !== "active" ? "Agent must be Active to evolve"
               : agentOwner && agentOwner.toLowerCase() !== address?.toLowerCase() ? `Ownership mismatch: You (${address?.slice(0, 6)}...) vs Owner (${agentOwner?.slice(0, 6)}...)`
               : undefined
             }
           >
             Trigger Evolution
           </ActionButton>
         )}
          {(stage === "done" || stage === "failed") && (
           <ActionButton variant="outline" className="w-full border-white/20 text-white hover:bg-white/5" onClick={reset}>
             Reset Chamber
           </ActionButton>
          )}
          {stage === "minting" && pendingCompleteData && (
           <ActionButton
             className="w-full py-6 bg-violet-500 hover:bg-violet-600 text-white border-0"
             onClick={handleCompleteEvolution}
             disabled={completePending}
             title={!COORDINATOR_ADDRESS ? "Evolution Coordinator not configured" : undefined}
           >
             {completePending ? (
               <><Loader2 size={16} className="mr-2 animate-spin" /> Signing...</>
             ) : (
               "Complete Evolution (Mint Child)"
             )}
           </ActionButton>
          )}

        {!COORDINATOR_ADDRESS && (
          <p className="text-center text-xs text-white/60">
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

