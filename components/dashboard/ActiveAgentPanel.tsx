"use client";

import { Cpu, Dna } from "lucide-react";

import { ExplorerLinkWrapper } from "@/components/shared/ExplorerLink";
import { GlassCard } from "@/components/ui/glass-card";
import { MOCK_AGENTS } from "@/lib/mock-data";
import { useReplicantStore } from "@/lib/store";

export function ActiveAgentPanel() {
  const activeAgentId = useReplicantStore((state) => state.activeAgentId);
  const setActiveAgent = useReplicantStore((state) => state.setActiveAgent);
  const activeAgent =
    MOCK_AGENTS.find((agent) => agent.id === activeAgentId) ?? MOCK_AGENTS[0];

  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="label-uppercase text-accent-evolution">Active Agent</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight">
            {activeAgent.name}
          </h2>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border-bright bg-surface">
          <Dna size={18} className="text-primary" />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-xl border border-border bg-surface/50 p-3">
          <p className="font-mono text-lg text-primary">
            Gen-{activeAgent.generation}
          </p>
          <p className="label-uppercase mt-1 text-muted-foreground">Lineage</p>
        </div>
        <div className="rounded-xl border border-border bg-surface/50 p-3">
          <p className="font-mono text-lg text-accent-evolution">
            {activeAgent.fitnessScore}
          </p>
          <p className="label-uppercase mt-1 text-muted-foreground">Fitness</p>
        </div>
        <div className="rounded-xl border border-border bg-surface/50 p-3">
          <p className="font-mono text-lg text-success">
            {activeAgent.alignmentScore}
          </p>
          <p className="label-uppercase mt-1 text-muted-foreground">Safety</p>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between rounded-xl border border-border bg-surface/40 px-3 py-2">
        <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
          <Cpu size={14} className="text-accent-evolution" />
          Agent ID tx
        </span>
        <ExplorerLinkWrapper value={activeAgent.txHash} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {MOCK_AGENTS.slice(0, 4).map((agent) => (
          <button
            key={agent.id}
            type="button"
            onClick={() => setActiveAgent(agent.id)}
            className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-all duration-200 hover:border-accent-evolution/50 hover:text-foreground data-[active=true]:border-primary/40 data-[active=true]:bg-primary/10 data-[active=true]:text-primary"
            data-active={agent.id === activeAgent.id}
          >
            {agent.name}
          </button>
        ))}
      </div>
    </GlassCard>
  );
}
