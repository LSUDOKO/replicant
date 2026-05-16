"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ExplorerLink } from "@/components/shared/ExplorerLink";
import { SPECIES_INFO } from "@/lib/constants";
import { X, User, Calendar, Hash, TrendingUp, GitBranch } from "lucide-react";
import type { AgentStatus, AgentSpecies, Agent } from "@/types";

interface NodeDetailPanelProps {
  node: {
    id: string;
    name: string;
    species: AgentSpecies;
    generation: number;
    status: AgentStatus;
    fitnessScore: number;
    parentId: string | null;
    owner: string;
    creator: string;
    createdAt: string;
    txHash: string;
  } | null;
  onClose: () => void;
  agents: Agent[];
}

export function NodeDetailPanel({ node, onClose, agents }: NodeDetailPanelProps) {
  if (!node) return null;

  const species = SPECIES_INFO[node.species];
  const parent = node.parentId ? agents.find(a => a.id === node.parentId) : null;
  const children = agents.filter(a => a.parentId === node.id);

  return (
    <Card className="absolute right-4 top-4 z-30 w-96 border-white/10 bg-black/95 backdrop-blur-xl">
      <CardHeader className="pb-3 border-b border-white/10">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-white">Agent Details</CardTitle>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-white/60 hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Close panel"
          >
            <X size={16} />
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {/* Agent Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-black border border-white/10 text-violet-500 font-bold text-base">
            {species.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-white">{node.name}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant="outline"
                className="text-[10px] border-white/20 text-white/80"
              >
                {species.domain}
              </Badge>
              <Badge
                variant="outline"
                className={`text-[10px] ${
                  node.status === 'active' ? 'border-violet-500/30 bg-violet-500/10 text-violet-400' :
                  node.status === 'evolving' ? 'border-violet-400/30 bg-violet-400/10 text-violet-300' :
                  'border-white/20 bg-white/5 text-white/60'
                }`}
              >
                {node.status.charAt(0).toUpperCase() + node.status.slice(1)}
              </Badge>
            </div>
          </div>
        </div>

        <Separator className="bg-white/10" />

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-white/10 bg-black p-3 text-center">
            <p className="text-xl font-bold font-mono text-white">{node.generation}</p>
            <p className="text-[10px] uppercase tracking-wider text-white/60 mt-1">
              Generation
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-black p-3 text-center">
            <p className="text-xl font-bold font-mono text-violet-400">
              {node.fitnessScore}%
            </p>
            <p className="text-[10px] uppercase tracking-wider text-white/60 mt-1">
              Fitness
            </p>
          </div>
        </div>

        {/* Agent ID */}
        <div className="rounded-lg border border-white/10 bg-black p-3">
          <div className="flex items-center gap-2 mb-1.5">
            <Hash size={12} className="text-white/60" />
            <p className="text-[10px] uppercase tracking-wider text-white/60">
              Agent ID
            </p>
          </div>
          <p className="font-mono text-xs text-white break-all">{node.id}</p>
        </div>

        {/* Owner & Creator */}
        <div className="space-y-2">
          <div className="rounded-lg border border-white/10 bg-black p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <User size={12} className="text-white/60" />
              <p className="text-[10px] uppercase tracking-wider text-white/60">
                Owner
              </p>
            </div>
            <p className="font-mono text-xs text-white break-all">
              {node.owner.slice(0, 10)}...{node.owner.slice(-8)}
            </p>
          </div>
          
          <div className="rounded-lg border border-white/10 bg-black p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <User size={12} className="text-white/60" />
              <p className="text-[10px] uppercase tracking-wider text-white/60">
                Creator
              </p>
            </div>
            <p className="font-mono text-xs text-white break-all">
              {node.creator.slice(0, 10)}...{node.creator.slice(-8)}
            </p>
          </div>
        </div>

        {/* Created Date */}
        <div className="rounded-lg border border-white/10 bg-black p-3">
          <div className="flex items-center gap-2 mb-1.5">
            <Calendar size={12} className="text-white/60" />
            <p className="text-[10px] uppercase tracking-wider text-white/60">
              Created
            </p>
          </div>
          <p className="text-xs text-white">
            {new Date(node.createdAt).toLocaleString()}
          </p>
        </div>

        {/* Lineage */}
        <div className="rounded-lg border border-white/10 bg-black p-3">
          <div className="flex items-center gap-2 mb-2">
            <GitBranch size={12} className="text-white/60" />
            <p className="text-[10px] uppercase tracking-wider text-white/60">
              Lineage
            </p>
          </div>
          <div className="space-y-2 text-xs">
            {parent ? (
              <div className="flex items-center justify-between">
                <span className="text-white/60">Parent:</span>
                <span className="text-violet-400 font-mono">{parent.name}</span>
              </div>
            ) : (
              <div className="text-white/60">Genesis Agent (no parent)</div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-white/60">Children:</span>
              <span className="text-violet-400 font-mono">{children.length}</span>
            </div>
          </div>
        </div>

        {/* Transaction */}
        <div className="rounded-lg border border-white/10 bg-black p-3">
          <div className="flex items-center gap-2 mb-1.5">
            <TrendingUp size={12} className="text-white/60" />
            <p className="text-[10px] uppercase tracking-wider text-white/60">
              Transaction
            </p>
          </div>
          <ExplorerLink hash={node.txHash} />
        </div>

        {/* Species Description */}
        <div className="rounded-lg border border-violet-500/20 bg-violet-500/5 p-3">
          <p className="text-xs text-white/80 italic leading-relaxed">
            &ldquo;{species.demoLine}&rdquo;
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
