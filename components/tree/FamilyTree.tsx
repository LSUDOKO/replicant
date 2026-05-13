"use client";

import { useState, useCallback, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  type Node,
  type Edge,
  type NodeTypes,
  useNodesState,
  useEdgesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { AgentNode } from "./AgentNode";
import { NodeDetailPanel } from "./NodeDetailPanel";
import { useDashboardData } from "@/lib/queries/use-dashboard-data";
import { useChildren } from "@/lib/queries/agents";
import { useAccount } from "wagmi";
import { Loader2 } from "lucide-react";
import type { AgentStatus, AgentSpecies } from "@/types";

const nodeTypes: NodeTypes = { agent: AgentNode };

export function FamilyTree() {
  const { agents, isLoading } = useDashboardData();
  const { isConnected } = useAccount();
  const [selected, setSelected] = useState<{
    id: string; name: string; species: AgentSpecies;
    generation: number; status: AgentStatus; fitnessScore: number;
  } | null>(null);

  const nodes = useMemo<Node[]>(() => {
    const generationGroups: Record<number, typeof agents> = {};
    agents.forEach((a) => {
      if (!generationGroups[a.generation]) generationGroups[a.generation] = [];
      generationGroups[a.generation].push(a);
    });

    const result: Node[] = [];
    Object.entries(generationGroups).forEach(([gen, group]) => {
      const genNum = parseInt(gen);
      const totalWidth = group.length * 240;
      const startX = -totalWidth / 2;
      group.forEach((a, i) => {
        result.push({
          id: a.id,
          type: "agent",
          position: { x: startX + i * 240, y: genNum * 160 },
          data: {
            name: a.name,
            species: a.species,
            generation: a.generation,
            status: a.status,
            fitnessScore: a.fitnessScore,
          },
        });
      });
    });
    return result;
  }, [agents]);

  const edges = useMemo<Edge[]>(() => {
    const result: Edge[] = [];
    const added = new Set<string>();
    agents.forEach((a) => {
      if (a.parentId && !added.has(`${a.parentId}-${a.id}`)) {
        added.add(`${a.parentId}-${a.id}`);
        result.push({
          id: `edge-${a.parentId}-${a.id}`,
          source: a.parentId,
          target: a.id,
          animated: true,
          style: { stroke: "#2A2A3D", strokeWidth: 2 },
        });
      }
    });
    return result;
  }, [agents]);

  const [flowNodes, , onNodesChange] = useNodesState(nodes);
  const [flowEdges, , onEdgesChange] = useEdgesState(edges);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    const d = node.data as { name: string; species: AgentSpecies; generation: number; status: AgentStatus; fitnessScore: number };
    setSelected({ id: node.id, name: d.name, species: d.species, generation: d.generation, status: d.status, fitnessScore: d.fitnessScore });
  }, []);

  if (!isConnected) {
    return (
      <div className="flex h-[600px] items-center justify-center rounded-xl border border-border bg-card">
        <p className="text-sm text-muted-foreground">Connect wallet to view family tree</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-[600px] items-center justify-center rounded-xl border border-border bg-card">
        <Loader2 size={24} className="animate-spin text-muted-foreground/50" />
      </div>
    );
  }

  if (agents.length === 0) {
    return (
      <div className="flex h-[600px] items-center justify-center rounded-xl border border-border bg-card">
        <p className="text-sm text-muted-foreground">No agents minted yet</p>
      </div>
    );
  }

  return (
    <div className="relative h-[600px] w-full overflow-hidden rounded-xl border border-border bg-card">
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.3}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#1E1E2E" gap={24} size={1} />
        <Controls className="!rounded-lg !border-border !bg-surface !shadow-none [&>button]:!rounded-md [&>button]:!border-border [&>button]:!bg-surface [&>button]:!text-muted-foreground [&>button:hover]:!bg-surface-hover" />
      </ReactFlow>
      <NodeDetailPanel node={selected} onClose={() => setSelected(null)} />
    </div>
  );
}