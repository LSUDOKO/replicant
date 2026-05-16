"use client";

import { SpeciesIcon } from "@/components/shared/SpeciesIcon";
import { SPECIES_INFO } from "@/lib/constants";
import { SPECIES_IMAGES } from "@/lib/species/engine";
import { Shield, Zap, TrendingUp, Lock } from "lucide-react";
import type { Agent } from "@/types";

interface AgentCardProps {
  agent: Agent;
  onSelect: (agent: Agent) => void;
}

export function AgentCard({ agent, onSelect }: AgentCardProps) {
  const species = SPECIES_INFO[agent.species];
  const speciesImage = SPECIES_IMAGES[agent.species];

  return (
    <div
      className="group relative rounded-xl border border-white/10 bg-black hover:border-[#8b5cf6]/50 hover:shadow-[0_0_20px_rgba(139,92,246,0.15)] transition-all duration-300 cursor-pointer overflow-hidden"
      onClick={() => onSelect(agent)}
    >
      {/* Species Image Header */}
      <div className="relative h-40 w-full overflow-hidden bg-black">
        <img
          src={speciesImage}
          alt={species.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          style={{ objectPosition: 'center center' }}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black" />
        
        {/* Badges */}
        <div className="absolute top-3 right-3 flex flex-col items-end gap-2">
          <span className="text-[10px] font-bold rounded-full border border-[#8b5cf6]/50 bg-black/60 backdrop-blur-sm px-2.5 py-1 text-[#8b5cf6]">
            GEN-{agent.generation}
          </span>
          {agent.fitnessScore >= 85 && (
            <span className="text-[9px] font-medium rounded-full border border-[#8b5cf6]/50 bg-black/60 backdrop-blur-sm px-2 py-0.5 text-[#8b5cf6]">
              TOP 1%
            </span>
          )}
        </div>

        {/* Agent Info Overlay */}
        <div className="absolute bottom-3 left-3 right-3">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-white drop-shadow-lg truncate">
                {agent.name}
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] text-white/70 truncate">{species.domain}</span>
                <span className="text-[8px] text-white/50">•</span>
                <span className="text-[10px] font-mono text-white/70">
                  #{agent.id.replace("agent-", "")}
                </span>
              </div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-black/40 backdrop-blur-sm shrink-0 ml-2">
              <SpeciesIcon species={agent.species} size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="relative p-4 space-y-3">
        {/* Fitness Bar */}
        <div className="flex items-center justify-between bg-black border border-white/10 rounded-lg px-3 py-2">
          <div className="flex items-center gap-2">
            <TrendingUp size={12} className="text-[#8b5cf6]" />
            <span className="text-xs font-medium text-white">Fitness</span>
          </div>
          <span className="text-sm font-bold text-[#8b5cf6]">{agent.fitnessScore}%</span>
          <span className={`text-[9px] px-2 py-0.5 rounded-full ${
            agent.status === "active" 
              ? "text-[#8b5cf6] bg-[#8b5cf6]/10 border border-[#8b5cf6]/30" 
              : "text-white/60 bg-white/5 border border-white/20"
          }`}>
            {agent.status.toUpperCase()}
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="rounded-lg border border-white/10 bg-black p-2">
            <Zap size={12} className="mx-auto text-white/40" />
            <p className="mt-0.5 text-xs font-bold font-mono text-white">
              {agent.evolutionCount}
            </p>
            <p className="text-[8px] text-white/40 uppercase tracking-wider">Evolutions</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-black p-2">
            <Shield size={12} className="mx-auto text-white/40" />
            <p className="mt-0.5 text-xs font-bold font-mono text-white">
              {agent.alignmentScore}%
            </p>
            <p className="text-[8px] text-white/40 uppercase tracking-wider">Alignment</p>
          </div>
        </div>

        {/* Price & Trade Button */}
        {agent.price ? (
          <div className="space-y-2 pt-2 border-t border-white/10">
            {/* TEE Badges */}
            <div className="flex items-center gap-3 text-[10px]">
              <div className="flex items-center gap-1">
                <Shield size={10} className="text-[#8b5cf6]" />
                <span className="text-[#8b5cf6]">TEE Verified</span>
              </div>
              <div className="flex items-center gap-1">
                <Lock size={10} className="text-white/60" />
                <span className="text-white/60">Sealed</span>
              </div>
            </div>

            {/* Price & Button */}
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-[8px] text-white/40 uppercase tracking-wider mb-1">
                  Purchase Price
                </p>
                <p className="text-xl font-bold text-white">
                  {agent.price.toFixed(2)}
                  <span className="text-xs font-normal text-white/60 ml-1">0G</span>
                </p>
              </div>
              <button
                onClick={(e) => { 
                  e.stopPropagation(); 
                  onSelect(agent); 
                }}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-[#8b5cf6] text-white hover:bg-[#8b5cf6]/90 transition-colors"
              >
                Trade
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-3 border-t border-white/10">
            <span className="text-[10px] text-white/30">Not listed</span>
          </div>
        )}
      </div>
    </div>
  );
}
