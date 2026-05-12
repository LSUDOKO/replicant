"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SpeciesIcon } from "@/components/shared/SpeciesIcon";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { SPECIES_INFO } from "@/lib/constants";
import type { Agent } from "@/types";
import { Dna, Target, ShoppingCart } from "lucide-react";

interface AgentCardProps {
  agent: Agent;
  onSelect: (agent: Agent) => void;
}

export function AgentCard({ agent, onSelect }: AgentCardProps) {
  const species = SPECIES_INFO[agent.species];

  return (
    <Card
      className="group border-border bg-card hover:border-primary/30 hover:glow-cyan transition-all duration-300 cursor-pointer"
      onClick={() => onSelect(agent)}
    >
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-surface border border-border-bright group-hover:border-primary/30 transition-colors">
              <SpeciesIcon species={agent.species} size={22} />
            </div>
            <div>
              <h3 className="text-sm font-semibold">{agent.name}</h3>
              <Badge
                variant="outline"
                className="mt-0.5 text-[10px] border-border-bright text-muted-foreground"
              >
                {species.domain}
              </Badge>
            </div>
          </div>
          <StatusBadge status={agent.status} />
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-lg border border-border bg-surface/50 p-2.5 text-center">
            <Dna size={14} className="mx-auto text-muted-foreground" />
            <p className="mt-1 text-sm font-bold font-mono">
              {agent.generation}
            </p>
            <p className="text-[10px] text-muted-foreground">Gen</p>
          </div>
          <div className="rounded-lg border border-border bg-surface/50 p-2.5 text-center">
            <Target size={14} className="mx-auto text-primary" />
            <p className="mt-1 text-sm font-bold font-mono text-primary">
              {agent.fitnessScore}%
            </p>
            <p className="text-[10px] text-muted-foreground">Fitness</p>
          </div>
          <div className="rounded-lg border border-border bg-surface/50 p-2.5 text-center">
            <ShoppingCart size={14} className="mx-auto text-muted-foreground" />
            <p className="mt-1 text-sm font-bold font-mono">
              {agent.evolutionCount}
            </p>
            <p className="text-[10px] text-muted-foreground">Evos</p>
          </div>
        </div>

        {/* Price & CTA */}
        {agent.price && (
          <div className="mt-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Price</p>
              <p className="text-lg font-bold">{agent.price} ETH</p>
            </div>
            <Button
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              Buy Now
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
