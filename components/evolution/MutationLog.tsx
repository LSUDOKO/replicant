"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Lock, Hash } from "lucide-react";
import { type Stage } from "./EvolutionCard";
import { useReplicantStore } from "@/lib/store";
import { useDashboardData } from "@/lib/queries/use-dashboard-data";

interface LogEntry {
  time: string;
  hash: string;
  message: string;
}

export function MutationLog({
  stage,
  txHash,
  completeTxHash,
  childGenomeHash,
  storageRootHash,
  teeAttestationHash,
  alignmentVerdictHash,
}: {
  stage: Stage;
  txHash?: string;
  completeTxHash?: string;
  childGenomeHash?: string;
  storageRootHash?: string;
  teeAttestationHash?: string;
  alignmentVerdictHash?: string;
}) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeAgentId = useReplicantStore((s) => s.activeAgentId);
  const { agents } = useDashboardData();
  const activeAgent = agents.find(a => a.id === activeAgentId);

  const getTime = () => new Date().toLocaleTimeString([], { hour12: false });

  const addLog = (hash: string, message: string) => {
    const shortHash = hash.length > 18 ? hash.slice(0, 18) + "..." : hash;
    setLogs((prev) => [...prev, { time: getTime(), hash: shortHash, message }]);
  };

  useEffect(() => {
    if (stage === "idle") {
      setLogs([]);
      return;
    }
  }, [stage]);

  useEffect(() => {
    if (txHash && stage === "requested") {
      addLog(txHash, "Evolution request submitted to 0G Chain.");
      addLog(txHash, "Waiting for block confirmation...");
    }
  }, [txHash, stage]);

  useEffect(() => {
    if (stage === "computing") {
      addLog("0x0000000000000000000000000000000000000000", "TEE Evolution Chamber initialized.");
      if (activeAgent) {
        addLog("0x0000000000000000000000000000000000000000", `0G Storage: Downloading parent genome for ${activeAgent.name}...`);
        addLog("0x0000000000000000000000000000000000000000", "Genome decrypted in sealed hardware enclave.");
        addLog("0x0000000000000000000000000000000000000000", "Performance history analyzed. Generating mutation candidates...");
        addLog("0x0000000000000000000000000000000000000000", "Executing parallel simulations...");
        addLog("0x0000000000000000000000000000000000000000", "Alignment verification in progress...");
      }
    }
  }, [stage === "computing"]);

  useEffect(() => {
    if (stage === "done" && completeTxHash) {
      addLog(completeTxHash, "completeEvolution transaction confirmed.");
      if (childGenomeHash) addLog(childGenomeHash, `Child Genome: ${childGenomeHash.slice(0, 16)}...`);
      if (storageRootHash) addLog(storageRootHash, "0G Storage: Child genome uploaded.");
      if (teeAttestationHash) addLog(teeAttestationHash, "TEE Attestation verified.");
      if (alignmentVerdictHash) addLog(alignmentVerdictHash, "Alignment scan passed.");
      addLog("0x0000000000000000000000000000000000000000", "Parent archived. Lineage updated.");
      addLog("0x0000000000000000000000000000000000000000", "Evolution data stored in immutable history.");
    }
  }, [stage === "done"]);

  useEffect(() => {
    if (stage === "failed") {
      addLog("0x0000000000000000000000000000000000000000", "CRITICAL: Evolution process interrupted.");
    }
  }, [stage === "failed"]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [logs]);

  return (
    <Card className="border-white/10 bg-black">
      <CardHeader className="pb-2 border-b border-white/10">
        <CardTitle className="flex items-center gap-2 text-base font-medium text-white">
          <Lock size={16} className="text-white/60" />
          Mutation Log
          <span className="text-xs text-white/60">(real-time)</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <ScrollArea className="h-[320px] pr-2" ref={scrollRef}>
          <div className="space-y-2">
            {logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-white/30">
                <Hash size={40} />
                <p className="mt-2 text-xs">Waiting for evolution trigger...</p>
              </div>
            ) : (
              logs.map((entry, i) => (
                <div
                  key={i}
                  className="flex gap-3 rounded-lg border border-white/10 bg-black p-3 font-mono text-xs animate-in fade-in slide-in-from-left-2 duration-300"
                >
                  <span className="shrink-0 text-white/60">{entry.time}</span>
                  <Hash size={12} className="mt-0.5 shrink-0 text-violet-500/50" />
                  <span className="shrink-0 text-violet-400">{entry.hash}</span>
                  <span className="text-white/80">{entry.message}</span>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
