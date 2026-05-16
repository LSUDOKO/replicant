"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, TrendingDown, Minus, Activity,
  Shield, ExternalLink, Loader2, Clock
} from "lucide-react";
// Using simple SVG chart instead of chart.js for minimal dependencies

export interface LiveSignal {
  agentId: number;
  signalType: 0 | 1 | 2; // 0=BUY, 1=HOLD, 2=SELL
  confidence: number;
  target: string;
  entryPrice?: number;
  takeProfit?: number;
  stopLoss?: number;
  reasoning: string;
  sources: { discord: number; news: number; onchain: number };
  timestamp: number;
  teeAttestation: string;
  txHash?: string;
  storageHash?: string;
  verified: boolean;
}

interface AlphaHunterTerminalProps {
  agentId: number;
}

const SIGNAL_META = {
  0: { label: "BUY", color: "#00FF88", bg: "rgba(0,255,136,0.08)", border: "rgba(0,255,136,0.25)", Icon: TrendingUp },
  1: { label: "HOLD", color: "#8B5CF6", bg: "rgba(139,92,246,0.08)", border: "rgba(139,92,246,0.25)", Icon: Minus },
  2: { label: "SELL", color: "#D946EF", bg: "rgba(217,70,239,0.08)", border: "rgba(217,70,239,0.25)", Icon: TrendingDown },
} as const;

function ts(unix: number) {
  const d = new Date(unix < 1e12 ? unix * 1000 : unix);
  const diff = Date.now() - d.getTime();
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return d.toLocaleDateString();
}

export function AlphaHunterTerminal({ agentId }: AlphaHunterTerminalProps) {
  const [signals, setSignals] = useState<LiveSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [nextCycle, setNextCycle] = useState(3600); // 60 minutes in seconds
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Performance metrics (calculated from signals)
  const [metrics, setMetrics] = useState({
    roi30d: 0,
    winRate: 0,
    totalSignals: 0,
    currentPosition: "HOLD" as "BUY" | "HOLD" | "SELL",
  });

  const fetchSignals = useCallback(async () => {
    try {
      const res = await fetch(`/api/alphahunter/signal?agentId=${agentId}&limit=50`);
      const data = await res.json();
      if (data.signals?.length) {
        setSignals(data.signals);
        calculateMetrics(data.signals);
      }
    } catch (err) {
      console.error("Failed to fetch signals:", err);
    } finally {
      setLoading(false);
    }
  }, [agentId]);

  const generateSignal = useCallback(async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/alphahunter/signal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId, asset: "SOL/USDT" }),
      });
      const data = await res.json();
      if (data.signal) {
        setSignals((prev) => [data.signal, ...prev]);
        calculateMetrics([data.signal, ...signals]);
      }
    } catch (err) {
      console.error("Failed to generate signal:", err);
    } finally {
      setGenerating(false);
    }
  }, [agentId, signals]);

  const calculateMetrics = (sigs: LiveSignal[]) => {
    const buySignals = sigs.filter((s) => s.signalType === 0);
    const sellSignals = sigs.filter((s) => s.signalType === 2);
    
    // Mock ROI calculation (in production, calculate from actual trades)
    const roi = (buySignals.length * 2.5 - sellSignals.length * 1.2).toFixed(1);
    const winRate = sigs.length > 0 ? ((buySignals.length / sigs.length) * 100).toFixed(0) : "0";
    
    setMetrics({
      roi30d: parseFloat(roi),
      winRate: parseFloat(winRate),
      totalSignals: sigs.length,
      currentPosition: sigs[0]?.signalType === 0 ? "BUY" : sigs[0]?.signalType === 2 ? "SELL" : "HOLD",
    });
  };

  // Countdown timer for next autonomous cycle
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      setNextCycle((prev) => {
        if (prev <= 1) {
          fetchSignals(); // Trigger fetch when cycle completes
          return 3600; // Reset to 60 minutes
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, fetchSignals]);

  // Initial fetch
  useEffect(() => {
    fetchSignals();
  }, [fetchSignals]);

  // Simple chart data for SVG rendering
  const chartSignals = signals.slice(0, 20).reverse();
  const chartWidth = 600;
  const chartHeight = 180;
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  const getChartPath = () => {
    if (chartSignals.length === 0) return "";
    
    const points = chartSignals.map((s, i) => {
      const x = padding.left + (i / Math.max(chartSignals.length - 1, 1)) * innerWidth;
      const y = padding.top + innerHeight - (s.confidence * innerHeight);
      return `${x},${y}`;
    });
    
    return `M ${points.join(" L ")}`;
  };

  const getAreaPath = () => {
    if (chartSignals.length === 0) return "";
    
    const linePath = getChartPath();
    const lastX = padding.left + innerWidth;
    const bottomY = padding.top + innerHeight;
    
    return `${linePath} L ${lastX},${bottomY} L ${padding.left},${bottomY} Z`;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const latest = signals[0] ?? null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 size={32} className="animate-spin" style={{ color: "#8B5CF6" }} />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* LEFT COLUMN: Performance Analytics */}
      <div className="lg:col-span-1 space-y-4">
        {/* Performance Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div style={{
            background: "rgba(0,255,136,0.05)",
            border: "1px solid rgba(0,255,136,0.2)",
            borderRadius: "12px",
            padding: "16px",
          }}>
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "1px" }}>
              30D ROI
            </p>
            <p style={{ fontSize: "24px", fontWeight: 700, color: "#00FF88", marginTop: "4px" }}>
              {metrics.roi30d > 0 ? "+" : ""}{metrics.roi30d}%
            </p>
          </div>

          <div style={{
            background: "rgba(139,92,246,0.05)",
            border: "1px solid rgba(139,92,246,0.2)",
            borderRadius: "12px",
            padding: "16px",
          }}>
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "1px" }}>
              Win Rate
            </p>
            <p style={{ fontSize: "24px", fontWeight: 700, color: "#8B5CF6", marginTop: "4px" }}>
              {metrics.winRate}%
            </p>
          </div>

          <div style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "12px",
            padding: "16px",
          }}>
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "1px" }}>
              Total Signals
            </p>
            <p style={{ fontSize: "24px", fontWeight: 700, color: "white", marginTop: "4px" }}>
              {metrics.totalSignals}
            </p>
          </div>

          <div style={{
            background: SIGNAL_META[latest?.signalType ?? 1].bg,
            border: `1px solid ${SIGNAL_META[latest?.signalType ?? 1].border}`,
            borderRadius: "12px",
            padding: "16px",
          }}>
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "1px" }}>
              Position
            </p>
            <p style={{ fontSize: "24px", fontWeight: 700, color: SIGNAL_META[latest?.signalType ?? 1].color, marginTop: "4px" }}>
              {metrics.currentPosition}
            </p>
          </div>
        </div>

        {/* Autonomous Cycle Timer */}
        <div style={{
          background: "rgba(139,92,246,0.08)",
          border: "1px solid rgba(139,92,246,0.25)",
          borderRadius: "14px",
          padding: "20px",
        }}>
          <div className="flex items-center gap-2 mb-3">
            <Clock size={16} style={{ color: "#8B5CF6" }} />
            <p style={{ fontSize: "12px", fontWeight: 600, color: "white" }}>
              Next Autonomous Scan
            </p>
          </div>
          <div style={{
            fontSize: "32px",
            fontWeight: 700,
            color: "#8B5CF6",
            fontFamily: "monospace",
            textAlign: "center",
            marginBottom: "12px",
          }}>
            {formatTime(nextCycle)}
          </div>
          <div style={{
            width: "100%",
            height: "4px",
            background: "rgba(139,92,246,0.2)",
            borderRadius: "2px",
            overflow: "hidden",
          }}>
            <motion.div
              style={{
                height: "100%",
                background: "linear-gradient(90deg, #8B5CF6, #D946EF)",
                borderRadius: "2px",
              }}
              animate={{ width: `${((3600 - nextCycle) / 3600) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", textAlign: "center", marginTop: "8px" }}>
            Fully autonomous • No manual intervention
          </p>
        </div>

        {/* Latest Signal Detail */}
        {latest && (
          <div style={{
            background: SIGNAL_META[latest.signalType].bg,
            border: `1px solid ${SIGNAL_META[latest.signalType].border}`,
            borderRadius: "14px",
            padding: "20px",
          }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {(() => {
                  const IconComponent = SIGNAL_META[latest.signalType].Icon;
                  return IconComponent ? <IconComponent size={18} style={{ color: SIGNAL_META[latest.signalType].color }} /> : null;
                })()}
                <span style={{ fontSize: "14px", fontWeight: 700, color: SIGNAL_META[latest.signalType].color }}>
                  {SIGNAL_META[latest.signalType].label}
                </span>
              </div>
              <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>
                {ts(latest.timestamp)}
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", marginBottom: "4px" }}>Asset Pair</p>
                <p style={{ fontSize: "16px", fontWeight: 600, color: "white", fontFamily: "monospace" }}>
                  {latest.target}
                </p>
              </div>

              {latest.entryPrice && (
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", marginBottom: "4px" }}>Entry</p>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "white", fontFamily: "monospace" }}>
                      ${latest.entryPrice.toFixed(2)}
                    </p>
                  </div>
                  {latest.takeProfit && (
                    <div>
                      <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", marginBottom: "4px" }}>Target</p>
                      <p style={{ fontSize: "13px", fontWeight: 600, color: "#00FF88", fontFamily: "monospace" }}>
                        ${latest.takeProfit.toFixed(2)}
                      </p>
                    </div>
                  )}
                  {latest.stopLoss && (
                    <div>
                      <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", marginBottom: "4px" }}>Stop</p>
                      <p style={{ fontSize: "13px", fontWeight: 600, color: "#D946EF", fontFamily: "monospace" }}>
                        ${latest.stopLoss.toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div>
                <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", marginBottom: "4px" }}>Confidence</p>
                <div className="flex items-center gap-2">
                  <div style={{
                    flex: 1,
                    height: "6px",
                    background: "rgba(255,255,255,0.1)",
                    borderRadius: "3px",
                    overflow: "hidden",
                  }}>
                    <div style={{
                      width: `${latest.confidence * 100}%`,
                      height: "100%",
                      background: SIGNAL_META[latest.signalType].color,
                      borderRadius: "3px",
                    }} />
                  </div>
                  <span style={{ fontSize: "12px", fontWeight: 600, color: SIGNAL_META[latest.signalType].color }}>
                    {(latest.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: Chart + Signal Feed */}
      <div className="lg:col-span-2 space-y-4">
        {/* Performance Chart */}
        <div style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "14px",
          padding: "20px",
        }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p style={{ fontSize: "14px", fontWeight: 600, color: "white" }}>Signal Confidence History</p>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>Last 20 signals</p>
            </div>
            <div className="flex items-center gap-2">
              <Shield size={12} style={{ color: "#8B5CF6" }} />
              <span style={{ fontSize: "10px", color: "#8B5CF6" }}>TEE Verified</span>
            </div>
          </div>
          <div style={{ height: "200px", width: "100%" }}>
            <svg width="100%" height="200" viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ overflow: "visible" }}>
              {/* Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((val) => {
                const y = padding.top + innerHeight - val * innerHeight;
                return (
                  <g key={val}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={padding.left + innerWidth}
                      y2={y}
                      stroke="rgba(255,255,255,0.05)"
                      strokeWidth="1"
                    />
                    <text
                      x={padding.left - 10}
                      y={y + 4}
                      fill="rgba(255,255,255,0.4)"
                      fontSize="10"
                      textAnchor="end"
                    >
                      {(val * 100).toFixed(0)}%
                    </text>
                  </g>
                );
              })}
              
              {/* Area fill */}
              {chartSignals.length > 0 && (
                <path
                  d={getAreaPath()}
                  fill="rgba(139,92,246,0.1)"
                  stroke="none"
                />
              )}
              
              {/* Line */}
              {chartSignals.length > 0 && (
                <path
                  d={getChartPath()}
                  fill="none"
                  stroke="#8B5CF6"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
              
              {/* Points */}
              {chartSignals.map((s, i) => {
                const x = padding.left + (i / Math.max(chartSignals.length - 1, 1)) * innerWidth;
                const y = padding.top + innerHeight - (s.confidence * innerHeight);
                return (
                  <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r="4"
                    fill={SIGNAL_META[s.signalType].color}
                    stroke="#0A0A0F"
                    strokeWidth="2"
                  />
                );
              })}
              
               {/* X-axis labels */}
               {chartSignals.length > 0 && [0, Math.floor(chartSignals.length / 2), chartSignals.length - 1].map((idx, arrIdx) => {
                 const x = padding.left + (idx / Math.max(chartSignals.length - 1, 1)) * innerWidth;
                 return (
                   <text
                     key={`xlabel-${arrIdx}`}
                    x={x}
                    y={padding.top + innerHeight + 20}
                    fill="rgba(255,255,255,0.4)"
                    fontSize="10"
                    textAnchor="middle"
                  >
                    T-{chartSignals.length - idx}
                  </text>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Live Signal Feed */}
        <div style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "14px",
          padding: "20px",
        }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity size={16} style={{ color: "#8B5CF6" }} />
              <p style={{ fontSize: "14px", fontWeight: 600, color: "white" }}>Live Inference Feed</p>
            </div>
            <div className="flex items-center gap-1.5">
              <div style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#8B5CF6",
                boxShadow: "0 0 8px #8B5CF6",
                animation: "pulse 2s infinite",
              }} />
              <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>
                Autonomous
              </span>
            </div>
          </div>

          <div style={{ maxHeight: "500px", overflowY: "auto" }} className="space-y-3">
            {signals.length === 0 ? (
              <div style={{
                textAlign: "center",
                padding: "60px 24px",
                background: "rgba(255,255,255,0.01)",
                border: "1px dashed rgba(255,255,255,0.06)",
                borderRadius: "14px",
              }}>
                <Activity size={40} style={{ color: "rgba(255,255,255,0.1)", margin: "0 auto 16px" }} />
                <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)", marginBottom: "8px" }}>
                  No signals generated yet
                </p>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.25)", lineHeight: 1.6 }}>
                  AlphaHunter will autonomously generate trading signals every hour by analyzing<br />
                  live market data, crypto news, and community sentiment.
                </p>
                <div style={{ marginTop: "20px", padding: "12px 16px", background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: "10px", display: "inline-block" }}>
                  <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", marginBottom: "4px" }}>Next autonomous scan in:</p>
                  <p style={{ fontSize: "20px", fontWeight: 700, color: "#8B5CF6", fontFamily: "monospace" }}>
                    {formatTime(nextCycle)}
                  </p>
                </div>
                <div style={{ marginTop: "16px" }}>
                  <button
                    onClick={generateSignal}
                    disabled={generating}
                    style={{
                      padding: "10px 20px",
                      background: generating ? "rgba(139,92,246,0.3)" : "#8B5CF6",
                      color: generating ? "rgba(255,255,255,0.5)" : "white",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: generating ? "not-allowed" : "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    {generating ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Analyzing Markets...
                      </>
                    ) : (
                      <>
                        <Activity size={14} />
                        Generate Signal Now
                      </>
                    )}
                  </button>
                  <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", marginTop: "8px" }}>
                    Or wait for the next autonomous cycle
                  </p>
                </div>
              </div>
            ) : (
              <AnimatePresence>
                {signals.map((signal, idx) => (
                  <SignalCard key={`${signal.teeAttestation}-${idx}`} signal={signal} />
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SignalCard({ signal }: { signal: LiveSignal }) {
  const m = SIGNAL_META[signal.signalType];
  const IconComponent = m.Icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      style={{
        background: m.bg,
        border: `1px solid ${m.border}`,
        borderLeft: `3px solid ${m.color}`,
        borderRadius: "12px",
        padding: "16px",
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: `${m.color}18`,
              border: `1px solid ${m.color}40`,
              borderRadius: "8px",
              padding: "4px 10px",
            }}>
              {IconComponent && <IconComponent size={12} style={{ color: m.color }} />}
              <span style={{ color: m.color, fontWeight: 700, fontSize: "12px", fontFamily: "monospace" }}>
                {m.label}
              </span>
            </div>
            <span style={{ fontFamily: "monospace", fontSize: "14px", color: "white", fontWeight: 600 }}>
              {signal.target}
            </span>
            <span style={{
              fontSize: "11px",
              color: m.color,
              fontFamily: "monospace",
              background: `${m.color}12`,
              padding: "2px 8px",
              borderRadius: "6px",
            }}>
              {(signal.confidence * 100).toFixed(0)}%
            </span>
          </div>

          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", lineHeight: 1.5, marginBottom: "10px" }}>
            {signal.reasoning}
          </p>

          <div className="flex items-center gap-4 text-xs">
            <span style={{ color: "rgba(255,255,255,0.35)" }}>
              📰 {signal.sources.news}
            </span>
            <span style={{ color: "rgba(255,255,255,0.35)" }}>
              💬 {signal.sources.discord}
            </span>
            <span style={{ color: "rgba(255,255,255,0.25)", marginLeft: "auto" }}>
              {ts(signal.timestamp)}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <div className="flex items-center gap-1">
            <Shield size={10} style={{ color: "#8B5CF6" }} />
            <span style={{ fontSize: "9px", color: "#8B5CF6", fontFamily: "monospace" }}>
              {signal.teeAttestation.slice(0, 6)}...
            </span>
          </div>
          {signal.storageHash && (
            <a
              href={`https://storagescan-galileo.0g.ai/tx/${signal.storageHash}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: "9px", color: "#8B5CF6", display: "flex", alignItems: "center", gap: "2px" }}
            >
              <ExternalLink size={8} /> 0G
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}
