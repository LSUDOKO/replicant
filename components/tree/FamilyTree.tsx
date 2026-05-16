"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  type NodeTypes,
  useNodesState,
  useEdgesState,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { AgentNode } from "./AgentNode";
import { NodeDetailPanel } from "./NodeDetailPanel";
import { useDashboardData } from "@/lib/queries/use-dashboard-data";
import { useAccount } from "wagmi";
import { Loader2, Maximize2, Minimize2 } from "lucide-react";
import type { AgentStatus, AgentSpecies } from "@/types";

const nodeTypes: NodeTypes = { agent: AgentNode };

export function FamilyTree() {
  const { agents, isLoading } = useDashboardData();
  const { isConnected } = useAccount();
  const [selected, setSelected] = useState<{
    id: string; name: string; species: AgentSpecies;
    generation: number; status: AgentStatus; fitnessScore: number;
    parentId: string | null; owner: string; creator: string;
    createdAt: string; txHash: string;
  } | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Build hierarchical tree layout
  const nodes = useMemo<Node[]>(() => {
    if (agents.length === 0) return [];

    // Group by generation
    const generationGroups: Record<number, typeof agents> = {};
    agents.forEach((a) => {
      if (!generationGroups[a.generation]) generationGroups[a.generation] = [];
      generationGroups[a.generation].push(a);
    });

    const result: Node[] = [];
    const generations = Object.keys(generationGroups).map(Number).sort((a, b) => a - b);

    generations.forEach((gen) => {
      const group = generationGroups[gen];
      const horizontalSpacing = 280;
      const verticalSpacing = 200;
      const totalWidth = group.length * horizontalSpacing;
      const startX = -totalWidth / 2 + horizontalSpacing / 2;

      group.forEach((a, i) => {
        result.push({
          id: a.id,
          type: "agent",
          position: { 
            x: startX + i * horizontalSpacing, 
            y: gen * verticalSpacing 
          },
          data: {
            name: a.name,
            species: a.species,
            generation: a.generation,
            status: a.status,
            fitnessScore: a.fitnessScore,
            parentId: a.parentId,
            owner: a.owner,
            creator: a.creator,
            createdAt: a.createdAt,
            txHash: a.txHash,
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
          type: 'smoothstep',
          style: { 
            stroke: '#8b5cf6', 
            strokeWidth: 2,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#8b5cf6',
            width: 20,
            height: 20,
          },
        });
      }
    });
    
    return result;
  }, [agents]);

  const [flowNodes, setFlowNodes, onNodesChange] = useNodesState(nodes);
  const [flowEdges, setFlowEdges, onEdgesChange] = useEdgesState(edges);

  // Update nodes and edges when agents change
  useEffect(() => {
    setFlowNodes(nodes);
  }, [nodes, setFlowNodes]);

  useEffect(() => {
    setFlowEdges(edges);
  }, [edges, setFlowEdges]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    const d = node.data as { 
      name: string; species: AgentSpecies; generation: number; 
      status: AgentStatus; fitnessScore: number; parentId: string | null;
      owner: string; creator: string; createdAt: string; txHash: string;
    };
    setSelected({ 
      id: node.id, 
      name: d.name, 
      species: d.species, 
      generation: d.generation, 
      status: d.status, 
      fitnessScore: d.fitnessScore,
      parentId: d.parentId,
      owner: d.owner,
      creator: d.creator,
      createdAt: d.createdAt,
      txHash: d.txHash,
    });
  }, []);

  if (!isConnected) {
    return (
      <div className="flex h-[600px] items-center justify-center rounded-xl border border-white/10 bg-black">
        <p className="text-sm text-white/60">Connect wallet to view family tree</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-[600px] items-center justify-center rounded-xl border border-white/10 bg-black">
        <Loader2 size={24} className="animate-spin text-white/50" />
      </div>
    );
  }

  if (agents.length === 0) {
    return (
      <div className="flex h-[600px] items-center justify-center rounded-xl border border-white/10 bg-black">
        <p className="text-sm text-white/60">No agents minted yet. Mint a Genesis agent to start your lineage.</p>
      </div>
    );
  }

  return (
    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50' : 'h-[700px]'} w-full overflow-hidden rounded-xl border border-white/10 bg-black`}>
      {/* Fullscreen toggle */}
      <button
        onClick={() => setIsFullscreen(!isFullscreen)}
        className="absolute right-4 top-4 z-30 rounded-lg border border-white/10 bg-black/80 p-2 text-white/60 backdrop-blur-sm transition-colors hover:bg-white/5 hover:text-white"
        aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
      >
        {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
      </button>

      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2, maxZoom: 1 }}
        minZoom={0.2}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{
          animated: true,
          style: { stroke: '#8b5cf6', strokeWidth: 2 },
        }}
      >
        <Background 
          color="#ffffff" 
          gap={20} 
          size={1}
          style={{ opacity: 0.05 }}
        />
        <Controls 
          className="!rounded-lg !border-white/10 !bg-black/80 !backdrop-blur-sm !shadow-none [&>button]:!rounded-md [&>button]:!border-white/10 [&>button]:!bg-black [&>button]:!text-white/60 [&>button:hover]:!bg-white/5 [&>button:hover]:!text-white" 
          showInteractive={false}
        />
        <MiniMap
          className="!rounded-lg !border-white/10 !bg-black/80 !backdrop-blur-sm"
          nodeColor={(node) => {
            const status = (node.data as { status: AgentStatus }).status;
            return status === 'active' ? '#8b5cf6' : 
                   status === 'evolving' ? '#a78bfa' : 
                   status === 'slashed' ? '#ffffff' : '#ffffff40';
          }}
          maskColor="rgba(0, 0, 0, 0.6)"
        />
      </ReactFlow>
      
      <NodeDetailPanel 
        node={selected} 
        onClose={() => setSelected(null)}
        agents={agents}
      />

      {/* Stats overlay */}
      <div className="absolute bottom-4 left-4 z-20 flex gap-3">
        <div className="rounded-lg border border-white/10 bg-black/80 px-3 py-2 backdrop-blur-sm">
          <p className="text-xs text-white/60">Total Agents</p>
          <p className="text-lg font-bold text-white">{agents.length}</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-black/80 px-3 py-2 backdrop-blur-sm">
          <p className="text-xs text-white/60">Generations</p>
          <p className="text-lg font-bold text-violet-400">{Math.max(...agents.map(a => a.generation)) + 1}</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-black/80 px-3 py-2 backdrop-blur-sm">
          <p className="text-xs text-white/60">Active</p>
          <p className="text-lg font-bold text-violet-400">{agents.filter(a => a.status === 'active').length}</p>
        </div>
      </div>
    </div>
  );
}