"use client";

import { useState, useMemo } from "react";
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
import { MOCK_AGENTS } from "@/lib/mock-data";
import { SPECIES_INFO } from "@/lib/constants";
import type { Agent, AgentSpecies } from "@/types";
import { Search } from "lucide-react";

export function MarketplaceGrid() {
  const [search, setSearch] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("fitness");
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  const listedAgents = useMemo(() => {
    let filtered = MOCK_AGENTS.filter((a) => a.price !== undefined);

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          SPECIES_INFO[a.species].name.toLowerCase().includes(q)
      );
    }

    if (speciesFilter !== "all") {
      filtered = filtered.filter((a) => a.species === speciesFilter);
    }

    filtered.sort((a, b) => {
      if (sortBy === "fitness") return b.fitnessScore - a.fitnessScore;
      if (sortBy === "price") return (b.price || 0) - (a.price || 0);
      if (sortBy === "generation") return b.generation - a.generation;
      return 0;
    });

    return filtered;
  }, [search, speciesFilter, sortBy]);

  return (
    <>
      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Search agents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-surface border-border"
          />
        </div>
        <Select value={speciesFilter} onValueChange={(val) => setSpeciesFilter(val ?? "all")}>
          <SelectTrigger className="w-full sm:w-[180px] bg-surface border-border">
            <SelectValue placeholder="Filter by Species" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all">All Species</SelectItem>
            {(Object.keys(SPECIES_INFO) as AgentSpecies[]).map((key) => (
              <SelectItem key={key} value={key}>
                {SPECIES_INFO[key].name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(val) => setSortBy(val ?? "fitness")}>
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

      {/* Grid */}
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {listedAgents.map((agent) => (
          <AgentCard
            key={agent.id}
            agent={agent}
            onSelect={setSelectedAgent}
          />
        ))}
      </div>

      {listedAgents.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Search size={40} className="opacity-30" />
          <p className="mt-4 text-sm">No agents match your filters.</p>
        </div>
      )}

      {/* Detail modal */}
      <AgentDetailModal
        agent={selectedAgent}
        open={!!selectedAgent}
        onOpenChange={(open) => !open && setSelectedAgent(null)}
      />
    </>
  );
}
