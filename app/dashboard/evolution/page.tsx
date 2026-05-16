"use client";

import { useState } from "react";
import { EvolutionCard, Stage } from "@/components/evolution/EvolutionCard";
import { MutationLog } from "@/components/evolution/MutationLog";
import { EvolutionHistory } from "@/components/evolution/EvolutionHistory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, Database, Zap } from "lucide-react";

export default function EvolutionPage() {
  const [stage, setStage] = useState<Stage>("idle");
  const [txHash, setTxHash] = useState<string | undefined>();
  const [completeTxHash, setCompleteTxHash] = useState<string | undefined>();
  const [childGenomeHash, setChildGenomeHash] = useState<string | undefined>();
  const [storageRootHash, setStorageRootHash] = useState<string | undefined>();
  const [teeAttestationHash, setTeeAttestationHash] = useState<string | undefined>();
  const [alignmentVerdictHash, setAlignmentVerdictHash] = useState<string | undefined>();

  const handleStageChange = (s: Stage) => {
    setStage(s);
    if (s === "idle") {
      setTxHash(undefined);
      setCompleteTxHash(undefined);
      setChildGenomeHash(undefined);
      setStorageRootHash(undefined);
      setTeeAttestationHash(undefined);
      setAlignmentVerdictHash(undefined);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-white">Evolution Chamber</h1>
        <p className="text-sm text-white/60">
          Autonomous self-improvement protocol powered by 0G TEE and Alignment Nodes.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <EvolutionCard
          onStageChange={handleStageChange}
          onTxHash={setTxHash}
          onCompleteTxHash={setCompleteTxHash}
          onChildGenomeHash={setChildGenomeHash}
          onStorageRootHash={setStorageRootHash}
          onTeeAttestationHash={setTeeAttestationHash}
          onAlignmentVerdictHash={setAlignmentVerdictHash}
        />
        <MutationLog
          stage={stage}
          txHash={txHash}
          completeTxHash={completeTxHash}
          childGenomeHash={childGenomeHash}
          storageRootHash={storageRootHash}
          teeAttestationHash={teeAttestationHash}
          alignmentVerdictHash={alignmentVerdictHash}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <ProtocolFeature
          icon={<Database size={18} className="text-violet-500" />}
          title="0G Storage"
          description="Parent genomes are retrieved and child mutations are committed to the 0G Storage log layer for immutable lineage."
        />
        <ProtocolFeature
          icon={<Zap size={18} className="text-violet-500" />}
          title="0G Compute (TEE)"
          description="Mutations occur within a hardware-sealed TEE enclave, ensuring the agent's logic is modified without human interference."
        />
        <ProtocolFeature
          icon={<ShieldCheck size={18} className="text-violet-500" />}
          title="Alignment Nodes"
          description="Every mutation is audited by decentralized Alignment Nodes to ensure the agent remains helpful, harmless, and honest."
        />
      </div>

      <EvolutionHistory />

      <Card className="border-violet-500/20 bg-violet-500/5">
        <CardHeader className="pb-2 border-b border-violet-500/20">
          <CardTitle className="text-base font-medium text-white">How Evolution Works</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-white/80 leading-relaxed space-y-3 pt-4">
          <p>
            REPLICANT agents are not static programs; they are dynamic entities that evolve to overcome performance bottlenecks.
            When you trigger evolution, the following protocol is executed:
          </p>
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              <strong className="text-white">On-Chain Locking:</strong> The parent agent is locked in the Evolution Coordinator contract to prevent state changes during mutation.
            </li>
            <li>
              <strong className="text-white">Genome Decryption:</strong> The TEE Enclave pulls the encrypted genome from 0G Storage and decrypts it using a hardware-bound key.
            </li>
            <li>
              <strong className="text-white">Mutation Simulation:</strong> The TEE engine generates 50 mutation candidates and simulates them against thousands of historical data points.
            </li>
            <li>
              <strong className="text-white">Alignment Audit:</strong> The top-performing candidate is sent to an Alignment Node for a sub-second Safety Scan to detect any goal divergence.
            </li>
            <li>
              <strong className="text-white">Sealed Handover:</strong> A child agent is minted on 0G Galileo, inheriting the parent&apos;s reputation and stake, while the parent is archived into the immutable lineage.
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}

function ProtocolFeature({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <Card className="bg-black border-white/10">
      <CardContent className="pt-6">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-black border border-white/10">
          {icon}
        </div>
        <h3 className="mb-1 font-medium text-white">{title}</h3>
        <p className="text-xs text-white/60 leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}
