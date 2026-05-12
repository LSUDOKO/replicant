"use client";

import {
  TrendingUp,
  ShieldCheck,
  Gamepad2,
  FileText,
  Radio,
  Share2,
} from "lucide-react";
import type { AgentSpecies } from "@/types";

const speciesIcons: Record<AgentSpecies, React.ElementType> = {
  "alpha-hunter": TrendingUp,
  "code-weaver": ShieldCheck,
  "game-master": Gamepad2,
  "docu-mind": FileText,
  "oracle-keeper": Radio,
  "social-synth": Share2,
};

const speciesColors: Record<AgentSpecies, string> = {
  "alpha-hunter": "text-chart-1",
  "code-weaver": "text-chart-2",
  "game-master": "text-chart-4",
  "docu-mind": "text-chart-3",
  "oracle-keeper": "text-cyan",
  "social-synth": "text-violet",
};

interface SpeciesIconProps {
  species: AgentSpecies;
  size?: number;
  className?: string;
}

export function SpeciesIcon({ species, size = 20, className = "" }: SpeciesIconProps) {
  const Icon = speciesIcons[species];
  const color = speciesColors[species];
  return <Icon size={size} className={`${color} ${className}`} />;
}
