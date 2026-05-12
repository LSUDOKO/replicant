"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SpeciesIcon } from "@/components/shared/SpeciesIcon";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { SPECIES_INFO } from "@/lib/constants";
import { X } from "lucide-react";
import type { AgentStatus, AgentSpecies } from "@/types";

interface NodeDetailPanelProps {
  node: {
    id: string;
    name: string;
    species: AgentSpecies;
    generation: number;
    status: AgentStatus;
    fitnessScore: number;
  } | null;
  onClose: () => void;
}

export function NodeDetailPanel({ node, onClose }: NodeDetailPanelProps) {
  if (!node) return null;

  const species = SPECIES_INFO[node.species];

  return (
    <Card className="absolute right-4 top-4 z-20 w-80 border-border bg-card/95 backdrop-blur-xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Agent Details</CardTitle>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-surface transition-colors"
            aria-label="Close panel"
          >
            <X size={16} />
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface border border-border-bright">
            <SpeciesIcon species={node.species} size={20} />
          </div>
          <div>
            <p className="font-semibold">{node.name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge
                variant="outline"
                className="text-[10px] border-border-bright text-muted-foreground"
              >
                {species.domain}
              </Badge>
              <StatusBadge status={node.status} />
            </div>
          </div>
        </div>

        <Separator className="bg-border" />

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-border bg-surface/50 p-3 text-center">
            <p className="text-lg font-bold font-mono">{node.generation}</p>
            <p className="label-uppercase text-muted-foreground mt-0.5">
              Generation
            </p>
          </div>
          <div className="rounded-lg border border-border bg-surface/50 p-3 text-center">
            <p className="text-lg font-bold font-mono text-primary">
              {node.fitnessScore}%
            </p>
            <p className="label-uppercase text-muted-foreground mt-0.5">
              Fitness
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-surface/30 p-3">
          <p className="label-uppercase text-muted-foreground mb-1.5">
            Agent ID
          </p>
          <p className="font-mono text-xs text-foreground">{node.id}</p>
        </div>

        <p className="text-xs text-muted-foreground italic leading-relaxed">
          &ldquo;{species.demoLine}&rdquo;
        </p>
      </CardContent>
    </Card>
  );
}
