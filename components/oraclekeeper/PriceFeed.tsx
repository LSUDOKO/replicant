"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Activity, Shield, ExternalLink, AlertTriangle, BarChart3,
  Loader2, RefreshCw, CheckCircle, XCircle,
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import type { PriceAggregate, SourceStatus, OracleStats } from "@/lib/oraclekeeper";

const PAIRS = ["ETH/USDC", "BTC/USDC", "SOL/USDC", "LINK/USDC", "ARB/USDC"];

function formatPrice(val: number): string {
  if (val === 0) return "—";
  return val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 6 });
}

function getRiskColor(risk: string): string {
  switch (risk) {
    case "NONE": return "text-violet-400";
    case "LOW": return "text-blue-400";
    case "MEDIUM": return "text-yellow-400";
    case "HIGH": return "text-orange-400";
    case "CRITICAL": return "text-destructive animate-pulse";
    default: return "text-muted-foreground";
  }
}

function getRiskBg(risk: string): string {
  switch (risk) {
    case "NONE": return "border-violet-500/30 bg-violet-500/10";
    case "LOW": return "border-blue-500/30 bg-blue-500/10";
    case "MEDIUM": return "border-yellow-500/30 bg-yellow-500/10";
    case "HIGH": return "border-orange-500/30 bg-orange-500/10";
    case "CRITICAL": return "border-destructive/50 bg-destructive/20";
    default: return "border-border bg-surface/50";
  }
}

function PairCard({ aggregate }: { aggregate: PriceAggregate }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`rounded-xl border p-4 ${getRiskBg(aggregate.manipulationRisk)}`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-start justify-between text-left"
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 size={14} className="text-accent" />
            <span className="text-sm font-medium">{aggregate.pair}</span>
            {aggregate.confidence >= 80 && (
              <CheckCircle size={12} className="text-violet-400" />
            )}
            {aggregate.confidence < 50 && (
              <AlertTriangle size={12} className="text-destructive" />
            )}
          </div>
          <p className="text-2xl font-bold tracking-tight font-mono">
            ${formatPrice(aggregate.consensusDecimal)}
          </p>
          <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
            <span>TWAP: ${formatPrice(Number(aggregate.twap) / 1e18)}</span>
            <span className={getRiskColor(aggregate.manipulationRisk)}>
              {aggregate.manipulationRisk} RISK
            </span>
          </div>
        </div>
        <div className="text-right shrink-0 ml-4">
          <span className={`text-sm font-bold ${getRiskColor(aggregate.manipulationRisk)}`}>
            {aggregate.confidence}%
          </span>
          <p className="text-[10px] text-muted-foreground">confidence</p>
          <div className="flex items-center gap-1 mt-1 justify-end">
            <span className="text-violet-400 text-[11px]">{aggregate.sourcesUsed}</span>
            <span className="text-muted-foreground text-[10px]">/</span>
            <span className="text-destructive text-[11px]">{aggregate.sourcesRejected}</span>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="mt-3 space-y-3 border-t border-border/50 pt-3">
          <div className="flex h-2 rounded-full bg-muted overflow-hidden">
            {[
              { label: "Accepted", count: aggregate.sourcesUsed, color: "bg-violet-500" },
              { label: "Rejected", count: aggregate.sourcesRejected, color: "bg-destructive" },
            ].map((s) => {
              const total = aggregate.sourcesUsed + aggregate.sourcesRejected || 1;
              const pct = (s.count / total) * 100;
              if (pct === 0) return null;
              return <div key={s.label} className={s.color} style={{ width: `${pct}%` }} title={`${s.label}: ${s.count}`} />;
            })}
          </div>

          <div className="grid gap-1.5">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Source Breakdown</p>
            {aggregate.allPrices.map((ap, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg bg-surface/20 px-3 py-1.5">
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${ap.status === "accepted" ? "bg-violet-400" : "bg-destructive"}`} />
                  <span className="text-xs">{ap.source}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs">${formatPrice(ap.price)}</span>
                  {ap.reason && <span className="text-[9px] text-destructive max-w-[120px] truncate" title={ap.reason}>{ap.reason}</span>}
                </div>
              </div>
            ))}
          </div>

          {aggregate.rejectionReasons.length > 0 && (
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-wider text-destructive">Rejection Reasons</p>
              {aggregate.rejectionReasons.map((r, i) => (
                <div key={i} className="flex items-start gap-1.5 text-[11px] text-destructive">
                  <AlertTriangle size={10} className="mt-0.5 shrink-0" />
                  <span>{r}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface OracleKeeperFeedProps {
  agentId?: string;
}

export function OracleKeeperFeed({ agentId: _agentId }: OracleKeeperFeedProps) {
  const [prices, setPrices] = useState<PriceAggregate[]>([]);
  const [sources, setSources] = useState<SourceStatus[]>([]);
  const [stats, setStats] = useState<OracleStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPair, setSelectedPair] = useState("ETH/USDC");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [pricesRes, sourcesRes, statsRes] = await Promise.all([
        fetch("/api/oraclekeeper/prices?pairs=all"),
        fetch(`/api/oraclekeeper/sources?pair=${selectedPair}`),
        fetch("/api/oraclekeeper/stats"),
      ]);

      const pricesData = await pricesRes.json();
      const sourcesData = await sourcesRes.json();
      const statsData = await statsRes.json();

      if (pricesData.success) setPrices(pricesData.prices);
      if (sourcesData.success) setSources(sourcesData.sources);
      if (statsData.success) setStats(statsData.stats);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch oracle data");
    } finally {
      setLoading(false);
    }
  }, [selectedPair]);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 15000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  const selectedAggregate = prices.find((p) => p.pair === selectedPair);

  return (
    <div className="space-y-4">
      <GlassCard className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border-bright bg-surface">
              <Activity size={20} className="text-accent" />
            </div>
            <div>
              <h2 className="text-base font-medium">OracleKeeper Price Feed</h2>
              <p className="text-xs text-muted-foreground">TEE-sealed consensus from 8+ real exchange sources</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${!loading ? "bg-violet-400 animate-pulse" : "bg-muted"}`} />
            <span className="text-[10px] text-muted-foreground">
              {lastUpdated ? lastUpdated.toLocaleTimeString() : "—"}
            </span>
            <button onClick={fetchAll} className="p-1 rounded hover:bg-surface/50 transition-colors">
              <RefreshCw size={12} className={`text-muted-foreground ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-4 gap-2 mt-3">
            {[
              { label: "Publications", value: stats.totalPublications, color: "text-foreground" },
              { label: "Accuracy", value: `${stats.accuracy}%`, color: "text-violet-400" },
              { label: "Streak", value: stats.currentStreak, color: "text-accent" },
              { label: "Sources", value: stats.activeSources, color: "text-blue-400" },
            ].map((s) => (
              <div key={s.label} className="rounded-lg border border-border bg-surface/30 p-2 text-center">
                <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                <p className="text-[9px] uppercase text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      <GlassCard className="p-6">
        <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
          {PAIRS.map((pair) => {
            const agg = prices.find((p) => p.pair === pair);
            return (
              <button
                key={pair}
                onClick={() => setSelectedPair(pair)}
                className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                  selectedPair === pair
                    ? "border-accent bg-accent/10 text-foreground"
                    : "border-border bg-surface/30 text-muted-foreground hover:bg-surface/50"
                }`}
              >
                <span>{pair}</span>
                {agg && (
                  <span className={`ml-1.5 ${getRiskColor(agg.manipulationRisk)}`}>
                    {agg.manipulationRisk === "NONE" ? "●" : "◉"}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {loading && prices.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="animate-spin text-muted-foreground/50" />
          </div>
        ) : error ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4">
            <p className="text-xs text-destructive">{error}</p>
          </div>
        ) : (
          <>
            {selectedAggregate && <PairCard aggregate={selectedAggregate} />}

            <div className="grid grid-cols-2 gap-2 mt-3">
              {prices.filter((p) => p.pair !== selectedPair).map((p) => (
                <button
                  key={p.pair}
                  onClick={() => setSelectedPair(p.pair)}
                  className="text-left p-3 rounded-xl border border-border bg-surface/30 hover:bg-surface/50 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">{p.pair}</span>
                    <span className={`text-[10px] ${getRiskColor(p.manipulationRisk)}`}>
                      {p.manipulationRisk}
                    </span>
                  </div>
                  <p className="text-sm font-bold font-mono mt-1">
                    ${formatPrice(p.consensusDecimal)}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] text-muted-foreground">{p.confidence}% conf</span>
                    <span className="text-[10px] text-muted-foreground">{p.sourcesUsed}s / {p.sourcesRejected}r</span>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </GlassCard>

      {sources.length > 0 && (
        <GlassCard className="p-6">
          <p className="text-xs font-medium mb-3">Source Status for {selectedPair}</p>
          <div className="grid gap-1.5">
            {sources.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-lg border border-border bg-surface/20 px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${s.status === "active" ? "bg-violet-400" : "bg-destructive"}`} />
                  <span className="text-xs">{s.name}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded ${
                    s.type === "cex" ? "bg-blue-500/10 text-blue-400" :
                    s.type === "dex" ? "bg-purple-500/10 text-purple-400" :
                    "bg-amber-500/10 text-amber-400"
                  }`}>
                    {s.type.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                  {s.price !== undefined && <span className="font-mono">${formatPrice(s.price)}</span>}
                  <span>{s.latency}ms</span>
                  <span className="text-[10px]">W:{s.weight.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
