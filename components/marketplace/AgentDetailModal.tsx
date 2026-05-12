"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SpeciesIcon } from "@/components/shared/SpeciesIcon";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ExplorerLink } from "@/components/shared/ExplorerLink";
import { SPECIES_INFO } from "@/lib/constants";
import type { Agent } from "@/types";
import {
  Dna,
  Target,
  Shield,
  Lock,
  Brain,
  Link2,
} from "lucide-react";

interface AgentDetailModalProps {
  agent: Agent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AgentDetailModal({
  agent,
  open,
  onOpenChange,
}: AgentDetailModalProps) {
  if (!agent) return null;
  const species = SPECIES_INFO[agent.species];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg border-border bg-card sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface border border-border-bright">
              <SpeciesIcon species={agent.species} size={24} />
            </div>
            <div>
              <DialogTitle className="text-lg">{agent.name}</DialogTitle>
              <DialogDescription className="flex items-center gap-2 mt-0.5">
                <Badge
                  variant="outline"
                  className="text-[10px] border-border-bright text-muted-foreground"
                >
                  {species.domain}
                </Badge>
                <StatusBadge status={agent.status} />
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="stats" className="mt-2">
          <TabsList className="bg-surface border border-border">
            <TabsTrigger value="stats">Stats</TabsTrigger>
            <TabsTrigger value="lineage">Lineage</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>

          <TabsContent value="stats" className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                {
                  icon: Dna,
                  label: "Generation",
                  value: `Gen-${agent.generation}`,
                  color: "text-foreground",
                },
                {
                  icon: Target,
                  label: "Fitness",
                  value: `${agent.fitnessScore}%`,
                  color: "text-primary",
                },
                {
                  icon: Shield,
                  label: "Alignment",
                  value: `${agent.alignmentScore}%`,
                  color: "text-success",
                },
                {
                  icon: Brain,
                  label: "Evolutions",
                  value: String(agent.evolutionCount),
                  color: "text-violet",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-lg border border-border bg-surface/50 p-3 text-center"
                >
                  <stat.icon size={16} className="mx-auto text-muted-foreground" />
                  <p className={`mt-1.5 text-lg font-bold font-mono ${stat.color}`}>
                    {stat.value}
                  </p>
                  <p className="label-uppercase text-muted-foreground mt-0.5">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            {agent.price && (
              <>
                <Separator className="bg-border" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="label-uppercase text-muted-foreground">Price</p>
                    <p className="text-2xl font-bold">{agent.price} ETH</p>
                  </div>
                  <Button
                    size="lg"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 glow-cyan"
                  >
                    Buy Now
                  </Button>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="lineage" className="mt-4 space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 rounded-lg border border-border bg-surface/50 p-3">
                <Lock size={16} className="text-primary" />
                <div>
                  <p className="text-sm font-medium">Sealed Handover</p>
                  <p className="text-xs text-muted-foreground">
                    Strategy remains encrypted in TEE during ownership transfer
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-border bg-surface/50 p-3">
                <Brain size={16} className="text-success" />
                <div>
                  <p className="text-sm font-medium">Memory Preserved</p>
                  <p className="text-xs text-muted-foreground">
                    All learned patterns transfer via 0G Storage
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-border bg-surface/50 p-3">
                <Link2 size={16} className="text-violet" />
                <div>
                  <p className="text-sm font-medium">Lineage Proven</p>
                  <p className="text-xs text-muted-foreground">
                    On-chain family tree shows every ancestor
                  </p>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Parent: {agent.parentId || "Genesis (no parent)"}
            </p>
          </TabsContent>

          <TabsContent value="details" className="mt-4 space-y-3">
            {[
              { label: "Agent ID", value: agent.id },
              { label: "Creator", value: agent.creator },
              { label: "Owner", value: agent.owner },
              { label: "Created", value: new Date(agent.createdAt).toLocaleDateString() },
              { label: "Stake", value: `${agent.stake} RPLT` },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-lg border border-border bg-surface/30 px-3 py-2"
              >
                <span className="text-xs text-muted-foreground">{item.label}</span>
                <span className="text-xs font-mono">{item.value}</span>
              </div>
            ))}
            <ExplorerLink hash={agent.txHash} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
