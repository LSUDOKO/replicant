"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { SPECIES_INFO } from "@/lib/constants";
import type { AgentStatus, AgentSpecies } from "@/types";

interface AgentNodeData {
  name: string;
  species: AgentSpecies;
  generation: number;
  status: AgentStatus;
  fitnessScore: number;
  [key: string]: unknown;
}

const statusBorderColor: Record<AgentStatus, string> = {
  active: "border-violet-500",
  archived: "border-white/20",
  slashed: "border-white/40",
  evolving: "border-violet-400",
};

const statusGlow: Record<AgentStatus, string> = {
  active: "shadow-[0_0_20px_rgba(139,92,246,0.4)]",
  archived: "",
  slashed: "shadow-[0_0_20px_rgba(255,255,255,0.2)]",
  evolving: "shadow-[0_0_20px_rgba(167,139,250,0.5)] animate-pulse",
};

function AgentNodeComponent({ data, selected }: NodeProps) {
  const nodeData = data as unknown as AgentNodeData;
  const speciesInfo = SPECIES_INFO[nodeData.species];
  
  return (
    <div
      className={`rounded-xl border-2 ${statusBorderColor[nodeData.status]} ${statusGlow[nodeData.status]} bg-black px-4 py-3 min-w-[220px] cursor-pointer transition-all hover:scale-105 ${selected ? 'ring-2 ring-violet-500 ring-offset-2 ring-offset-black' : ''}`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-violet-500 !border-0 !w-3 !h-3"
      />

      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-black border border-white/10 text-violet-500 font-bold text-sm">
          {speciesInfo?.name.slice(0, 2).toUpperCase() ?? "AG"}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold truncate text-white">{nodeData.name}</p>
          <p className="text-[10px] text-white/60 font-mono">
            Gen-{nodeData.generation} • {speciesInfo?.domain ?? "Unknown"}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2">
        <span
          className={`inline-flex items-center gap-1.5 text-[10px] font-medium ${
            nodeData.status === "active"
              ? "text-violet-400"
              : nodeData.status === "slashed"
                ? "text-white"
                : nodeData.status === "evolving"
                  ? "text-violet-300"
                  : "text-white/60"
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              nodeData.status === "active"
                ? "bg-violet-500"
                : nodeData.status === "slashed"
                  ? "bg-white"
                  : nodeData.status === "evolving"
                    ? "bg-violet-400 animate-pulse"
                    : "bg-white/40"
            }`}
          />
          {nodeData.status.charAt(0).toUpperCase() + nodeData.status.slice(1)}
        </span>
        <span className="text-[11px] font-mono text-white/80 font-semibold">
          {nodeData.fitnessScore}%
        </span>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-violet-500 !border-0 !w-3 !h-3"
      />
    </div>
  );
}

export const AgentNode = memo(AgentNodeComponent);
