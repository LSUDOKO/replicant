"use client";

import { useMemo } from "react";

import { useTotalSupply, useAgents } from "@/lib/queries/agents";
import { publicEnv } from "@/lib/env";
import { SPECIES_INFO } from "@/lib/constants";
import type { Agent, StatCard, EvolutionEvent, ActivityEvent } from "@/types";

const CONTRACT_CONFIGURED = !!publicEnv.contracts.agentId;

function deriveStats(agents: Agent[]): StatCard[] {
  const active = agents.filter((a) => a.status === "active").length;
  // Total evolutions is the number of agents that were created via evolution (have a parent)
  const totalEvolutions = agents.filter((a) => a.parentId !== null).length;
  
  // Calculate real average fitness from all agents
  const avgFitness =
    agents.length > 0
      ? Math.round(agents.reduce((sum, a) => sum + a.fitnessScore, 0) / agents.length)
      : 0;
  
  return [
    { label: "Active Agents", value: String(active), change: `${agents.length} total`, changeType: "positive" },
    { label: "Total Evolutions", value: String(totalEvolutions), change: "on-chain", changeType: "positive" },
    { label: "Avg Fitness", value: `${avgFitness}%`, change: "live", changeType: "positive" },
    { label: "Agents Minted", value: String(agents.length), change: "on-chain", changeType: "positive" },
  ];
}

function deriveEvolutions(agents: Agent[]): EvolutionEvent[] {
  const evolutions: EvolutionEvent[] = [];

  // 1. Add completed evolutions (agents that have a parent)
  const evolvedAgents = agents.filter((a) => a.parentId !== null);
  evolvedAgents.forEach((child) => {
    const parent = agents.find(a => a.id === child.parentId);
    const parentGeneration = parent ? parent.generation : child.generation - 1;
    const fitnessImprovement = parent ? child.fitnessScore - parent.fitnessScore : child.fitnessScore;
    
    evolutions.push({
      id: `evo-done-${child.id}`,
      agentId: child.id,
      agentName: child.name,
      parentGeneration,
      childGeneration: child.generation,
      status: child.status === "slashed" ? "failed" : "completed",
      fitnessImprovement,
      mutationStrategy: "prompt_paraphrase",
      startedAt: child.createdAt,
      completedAt: child.createdAt,
      txHash: child.txHash,
    });
  });

  // 2. Add in-progress evolutions (agents with status 'evolving')
  const mutatingAgents = agents.filter((a) => a.status === "evolving");
  mutatingAgents.forEach((parent) => {
    // Check if this parent already has a completed child evolution to avoid double counting
    // (though 'evolving' status usually means it's currently mutating into a NEW child)
    evolutions.push({
      id: `evo-prog-${parent.id}`,
      agentId: parent.id,
      agentName: parent.name,
      parentGeneration: parent.generation,
      childGeneration: parent.generation + 1,
      status: "mutating",
      fitnessImprovement: 0,
      mutationStrategy: "prompt_paraphrase",
      startedAt: new Date().toISOString(),
      txHash: parent.txHash,
    });
  });

  // Sort by most recent
  return evolutions.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
}

function deriveActivity(agents: Agent[]): ActivityEvent[] {
  const events: ActivityEvent[] = [];
  agents.forEach((a, i) => {
    const speciesName = SPECIES_INFO[a.species]?.name ?? a.species;
    events.push({
      id: `act-mint-${i}`,
      type: "mint",
      agentId: a.id,
      agentName: a.name,
      description: `Gen-${a.generation} ${speciesName} minted by ${a.creator.slice(0, 8)}...`,
      timestamp: a.createdAt,
      txHash: a.txHash,
    });
    if (a.parentId !== null) {
      events.push({
        id: `act-evo-${i}`,
        type: "evolution",
        agentId: a.id,
        agentName: a.name,
        description: `Evolution completed - Fitness ${a.fitnessScore}%`,
        timestamp: a.createdAt,
        txHash: a.txHash,
      });
    }
    if (a.status === "slashed") {
      events.push({
        id: `act-slash-${i}`,
        type: "slash",
        agentId: a.id,
        agentName: a.name,
        description: `Slashed - alignment violation detected`,
        timestamp: a.createdAt,
        txHash: a.txHash,
      });
    }
  });
  events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return events;
}

export function useDashboardData() {
  const supplyResult = useTotalSupply();
  const totalSupply = CONTRACT_CONFIGURED
    ? Number(supplyResult.data ?? 0n)
    : 0;

  const { agents: chainAgents, isLoading, error } = useAgents(totalSupply);

  const agents = useMemo<Agent[]>(() => {
    if (isLoading) return [];
    if (error) return [];
    return chainAgents;
  }, [chainAgents, isLoading, error]);

  const stats = useMemo<StatCard[]>(() => {
    if (isLoading) return [];
    return deriveStats(agents);
  }, [agents, isLoading]);

  const evolutions = useMemo<EvolutionEvent[]>(() => {
    return deriveEvolutions(agents);
  }, [agents]);

  const activity = useMemo<ActivityEvent[]>(() => {
    return deriveActivity(agents);
  }, [agents]);

  return {
    agents,
    stats,
    activity,
    evolutions,
    isLoading: CONTRACT_CONFIGURED && isLoading,
    isMockData: false,
    refetch: supplyResult.refetch,
  };
  }