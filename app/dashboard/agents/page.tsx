"use client";

import { useMemo } from "react";
import { useAccount } from "wagmi";
import { Loader2, ExternalLink, Activity } from "lucide-react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { SpeciesIcon } from "@/components/shared/SpeciesIcon";
import { SPECIES_INFO } from "@/lib/constants";
import { SPECIES_IMAGES } from "@/lib/species/engine";
import { publicEnv } from "@/lib/env";
import { useTotalSupply, useAgents } from "@/lib/queries/agents";
import type { AgentSpecies, AgentStatus } from "@/types";

export default function MyAgentsPage() {
  const { address, isConnected } = useAccount();
  const supplyQuery = useTotalSupply();
  const totalSupply = Number(supplyQuery.data ?? 0n);
  const { agents: chainAgents, isLoading: agentsLoading, error } = useAgents(totalSupply);

  const myAgents = useMemo(() => {
    if (!address || chainAgents.length === 0) return [];
    const addr = address.toLowerCase();
    return chainAgents.filter(a => a.owner.toLowerCase() === addr || a.creator.toLowerCase() === addr);
  }, [chainAgents, address]);

  if (!isConnected) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Agents</h1>
          <p className="text-sm text-muted-foreground">Connect your wallet to view your agents.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Agents</h1>
          <p className="text-sm text-muted-foreground">
            {myAgents.length > 0 ? `${myAgents.length} agent${myAgents.length > 1 ? "s" : ""} found` : "Your minted agents will appear here"}
          </p>
        </div>
        <Link
          href="/dashboard/genesis"
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
        >
          Mint New Agent
        </Link>
      </div>

      {agentsLoading ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <Loader2 size={28} className="animate-spin text-muted-foreground/50" />
        </div>
      ) : myAgents.length === 0 ? (
        <GlassCard className="p-8 text-center">
          <Activity className="mx-auto h-10 w-10 text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground">No agents minted yet</p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Go to{" "}
            <Link href="/dashboard/genesis" className="text-primary hover:underline">
              Genesis Minting
            </Link>{" "}
            to create your first agent
          </p>
        </GlassCard>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {myAgents.map((agent) => (
            <AgentCard key={agent.id} agentId={agent.id} species={agent.species} generation={agent.generation} status={agent.status} />
          ))}
        </div>
      )}
    </div>
  );
}

function AgentCard({ agentId, species, generation, status }: { agentId: string; species: AgentSpecies; generation: number; status: AgentStatus }) {
  const speciesInfo = SPECIES_INFO[species];
  const speciesImage = SPECIES_IMAGES[species];
  
  return (
    <Link href={`/dashboard/agents/${agentId}`}>
      <GlassCard className="p-0 overflow-hidden hover:border-primary/40 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_8px_30px_rgba(139,92,246,0.15)] group">
        {/* Species Image Header */}
        <div className="relative h-32 w-full overflow-hidden bg-[#050505]">
          <img
            src={speciesImage}
            alt={speciesInfo.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            style={{ objectPosition: 'center center' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black/90" />
          
          {/* Status Badge Overlay */}
          <div className="absolute top-3 right-3">
            <StatusBadge status={status} />
          </div>
          
          {/* Agent Info Overlay */}
          <div className="absolute bottom-3 left-3 right-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-white drop-shadow-lg">Agent #{agentId}</p>
                <p className="text-[10px] text-white/70 mt-0.5">{speciesInfo.name}</p>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/20 bg-black/40 backdrop-blur-sm">
                <SpeciesIcon species={species} size={16} />
              </div>
            </div>
          </div>
        </div>

        {/* Card Content */}
        <div className="p-4 space-y-3">
          {/* Species Description */}
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {speciesInfo.description}
          </p>

          {/* Stats Row */}
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <Activity size={10} className="text-[#8B5CF6]" />
                <span>Gen-{generation}</span>
              </div>
              <span className="text-[8px] text-muted-foreground/50">•</span>
              <span className="text-[10px] text-muted-foreground capitalize">{speciesInfo.domain}</span>
            </div>
            <ExternalLink size={12} className="text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </div>
      </GlassCard>
    </Link>
  );
}