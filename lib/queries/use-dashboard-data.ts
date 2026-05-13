"use client";

import { useMemo } from "react";

import { useTotalSupply, useAgents } from "@/lib/queries/agents";
import { publicEnv } from "@/lib/env";
import { SPECIES_INFO } from "@/lib/constants";
import {
  MOCK_AGENTS,
  MOCK_STATS,
  MOCK_ACTIVITY,
  MOCK_EVOLUTION_EVENTS,
} from "@/lib/mock-data";
import type { Agent, StatCard, EvolutionEvent, ActivityEvent } from "@/types";

const CONTRACT_CONFIGURED = !!publicEnv.contracts.agentId;

function deriveStats(agents: Agent[]): StatCard[] {
  const active = agents.filter((a) => a.status === "active").length;
  const totalEvolutions = agents.reduce((sum, a) => sum + a.evolutionCount, 0);
  const avgFitness =
    agents.length > 0
      ? (agents.reduce((sum, a) => sum + a.fitnessScore, 0) / agents.length).toFixed(1)
      : "0";
  return [
    { label: "Active Agents", value: String(active), change: `${agents.length} total`, changeType: "positive" },
    { label: "Total Evolutions", value: String(totalEvolutions), change: "on-chain", changeType: "positive" },
    { label: "Avg Fitness", value: `${avgFitness}%`, change: "live", changeType: "positive" },
    { label: "Agents Minted", value: String(agents.length), change: "on-chain", changeType: "positive" },
  ];
}

function deriveEvolutions(agents: Agent[]): EvolutionEvent[] {
  return agents
    .filter((a) => a.parentId !== null)
    .map((a, i) => ({
      id: `evo-${i}`,
      agentId: a.id,
      agentName: a.name,
      parentGeneration: a.generation - 1,
      childGeneration: a.generation,
      status: a.status === "slashed" ? "failed" : "completed" as const,
      fitnessImprovement: a.fitnessScore,
      mutationStrategy: "prompt_paraphrase" as const,
      startedAt: a.createdAt,
      completedAt: a.createdAt,
      txHash: a.txHash,
    }));
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
    if (!CONTRACT_CONFIGURED) return MOCK_AGENTS;
    if (isLoading) return [];
    if (error || chainAgents.length === 0) return MOCK_AGENTS;
    return chainAgents;
  }, [chainAgents, isLoading, error]);

  const stats = useMemo<StatCard[]>(() => {
    if (!CONTRACT_CONFIGURED || (isLoading && chainAgents.length === 0)) return MOCK_STATS;
    return deriveStats(agents);
  }, [agents, isLoading, chainAgents.length]);

  const isMockData = !CONTRACT_CONFIGURED || (error !== null && chainAgents.length === 0);

  const evolutions = useMemo<EvolutionEvent[]>(() => {
    if (isMockData) return MOCK_EVOLUTION_EVENTS;
    return deriveEvolutions(agents);
  }, [agents, chainAgents, isMockData]);

  const activity = useMemo<ActivityEvent[]>(() => {
    if (isMockData) return MOCK_ACTIVITY;
    return deriveActivity(agents);
  }, [agents, chainAgents, isMockData]);

  return {
    agents,
    stats,
    activity,
    evolutions,
    isLoading: CONTRACT_CONFIGURED && isLoading,
    isMockData,
  };
}