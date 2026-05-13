"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AgentCard } from "./AgentCard";
import { AgentDetailModal } from "./AgentDetailModal";
import { GlassCard } from "@/components/ui/glass-card";
import { SPECIES_INFO } from "@/lib/constants";
import { useDashboardData } from "@/lib/queries/use-dashboard-data";
import { useListings } from "@/lib/queries/marketplace";
import { publicEnv } from "@/lib/env";
import type { Agent, AgentSpecies } from "@/types";

const CONTRACT_CONFIGURED = !!publicEnv.contracts.marketplace;

export function MarketplaceGrid() {
  const [search, setSearch] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("fitness");
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  const { agents, isLoading: agentsLoading, isMockData } = useDashboardData();

  // Fetch on-chain listings for all known token IDs
  const tokenIds = useMemo(
    () => agents.flatMap((a) => {
      if (/^\d+$/.test(a.id)) return [BigInt(a.id)];
      return [];
    }),
    [agents]
  );
  const { listings, isLoading: listingsLoading } = useListings(
    CONTRACT_CONFIGURED ? tokenIds : []
  );

  // Build a price map from on-chain listings
  const priceMap = useMemo(() => {
    const map = new Map<string, bigint>();
    for (const l of listings) map.set(l.tokenId.toString(), l.price);
    return map;
  }, [listings]);

  // Merge listing prices into agents; when mock, use agent.price
  const listedAgents = useMemo(() => {
    let pool: Agent[];

    if (isMockData) {
      pool = agents.filter((a) => a.price !== undefined);
    } else {
      pool = agents
        .filter((a) => priceMap.has(a.id))
        .map((a) => ({
          ...a,
          price: Number(priceMap.get(a.id)!) / 1e18,
        }));
    }

    if (search) {
      const q = search.toLowerCase();
      pool = pool.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          SPECIES_INFO[a.species].name.toLowerCase().includes(q)
      );
    }
    if (speciesFilter !== "all") {
      pool = pool.filter((a) => a.species === speciesFilter);
    }
    pool.sort((a, b) => {
      if (sortBy === "fitness") return b.fitnessScore - a.fitnessScore;
      if (sortBy === "price") return (b.price ?? 0) - (a.price ?? 0);
      if (sortBy === "generation") return b.generation - a.generation;
      return 0;
    });
    return pool;
  }, [agents, priceMap, isMockData, search, speciesFilter, sortBy]);

  const isLoading = agentsLoading || listingsLoading;

  return (
    <>
      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search agents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-surface border-border"
          />
        </div>
        <Select value={speciesFilter} onValueChange={(v) => setSpeciesFilter(v ?? "all")}>
          <SelectTrigger className="w-full sm:w-[180px] bg-surface border-border">
            <SelectValue placeholder="Filter by Species" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all">All Species</SelectItem>
            {(Object.keys(SPECIES_INFO) as AgentSpecies[]).map((key) => (
              <SelectItem key={key} value={key}>{SPECIES_INFO[key].name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v ?? "fitness")}>
          <SelectTrigger className="w-full sm:w-[160px] bg-surface border-border">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="fitness">Fitness Score</SelectItem>
            <SelectItem value="price">Price</SelectItem>
            <SelectItem value="generation">Generation</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isMockData && (
        <p className="text-xs text-muted-foreground/60">
          Showing demo data — deploy contracts and set env vars to see live listings.
        </p>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <GlassCard key={i} className="h-56 animate-pulse" />
          ))}
        </div>
      ) : listedAgents.length > 0 ? (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {listedAgents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} onSelect={setSelectedAgent} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Search size={40} className="opacity-30" />
          <p className="mt-4 text-sm">No agents listed for sale.</p>
        </div>
      )}

      <AgentDetailModal
        agent={selectedAgent}
        open={!!selectedAgent}
        onOpenChange={(open) => !open && setSelectedAgent(null)}
      />
    </>
  );
}
