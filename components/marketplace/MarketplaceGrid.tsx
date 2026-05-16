"use client";

import { useState, useMemo } from "react";
import { Search, SlidersHorizontal, RotateCcw, Zap } from "lucide-react";
import { AgentCard } from "./AgentCard";
import { AgentDetailModal } from "./AgentDetailModal";
import { SPECIES_INFO } from "@/lib/constants";
import { useDashboardData } from "@/lib/queries/use-dashboard-data";
import { useListings } from "@/lib/queries/marketplace";
import { publicEnv } from "@/lib/env";
import type { Agent, AgentSpecies } from "@/types";

const CONTRACT_CONFIGURED = !!publicEnv.contracts.marketplace;

const SPECIES_ACCENTS: Record<string, string> = {
  "alpha-hunter": "#f59e0b",
  "code-weaver": "#3b82f6",
  "game-master": "#a855f7",
  "docu-mind": "#8B5CF6",
  "oracle-keeper": "#06b6d4",
  "social-synth": "#ec4899",
};

type SpeciesFilter = AgentSpecies | "all";
const speciesFilters: SpeciesFilter[] = ["all", ...Object.keys(SPECIES_INFO) as AgentSpecies[]];

export function MarketplaceGrid() {
  const [search, setSearch] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState<SpeciesFilter>("all");
  const [genMin, setGenMin] = useState(0);
  const [genMax, setGenMax] = useState(10);
  const [fitnessMin, setFitnessMin] = useState(0);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [sortBy, setSortBy] = useState<string>("fitness");
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const { agents, isLoading: agentsLoading, isMockData } = useDashboardData();

  const tokenIds = useMemo(
    () => agents.flatMap((a) => {
      const num = a.id.replace(/^agent-/, "");
      return /^\d+$/.test(num) ? [BigInt(num)] : [];
    }),
    [agents]
  );
  const { listings, isLoading: listingsLoading } = useListings(CONTRACT_CONFIGURED ? tokenIds : []);

  const priceMap = useMemo(() => {
    const map = new Map<string, bigint>();
    for (const l of listings) map.set(l.tokenId.toString(), l.price);
    return map;
  }, [listings]);

  const listedAgents = useMemo(() => {
    // Only show agents with active listings
    let pool = agents
      .filter((a) => {
        const tokenId = a.id.replace(/^agent-/, "");
        if (!/^\d+$/.test(tokenId)) return false;
        return priceMap.has(tokenId);
      })
      .map((a) => {
        const tokenId = a.id.replace(/^agent-/, "");
        const price = priceMap.get(tokenId);
        return { ...a, price: price ? Number(price) / 1e18 : 0 };
      });

    // Apply filters
    if (search) {
      const q = search.toLowerCase();
      pool = pool.filter((a) => 
        a.name.toLowerCase().includes(q) || 
        SPECIES_INFO[a.species].name.toLowerCase().includes(q) || 
        a.id.toLowerCase().includes(q)
      );
    }
    if (speciesFilter !== "all") {
      pool = pool.filter((a) => a.species === speciesFilter);
    }
    pool = pool.filter((a) => a.generation >= genMin && a.generation <= genMax);
    pool = pool.filter((a) => a.fitnessScore >= fitnessMin);
    if (priceMin) {
      pool = pool.filter((a) => (a.price ?? 0) >= parseFloat(priceMin));
    }
    if (priceMax) {
      pool = pool.filter((a) => (a.price ?? 0) <= parseFloat(priceMax));
    }

    // Sort
    pool.sort((a, b) => {
      if (sortBy === "fitness") return b.fitnessScore - a.fitnessScore;
      if (sortBy === "price") return (b.price ?? 0) - (a.price ?? 0);
      if (sortBy === "generation") return b.generation - a.generation;
      return 0;
    });
    
    return pool;
  }, [agents, priceMap, search, speciesFilter, genMin, genMax, fitnessMin, priceMin, priceMax, sortBy]);

  const isLoading = agentsLoading || listingsLoading;
  const totalTVL = listedAgents.reduce((s, a) => s + (a.price ?? 0), 0);
  const activeListings = listedAgents.length;

  function resetFilters() {
    setSearch(""); 
    setSpeciesFilter("all"); 
    setGenMin(0); 
    setGenMax(10);
    setFitnessMin(0); 
    setPriceMin(""); 
    setPriceMax(""); 
    setSortBy("fitness");
  }

  const activeFilters = [
    speciesFilter !== "all", 
    genMin > 0 || genMax < 10, 
    fitnessMin > 0, 
    !!priceMin || !!priceMax
  ].filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="bg-black border border-white/10 rounded-xl p-6">
        <div className="grid grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-3xl font-bold text-white">{totalTVL.toFixed(2)} 0G</p>
            <p className="text-xs uppercase tracking-wider text-white/40 mt-1">Total Value Locked</p>
          </div>
          <div className="border-x border-white/10">
            <p className="text-3xl font-bold text-[#8b5cf6]">{activeListings}</p>
            <p className="text-xs uppercase tracking-wider text-white/40 mt-1">Active Listings</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-white">{Math.max(...listedAgents.map((a) => a.fitnessScore), 0)}%</p>
            <p className="text-xs uppercase tracking-wider text-white/40 mt-1">Highest Fitness</p>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            placeholder="Search by Agent ID, name, or species..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-[#8b5cf6] text-sm"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="h-10 rounded-lg border border-white/10 bg-black px-3 text-xs text-white focus:outline-none focus:border-[#8b5cf6]"
        >
          <option value="fitness">Fitness ↓</option>
          <option value="price">Price ↓</option>
          <option value="generation">Generation ↓</option>
        </select>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1.5 h-10 px-3 rounded-lg border text-xs font-medium transition-all ${
            showFilters 
              ? "border-[#8b5cf6] bg-[#8b5cf6]/10 text-[#8b5cf6]" 
              : "border-white/10 bg-black text-white/60 hover:text-white"
          }`}
        >
          <SlidersHorizontal size={12} />
          Filters
          {activeFilters > 0 && (
            <span className="ml-1 text-[10px] bg-[#8b5cf6] text-white rounded-full w-4 h-4 flex items-center justify-center">
              {activeFilters}
            </span>
          )}
        </button>
      </div>

      <div className="flex gap-6">
        {/* Filters Sidebar */}
        {showFilters && (
          <div className="w-56 shrink-0 space-y-4">
            <div className="bg-black border border-white/10 rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-wider text-white/40">Filters</p>
                <button 
                  onClick={resetFilters} 
                  className="text-[10px] text-white/40 hover:text-white flex items-center gap-1"
                >
                  <RotateCcw size={10} /> Reset
                </button>
              </div>

              {/* Species Filter */}
              <div>
                <p className="text-[10px] uppercase tracking-wider text-white/40 mb-2">Species</p>
                <div className="space-y-1">
                  {speciesFilters.map((key) => (
                    <button
                      key={key}
                      onClick={() => setSpeciesFilter(key)}
                      className={`w-full text-left px-2 py-1 rounded text-[11px] transition-all ${
                        speciesFilter === key 
                          ? "bg-[#8b5cf6]/10 text-[#8b5cf6] font-medium" 
                          : "text-white/60 hover:text-white"
                      }`}
                    >
                      {key === "all" ? "All Species" : SPECIES_INFO[key].name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generation Filter */}
              <div>
                <p className="text-[10px] uppercase tracking-wider text-white/40 mb-2">
                  Generation: {genMin} - {genMax}
                </p>
                <input 
                  type="range" 
                  min={0} 
                  max={10} 
                  value={genMin} 
                  onChange={(e) => setGenMin(parseInt(e.target.value))} 
                  className="w-full accent-[#8b5cf6]" 
                />
                <input 
                  type="range" 
                  min={0} 
                  max={10} 
                  value={genMax} 
                  onChange={(e) => setGenMax(parseInt(e.target.value))} 
                  className="w-full accent-[#8b5cf6] mt-1" 
                />
              </div>

              {/* Fitness Filter */}
              <div>
                <p className="text-[10px] uppercase tracking-wider text-white/40 mb-2">Min Fitness</p>
                {[0, 60, 70, 80, 90].map((v) => (
                  <button 
                    key={v} 
                    onClick={() => setFitnessMin(v)} 
                    className={`block w-full text-left px-2 py-1 rounded text-[11px] transition-all ${
                      fitnessMin === v 
                        ? "bg-[#8b5cf6]/10 text-[#8b5cf6]" 
                        : "text-white/60 hover:text-white"
                    }`}
                  >
                    {v === 0 ? "Any" : `> ${v}%`}
                  </button>
                ))}
              </div>

              {/* Price Filter */}
              <div>
                <p className="text-[10px] uppercase tracking-wider text-white/40 mb-2">Price (0G)</p>
                <div className="flex gap-2">
                  <input
                    placeholder="Min"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                    className="flex-1 h-8 text-xs bg-black border border-white/10 rounded px-2 text-white placeholder-white/40 focus:outline-none focus:border-[#8b5cf6]"
                  />
                  <input
                    placeholder="Max"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    className="flex-1 h-8 text-xs bg-black border border-white/10 rounded px-2 text-white placeholder-white/40 focus:outline-none focus:border-[#8b5cf6]"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Listings Grid */}
        <div className="flex-1 min-w-0">
          {!CONTRACT_CONFIGURED && (
            <div className="mb-4 rounded-lg border border-[#8b5cf6]/30 bg-[#8b5cf6]/10 p-3 text-sm text-[#8b5cf6]">
              Marketplace contract not configured. Set NEXT_PUBLIC_MARKETPLACE_CONTRACT in .env
            </div>
          )}

          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-64 rounded-xl border border-white/10 bg-black animate-pulse" />
              ))}
            </div>
          ) : listedAgents.length > 0 ? (
            <>
              <p className="text-[10px] text-white/40 mb-3">
                {listedAgents.length} {listedAgents.length === 1 ? 'agent' : 'agents'} listed
              </p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {listedAgents.map((agent) => (
                  <AgentCard key={agent.id} agent={agent} onSelect={setSelectedAgent} />
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-white/40">
              <Zap size={32} className="opacity-20 mb-3" />
              <p className="text-sm">
                {CONTRACT_CONFIGURED 
                  ? activeFilters > 0 
                    ? "No agents match your filters." 
                    : "No agents listed yet. Be the first to list!"
                  : "Configure marketplace contract to see listings."}
              </p>
              {activeFilters > 0 && (
                <button 
                  onClick={resetFilters} 
                  className="mt-2 text-xs text-[#8b5cf6] hover:underline"
                >
                  Reset filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <AgentDetailModal agent={selectedAgent} open={!!selectedAgent} onOpenChange={(o) => !o && setSelectedAgent(null)} />
    </div>
  );
}
