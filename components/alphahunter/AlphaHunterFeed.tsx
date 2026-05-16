"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, TrendingDown, Minus, Activity,
  Shield, ExternalLink, Loader2, Zap
} from "lucide-react";

export interface LiveSignal {
  agentId: number;
  signalType: 0 | 1 | 2; // 0=BUY, 1=HOLD, 2=SELL
  confidence: number;
  target: string;
  reasoning: string;
  sources: { discord: number; news: number; onchain: number };
  timestamp: number;
  teeAttestation: string;
  txHash?: string;
  storageHash?: string;
  verified: boolean;
}

interface AlphaHunterFeedProps {
  agentId: number;
}

const SIGNAL_META = {
  0: { label: "BUY",  color: "#8B5CF6", bg: "rgba(139,92,246,0.08)",  border: "rgba(139,92,246,0.25)",  Icon: TrendingUp },
  1: { label: "HOLD", color: "rgba(255,255,255,0.6)", bg: "rgba(255,255,255,0.03)",   border: "rgba(255,255,255,0.1)",   Icon: Minus },
  2: { label: "SELL", color: "rgba(255,255,255,0.4)", bg: "rgba(0,0,0,0.3)",  border: "rgba(255,255,255,0.08)",  Icon: TrendingDown },
} as const;

function ts(unix: number) {
  const d = new Date(unix < 1e12 ? unix * 1000 : unix);
  const diff = Date.now() - d.getTime();
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return d.toLocaleDateString();
}

function SignalCard({ signal, isLatest }: { signal: LiveSignal; isLatest?: boolean }) {
  const m = SIGNAL_META[signal.signalType];
  const { Icon } = m;
  return (
    <motion.div
      initial={{ opacity: 0, y: isLatest ? -20 : 0 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      style={{
        background: isLatest ? m.bg : "rgba(255,255,255,0.02)",
        border: `1px solid ${isLatest ? m.border : "rgba(255,255,255,0.06)"}`,
        borderLeft: `3px solid ${m.color}`,
        borderRadius: "14px",
        padding: isLatest ? "20px" : "14px 16px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {isLatest && (
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: "1px",
          background: `linear-gradient(90deg, ${m.color}60, transparent)`,
        }} />
      )}

      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Signal type + target */}
          <div className="flex items-center gap-3 mb-2">
            <div style={{
              display: "flex", alignItems: "center", gap: "6px",
              background: `${m.color}18`, border: `1px solid ${m.color}40`,
              borderRadius: "8px", padding: "4px 10px",
            }}>
              <Icon size={14} style={{ color: m.color }} />
              <span style={{ color: m.color, fontWeight: 700, fontSize: "13px", fontFamily: "monospace" }}>
                {m.label}
              </span>
            </div>
            <span style={{ fontFamily: "monospace", fontSize: "15px", color: "white", fontWeight: 600 }}>
              {signal.target}
            </span>
            <span style={{
              fontSize: "11px", color: m.color, fontFamily: "monospace",
              background: `${m.color}12`, padding: "2px 8px", borderRadius: "6px",
            }}>
              {signal.confidence}%
            </span>
          </div>

          {/* Reasoning */}
          {isLatest && (
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", lineHeight: 1.6, marginBottom: "12px" }}>
              {signal.reasoning}
            </p>
          )}

          {/* Sources row */}
          <div className="flex items-center gap-4 flex-wrap">
            <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", display: "flex", alignItems: "center", gap: "4px" }}>
              News: {signal.sources.news}
            </span>
            <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", display: "flex", alignItems: "center", gap: "4px" }}>
              Discord: {signal.sources.discord}
            </span>
            <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", display: "flex", alignItems: "center", gap: "4px" }}>
              On-chain: {signal.sources.onchain}
            </span>
            <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)", marginLeft: "auto" }}>
              {ts(signal.timestamp)}
            </span>
          </div>
        </div>

        {/* Right: attestation + links */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          <div className="flex items-center gap-1.5">
            <Shield size={11} style={{ color: "#8B5CF6" }} />
            <span style={{ fontSize: "10px", color: "#8B5CF6", fontFamily: "monospace" }}>TEE</span>
          </div>
          <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", fontFamily: "monospace" }}>
            {signal.teeAttestation.slice(0, 8)}…{signal.teeAttestation.slice(-4)}
          </span>
          {signal.txHash && signal.txHash.startsWith("0x") && signal.txHash.length === 66 && (
            <a
              href={`https://chainscan.0g.ai/tx/${signal.txHash}`}
              target="_blank" rel="noopener noreferrer"
              style={{ fontSize: "10px", color: "#8B5CF6", display: "flex", alignItems: "center", gap: "3px" }}
              title="View transaction on 0G Chain"
            >
              <ExternalLink size={9} /> chain
            </a>
          )}
          {signal.storageHash && signal.storageHash.startsWith("0x") && signal.storageHash.length === 66 && signal.txHash && signal.txHash !== "uploaded" && (
            <a
              href={`https://storagescan.0g.ai`}
              target="_blank" rel="noopener noreferrer"
              style={{ fontSize: "10px", color: "#8B5CF6", display: "flex", alignItems: "center", gap: "3px" }}
              title={`Storage Root: ${signal.storageHash}`}
            >
              <ExternalLink size={9} /> storage
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function AlphaHunterFeed({ agentId }: AlphaHunterFeedProps) {
  const [signals, setSignals] = useState<LiveSignal[]>([]);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const addSignal = useCallback((sig: LiveSignal) => {
    setSignals((prev) => {
      const exists = prev.some((s) => s.teeAttestation === sig.teeAttestation && s.timestamp === sig.timestamp);
      if (exists) return prev;
      return [sig, ...prev].slice(0, 50);
    });
  }, []);

  const fetchSignals = useCallback(async () => {
    try {
      const res = await fetch(`/api/alphahunter/signal?agentId=${agentId}&limit=20`);
      const data = await res.json();
      if (data.signals?.length) setSignals(data.signals);
    } catch (err) {
      console.error("Failed to fetch signals:", err);
    } finally {
      setLoading(false);
    }
  }, [agentId]);

  const generateSignal = useCallback(async () => {
    setGenerating(true);
    setError(null);

    try {
      const res = await fetch("/api/alphahunter/signal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId }),
      });
      const data = await res.json();
      if (data.signal) addSignal(data.signal);
      else if (data.error) setError(data.error);
    } catch (err) {
      setError("Signal generation failed");
    } finally {
      setGenerating(false);
    }
  }, [agentId, addSignal]);

  // Initial fetch
  useEffect(() => {
    fetchSignals();
  }, [fetchSignals]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchSignals, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchSignals]);

  const latest = signals[0] ?? null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Header bar */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: "14px", padding: "12px 16px",
      }}>
        <div className="flex items-center gap-3">
          <div style={{
            width: "36px", height: "36px", borderRadius: "10px",
            background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Activity size={16} style={{ color: "#8B5CF6" }} />
          </div>
          <div>
            <p style={{ fontSize: "13px", fontWeight: 600, color: "white" }}>AlphaHunter Live Feed</p>
            <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)" }}>Real-time sentiment signals via LLM + Discord + News</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div style={{
              width: "7px", height: "7px", borderRadius: "50%",
              background: autoRefresh ? "#8B5CF6" : "rgba(255,255,255,0.3)",
              boxShadow: autoRefresh ? "0 0 6px #8B5CF6" : "none",
              animation: autoRefresh ? "pulse 2s infinite" : "none",
            }} />
            <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "1px" }}>
              {autoRefresh ? "Live" : "Paused"}
            </span>
          </div>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "8px", padding: "5px 10px", fontSize: "11px", color: "rgba(255,255,255,0.5)",
              cursor: "pointer", transition: "all 0.2s",
            }}
          >
            {autoRefresh ? "Pause" : "Resume"}
          </button>
          <button
            onClick={generateSignal}
            disabled={generating}
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              background: generating ? "rgba(139,92,246,0.1)" : "rgba(139,92,246,0.15)",
              border: "1px solid rgba(139,92,246,0.3)", borderRadius: "10px",
              padding: "7px 14px", fontSize: "12px", color: "#8B5CF6",
              cursor: generating ? "not-allowed" : "pointer", transition: "all 0.2s",
            }}
          >
            {generating ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} />}
            {generating ? "Analyzing…" : "Generate Signal"}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          display: "flex", alignItems: "center", gap: "8px",
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "10px", padding: "10px 14px", fontSize: "12px", color: "rgba(255,255,255,0.5)",
        }}>
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
          <Loader2 size={24} style={{ color: "rgba(255,255,255,0.3)", animation: "spin 1s linear infinite" }} />
        </div>
      )}

      {/* Latest signal (large) */}
      {!loading && latest && (
        <div>
          <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "8px" }}>
            Latest Signal
          </p>
          <AnimatePresence mode="wait">
            <SignalCard key={`${latest.teeAttestation}-${latest.timestamp}`} signal={latest} isLatest />
          </AnimatePresence>
        </div>
      )}

      {/* History */}
      {!loading && signals.length > 1 && (
        <div>
          <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "8px" }}>
            Signal History ({signals.length - 1})
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "400px", overflowY: "auto" }}>
            <AnimatePresence>
              {signals.slice(1).map((sig, i) => (
                <SignalCard key={`${sig.teeAttestation}-${sig.timestamp}-${i}`} signal={sig} />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && signals.length === 0 && (
        <div style={{
          textAlign: "center", padding: "48px 24px",
          background: "rgba(255,255,255,0.01)", border: "1px dashed rgba(255,255,255,0.06)",
          borderRadius: "14px",
        }}>
          <Activity size={32} style={{ color: "rgba(255,255,255,0.15)", margin: "0 auto 12px" }} />
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)" }}>No signals yet</p>
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)", marginTop: "4px" }}>
            Click "Generate Signal" to run the AlphaHunter pipeline
          </p>
        </div>
      )}
    </div>
  );
}
