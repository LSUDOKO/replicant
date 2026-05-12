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
import { MOCK_TREE_NODES, MOCK_TREE_EDGES } from "@/lib/mock-data";
import type { AgentStatus, AgentSpecies } from "@/types";

const nodeTypes: NodeTypes = {
  agent: AgentNode,
};

function buildNodes(): Node[] {
  // Simple layout: arrange by generation vertically, spread horizontally
  const generationGroups: Record<number, typeof MOCK_TREE_NODES> = {};
  MOCK_TREE_NODES.forEach((n) => {
    if (!generationGroups[n.generation]) generationGroups[n.generation] = [];
    generationGroups[n.generation].push(n);
  });

  const nodes: Node[] = [];
  Object.entries(generationGroups).forEach(([gen, group]) => {
    const genNum = parseInt(gen);
    const totalWidth = group.length * 240;
    const startX = -totalWidth / 2;
    group.forEach((n, i) => {
      nodes.push({
        id: n.id,
        type: "agent",
        position: { x: startX + i * 240, y: genNum * 160 },
        data: {
          name: n.name,
          species: n.species,
          generation: n.generation,
          status: n.status,
          fitnessScore: n.fitnessScore,
        },
      });
    });
  });

  return nodes;
}

function buildEdges(): Edge[] {
  return MOCK_TREE_EDGES.map((e, i) => ({
    id: `edge-${i}`,
    source: e.source,
    target: e.target,
    animated: true,
    style: { stroke: "#2A2A3D", strokeWidth: 2 },
  }));
}

interface SelectedNode {
  id: string;
  name: string;
  species: AgentSpecies;
  generation: number;
  status: AgentStatus;
  fitnessScore: number;
}

export function FamilyTree() {
  const initialNodes = useMemo(() => buildNodes(), []);
  const initialEdges = useMemo(() => buildEdges(), []);
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);
  const [selected, setSelected] = useState<SelectedNode | null>(null);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    const d = node.data as unknown as SelectedNode;
    setSelected({
      id: node.id,
      name: d.name,
      species: d.species,
      generation: d.generation,
      status: d.status,
      fitnessScore: d.fitnessScore,
    });
  }, []);

  return (
    <div className="relative h-[600px] w-full rounded-xl border border-border bg-card overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
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
        <Controls
          className="!bg-surface !border-border !rounded-lg !shadow-none [&>button]:!bg-surface [&>button]:!border-border [&>button]:!text-muted-foreground [&>button:hover]:!bg-surface-hover [&>button]:!rounded-md"
        />
      </ReactFlow>

      <NodeDetailPanel node={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
