"use client";

import { useState, useEffect } from "react";
import { Cpu, Activity, Shield, ExternalLink, TrendingUp, TrendingDown, Minus, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { ExplorerLinkWrapper } from "@/components/shared/ExplorerLink";
import { GlassCard } from "@/components/ui/glass-card";
import { SPECIES_INFO } from "@/lib/constants";
import { useDashboardData } from "@/lib/queries/use-dashboard-data";
import { useReplicantStore } from "@/lib/store";

interface LiveSignal {
  agentId: number;
  signalType: 0 | 1 | 2;
  confidence: number;
  target: string;
  entryPrice?: number;
  takeProfit?: number;
  stopLoss?: number;
  reasoning: string;
  sources: { discord: number; news: number; onchain: number };
  timestamp: number;
  teeAttestation: string;
  storageHash?: string;
  txHash?: string;
  verified: boolean;
}

const SIGNAL_META = {
  0: { text: "BUY", color: "#8b5cf6", Icon: TrendingUp },
  1: { text: "HOLD", color: "rgba(255,255,255,0.6)", Icon: Minus },
  2: { text: "SELL", color: "rgba(255,255,255,0.4)", Icon: TrendingDown },
} as const;

function formatTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return new Date(timestamp).toLocaleDateString();
}

export function ActiveAgentPanel() {
  const { agents, isLoading } = useDashboardData();
  const activeAgentId = useReplicantStore((s) => s.activeAgentId);
  const setActiveAgent = useReplicantStore((s) => s.setActiveAgent);
  
  const [latestSignal, setLatestSignal] = useState<LiveSignal | null>(null);
  const [loading, setLoading] = useState(false);

  const activeAgent = agents.find((a) => a.id === activeAgentId) ?? agents[0];
  const speciesInfo = activeAgent ? SPECIES_INFO[activeAgent.species] : null;

  // Fetch latest signal for active agent
  useEffect(() => {
    if (!activeAgent || activeAgent.species !== "alpha-hunter") return;

    const fetchLatestSignal = async () => {
      try {
        setLoading(true);
        const agentNum = parseInt(activeAgent.id.replace("agent-", ""));
        const res = await fetch(`/api/alphahunter/signal?agentId=${agentNum}&limit=1`);
        const data = await res.json();
        if (data.signals?.[0]) {
          setLatestSignal(data.signals[0]);
        }
      } catch (error) {
        console.error("Failed to fetch signal:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestSignal();
    const interval = setInterval(fetchLatestSignal, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [activeAgent]);

  if (isLoading || !activeAgent) {
    return (
      <GlassCard className="p-5">
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-6 animate-pulse rounded bg-[#202028]" />
          ))}
        </div>
      </GlassCard>
    );
  }

  const isAlphaHunter = activeAgent.species === "alpha-hunter";
  const signalMeta = latestSignal ? SIGNAL_META[latestSignal.signalType] : null;

  return (
    <GlassCard className="p-0 overflow-hidden">
      {/* Header */}
      <div className="bg-black border-b border-white/10 px-6 py-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-bold text-white tracking-tight">
                {activeAgent.name}
              </h2>
              <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium uppercase tracking-wider ${
                activeAgent.status === "active" 
                  ? "text-[#8b5cf6] bg-[#8b5cf6]/10 border border-[#8b5cf6]/30" 
                  : "text-white/60 bg-white/5 border border-white/20"
              }`}>
                {activeAgent.status}
              </span>
            </div>
            <p className="text-sm text-white/50 mb-1">{speciesInfo?.domain}</p>
            <p className="text-xs text-white/40 leading-relaxed max-w-md">
              {speciesInfo?.description}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Agent ID</p>
            <p className="text-xs font-mono text-[#8b5cf6]">{activeAgent.id.toUpperCase()}</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="bg-black px-6 py-5 border-b border-white/10">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-white mb-1">Gen-{activeAgent.generation}</p>
            <p className="text-[10px] text-white/40 uppercase tracking-wider">Generation</p>
          </div>
          <div className="text-center border-x border-white/10">
            <p className="text-2xl font-bold text-[#8b5cf6] mb-1">{activeAgent.fitnessScore}%</p>
            <p className="text-[10px] text-white/40 uppercase tracking-wider">Fitness</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white mb-1">{(activeAgent.stake || 0).toFixed(3)}</p>
            <p className="text-[10px] text-white/40 uppercase tracking-wider">Stake (0G)</p>
          </div>
        </div>
      </div>

      {/* AlphaHunter Live Signal */}
      {isAlphaHunter && (
        <div className="bg-black px-6 py-5 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-[#8b5cf6]" />
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Latest Signal</h3>
            </div>
            {loading && <Loader2 size={14} className="text-white/40 animate-spin" />}
          </div>

          <AnimatePresence mode="wait">
            {latestSignal ? (
              <motion.div
                key={latestSignal.timestamp}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {/* Signal Header */}
                <div className="flex items-center gap-3">
                  <div
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono text-sm font-bold"
                    style={{
                      color: signalMeta?.color,
                      borderColor: `${signalMeta?.color}40`,
                      backgroundColor: `${signalMeta?.color}10`,
                    }}
                  >
                    {signalMeta && <signalMeta.Icon size={14} />}
                    {signalMeta?.text}
                  </div>
                  <span className="font-mono text-lg text-white font-semibold">{latestSignal.target}</span>
                  <span
                    className="ml-auto text-xs font-mono px-2.5 py-1 rounded-md font-medium"
                    style={{
                      color: signalMeta?.color,
                      backgroundColor: `${signalMeta?.color}15`,
                    }}
                  >
                    {(latestSignal.confidence * 100).toFixed(0)}% confidence
                  </span>
                </div>

                {/* Price Levels */}
                {latestSignal.entryPrice && (
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div className="bg-white/5 rounded-lg px-3 py-2 border border-white/10">
                      <p className="text-white/40 mb-1 uppercase tracking-wider text-[10px]">Entry</p>
                      <p className="text-white font-mono">${latestSignal.entryPrice.toFixed(2)}</p>
                    </div>
                    <div className="bg-white/5 rounded-lg px-3 py-2 border border-white/10">
                      <p className="text-white/40 mb-1 uppercase tracking-wider text-[10px]">Target</p>
                      <p className="text-[#8b5cf6] font-mono">${latestSignal.takeProfit?.toFixed(2) || "—"}</p>
                    </div>
                    <div className="bg-white/5 rounded-lg px-3 py-2 border border-white/10">
                      <p className="text-white/40 mb-1 uppercase tracking-wider text-[10px]">Stop Loss</p>
                      <p className="text-white/60 font-mono">${latestSignal.stopLoss?.toFixed(2) || "—"}</p>
                    </div>
                  </div>
                )}

                {/* Reasoning */}
                <div className="bg-white/5 rounded-lg px-4 py-3 border border-white/10">
                  <p className="text-xs text-white/70 leading-relaxed">
                    {latestSignal.reasoning}
                  </p>
                </div>

                {/* Data Sources */}
                <div className="flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-4 text-white/40">
                    <span className="uppercase tracking-wider">Sources:</span>
                    <span>News: {latestSignal.sources.news}</span>
                    <span>Discord: {latestSignal.sources.discord}</span>
                    <span>On-chain: {latestSignal.sources.onchain}</span>
                  </div>
                  <span className="text-white/30">{formatTimeAgo(latestSignal.timestamp)}</span>
                </div>

                {/* Cryptographic Proofs */}
                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <Shield size={12} className="text-[#8b5cf6]" />
                    <span className="text-[10px] font-mono text-[#8b5cf6]">
                      TEE: {latestSignal.teeAttestation.slice(0, 10)}...{latestSignal.teeAttestation.slice(-6)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {latestSignal.txHash && (
                      <a
                        href={`https://chainscan-galileo.0g.ai/tx/${latestSignal.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[10px] text-[#8b5cf6] hover:text-[#8b5cf6]/80 transition-colors"
                      >
                        <ExternalLink size={10} />
                        <span>Chain</span>
                      </a>
                    )}
                    {latestSignal.storageHash && (
                      <a
                        href={`https://storagescan-galileo.0g.ai/tx/${latestSignal.storageHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[10px] text-[#8b5cf6] hover:text-[#8b5cf6]/80 transition-colors"
                      >
                        <ExternalLink size={10} />
                        <span>Storage</span>
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8"
              >
                <Activity size={24} className="text-white/20 mx-auto mb-3" />
                <p className="text-sm text-white/40 mb-1">No signals generated yet</p>
                <p className="text-xs text-white/30">
                  Autonomous scans run every hour
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Lineage */}
      <div className="bg-black px-6 py-5 border-b border-white/10">
        <h3 className="text-[10px] text-white/40 uppercase tracking-wider mb-3">Lineage</h3>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <p className="text-white/50 mb-1">Ancestors</p>
            <p className="text-white">0 (Genesis agent)</p>
          </div>
          <div>
            <p className="text-white/50 mb-1">Children</p>
            <p className="text-white">0 (No evolutions yet)</p>
          </div>
        </div>
      </div>

      {/* Cryptographic Proofs */}
      <div className="bg-black px-6 py-5 border-b border-white/10">
        <h3 className="text-[10px] text-white/40 uppercase tracking-wider mb-3">Cryptographic Proofs</h3>
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between py-2 border-b border-white/5">
            <span className="text-white/50">Storage Root</span>
            <span className="text-white/70 font-mono">Not set</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-white/5">
            <span className="text-white/50">TEE Attestation</span>
            <span className="text-white/70 font-mono">Not set</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-white/50">Alignment Verdict</span>
            <span className="text-white/70 font-mono">Not set</span>
          </div>
        </div>
      </div>

      {/* Owner & Creator */}
      <div className="bg-black px-6 py-5 border-b border-white/10">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu size={14} className="text-[#8b5cf6]" />
              <span className="text-xs text-white/50">Owner</span>
            </div>
            <ExplorerLinkWrapper value={activeAgent.owner} />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu size={14} className="text-[#8b5cf6]" />
              <span className="text-xs text-white/50">Creator</span>
            </div>
            <ExplorerLinkWrapper value={activeAgent.owner} />
          </div>
        </div>
      </div>

      {/* Agent Switcher */}
      <div className="bg-black px-6 py-4">
        <p className="text-[10px] text-white/40 uppercase tracking-wider mb-3">Switch Agent</p>
        <div className="flex flex-wrap gap-2">
          {agents.slice(0, 4).map((agent) => (
            <button
              key={agent.id}
              type="button"
              onClick={() => setActiveAgent(agent.id)}
              data-active={agent.id === activeAgent.id}
              className="rounded-lg border px-4 py-2 text-xs font-medium transition-all duration-200 data-[active=true]:border-[#8b5cf6] data-[active=true]:bg-[#8b5cf6]/10 data-[active=true]:text-[#8b5cf6] border-white/20 text-white/60 hover:border-[#8b5cf6]/50 hover:text-white"
            >
              {agent.name}
            </button>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}
