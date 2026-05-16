"use client";

import { SpeciesIcon } from "@/components/shared/SpeciesIcon";
import { SPECIES_INFO } from "@/lib/constants";
import { SPECIES_IMAGES } from "@/lib/species/engine";
import { SPECIES_DEMO_OUTPUTS } from "@/lib/species/demo-outputs";
import type { AgentSpecies } from "@/types";

interface SpeciesCardProps {
  species: AgentSpecies;
  selected: boolean;
  onClick: () => void;
}

export function SpeciesCard({ species, selected, onClick }: SpeciesCardProps) {
  const info = SPECIES_INFO[species];
  const demo = SPECIES_DEMO_OUTPUTS[species];
  const imgSrc = SPECIES_IMAGES[species];

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-[3px] hover:shadow-[0_8px_30px_rgba(139,92,246,0.2)]"
      style={{
        background: selected 
          ? "linear-gradient(180deg, rgba(139,92,246,0.08), rgba(139,92,246,0.02))"
          : "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))",
        border: selected
          ? "2px solid rgba(139,92,246,0.6)"
          : "1px solid rgba(255,255,255,0.1)",
        borderRadius: "28px",
        boxShadow: selected
          ? "0 0 0 1px rgba(139,92,246,0.3), 0 8px 40px rgba(139,92,246,0.2)"
          : "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <div className="relative h-[160px] w-full overflow-hidden bg-[#050505]">
        <img
          src={imgSrc}
          alt={info.name}
          className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
          style={{
            objectPosition: 'center center'
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <span className="inline-block text-[10px] font-medium tracking-[2.5px] uppercase text-[rgba(255,255,255,0.5)] mb-2">
            {info.domain}
          </span>
          <div className="flex items-center justify-between">
            <h3 className="text-[24px] font-bold text-white drop-shadow-lg">{info.name}</h3>
            <div className="bg-black/40 backdrop-blur-sm rounded-full p-2 border border-white/10">
              <SpeciesIcon species={species} size={20} />
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 flex flex-col gap-5">
        <p className="text-[13px] leading-relaxed text-[#A1A1AA] min-h-[60px]">{info.description}</p>

        <div
          className="rounded-2xl p-4"
          style={{
            background: selected 
              ? "rgba(139,92,246,0.08)"
              : "rgba(255,255,255,0.03)",
            border: selected
              ? "1px solid rgba(139,92,246,0.2)"
              : "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <p className="text-[10px] font-medium tracking-[1.8px] uppercase text-[rgba(255,255,255,0.4)] mb-3">
            LIVE OUTPUT PREVIEW
          </p>
          <p className="text-[11px] text-[rgba(255,255,255,0.75)] leading-relaxed whitespace-pre-line font-mono">
            {demo.preview}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {demo.requirements.map((req) => (
            <span
              key={req}
              className="inline-block px-3 py-[7px] text-[10px] text-[rgba(255,255,255,0.7)] rounded-full transition-colors duration-200 hover:text-white hover:bg-[rgba(139,92,246,0.15)]"
              style={{
                background: selected 
                  ? "rgba(139,92,246,0.1)"
                  : "rgba(255,255,255,0.05)",
                border: selected
                  ? "1px solid rgba(139,92,246,0.2)"
                  : "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {req}
            </span>
          ))}
        </div>
      </div>
    </button>
  );
}
