"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { SpeciesIcon } from "@/components/shared/SpeciesIcon";
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
  active: "border-success/60",
  archived: "border-muted-foreground/30",
  slashed: "border-destructive/60",
  evolving: "border-cyan/60",
};

const statusGlow: Record<AgentStatus, string> = {
  active: "shadow-[0_0_12px_rgba(0,211,127,0.2)]",
  archived: "",
  slashed: "shadow-[0_0_12px_rgba(255,59,92,0.2)]",
  evolving: "shadow-[0_0_12px_rgba(0,200,200,0.3)]",
};

function AgentNodeComponent({ data }: NodeProps) {
  const nodeData = data as unknown as AgentNodeData;
  return (
    <div
      className={`rounded-xl border-2 ${statusBorderColor[nodeData.status]} ${statusGlow[nodeData.status]} bg-card px-4 py-3 min-w-[180px] cursor-pointer transition-all hover:scale-105`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-border-bright !border-0 !w-2 !h-2"
      />

      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface border border-border-bright">
          <SpeciesIcon species={nodeData.species} size={16} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold truncate">{nodeData.name}</p>
          <p className="text-[10px] text-muted-foreground font-mono">
            Gen-{nodeData.generation}
          </p>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between">
        <span
          className={`inline-flex items-center gap-1 text-[10px] font-medium ${
            nodeData.status === "active"
              ? "text-success"
              : nodeData.status === "slashed"
                ? "text-destructive"
                : nodeData.status === "evolving"
                  ? "text-cyan"
                  : "text-muted-foreground"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              nodeData.status === "active"
                ? "bg-success"
                : nodeData.status === "slashed"
                  ? "bg-destructive"
                  : nodeData.status === "evolving"
                    ? "bg-cyan animate-pulse"
                    : "bg-muted-foreground"
            }`}
          />
          {nodeData.status.charAt(0).toUpperCase() + nodeData.status.slice(1)}
        </span>
        <span className="text-[10px] font-mono text-muted-foreground">
          Fit: {nodeData.fitnessScore}%
        </span>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-border-bright !border-0 !w-2 !h-2"
      />
    </div>
  );
}

export const AgentNode = memo(AgentNodeComponent);
