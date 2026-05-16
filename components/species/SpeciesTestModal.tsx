"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, XCircle, ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ActionButton } from "@/components/ui/action-button";
import { GlassCard } from "@/components/ui/glass-card";
import { ExplorerLinkWrapper } from "@/components/shared/ExplorerLink";
import { SPECIES_INFO } from "@/lib/constants";
import { SPECIES_IMAGES, getSpeciesMetadata } from "@/lib/species/engine";
import type { SpeciesId } from "@/lib/species/engine";
import type { InferenceOutput } from "@/lib/species/engine";
import type { AgentSpecies } from "@/types";

interface SpeciesTestModalProps {
  species: AgentSpecies;
  config: Record<string, unknown>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function renderResult(species: AgentSpecies, output: InferenceOutput) {
  const r = output.result as any;
  const meta = getSpeciesMetadata(species as SpeciesId);

  return (
    <div className="space-y-4">
      {/* Confidence + TEE Attestation */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-surface/40 p-3">
        <div>
          <p className="text-xs text-muted-foreground">Confidence</p>
          <p className="text-2xl font-bold" style={{ color: meta.accent }}>
            {(output.confidence * 100).toFixed(0)}%
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">TEE Attestation</p>
          <ExplorerLinkWrapper value={output.teeAttestation} type="tx" className="text-xs" />
        </div>
      </div>

      {/* Species-specific output */}
      {species === "alpha-hunter" && (
        <div className="space-y-3">
          <div className="flex items-center gap-3 rounded-xl border border-border bg-surface/40 p-3">
            <span className="text-2xl">{r.signal === "BUY" ? "🟢" : r.signal === "SELL" ? "🔴" : "🟡"}</span>
            <div>
              <p className="text-sm font-semibold">{r.signal} {r.token}</p>
              <p className="text-xs text-muted-foreground">{r.reasoning}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="rounded-lg border border-border bg-surface/30 p-2 text-center">
              <p className="text-muted-foreground">Target</p>
              <p className="font-mono font-bold">${r.priceTarget ?? "—"}</p>
            </div>
            <div className="rounded-lg border border-border bg-surface/30 p-2 text-center">
              <p className="text-muted-foreground">Stop</p>
              <p className="font-mono font-bold">${r.stopLoss}</p>
            </div>
            <div className="rounded-lg border border-border bg-surface/30 p-2 text-center">
              <p className="text-muted-foreground">Risk</p>
              <p className="font-mono font-bold">{(r.riskScore * 100).toFixed(0)}%</p>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            <p className="font-medium mb-1">Source Breakdown:</p>
            {r.sourceBreakdown?.map((s: any, i: number) => (
              <div key={i} className="flex justify-between py-0.5">
                <span>{s.source}</span>
                <span className={s.score > 0 ? "text-accent-success" : "text-accent-alert"}>
                  {s.score > 0 ? "+" : ""}{(s.score * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {species === "code-weaver" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-xl border border-border bg-surface/40 p-3">
            <span className="text-xs text-muted-foreground">Overall Risk</span>
            <span className={`font-bold text-sm ${
              r.overallRisk === "CRITICAL" ? "text-accent-alert" :
              r.overallRisk === "HIGH" ? "text-orange-400" :
              r.overallRisk === "MEDIUM" ? "text-yellow-400" : "text-accent-success"
            }`}>{r.overallRisk}</span>
          </div>
          {r.vulnerabilities?.map((v: any, i: number) => (
            <div key={i} className="rounded-lg border border-border bg-surface/30 p-3 text-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono font-bold text-foreground">{v.type}</span>
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                  v.severity === "CRITICAL" ? "bg-accent-alert/20 text-accent-alert" :
                  v.severity === "HIGH" ? "bg-orange-400/20 text-orange-400" : "bg-yellow-400/20 text-yellow-400"
                }`}>{v.severity}</span>
              </div>
              <p className="text-muted-foreground">Line {v.lines}: {v.fix}</p>
            </div>
          ))}
        </div>
      )}

      {species === "game-master" && (
        <div className="space-y-3">
          <div className="flex items-center gap-3 rounded-xl border border-border bg-surface/40 p-3">
            <span className="text-2xl">♟️</span>
            <div>
              <p className="text-sm font-semibold">Move: {r.move?.type}</p>
              <p className="text-xs text-muted-foreground">Strategy: {r.strategy} | Win rate: {(r.estimatedWinRate * 100).toFixed(0)}%</p>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-surface/30 p-3 text-xs">
            <p className="font-medium mb-1">Reasoning</p>
            <p className="text-muted-foreground">{r.reasoning}</p>
          </div>
        </div>
      )}

      {species === "docu-mind" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-xl border border-border bg-surface/40 p-3">
            <div>
              <p className="text-xs text-muted-foreground">{r.clauseCount} clauses extracted</p>
              <p className="text-xs text-muted-foreground">Readability: {r.readabilityScore}/100</p>
            </div>
            <span className={`font-bold text-sm ${
              r.overallRisk === "HIGH" ? "text-accent-alert" : r.overallRisk === "MEDIUM" ? "text-yellow-400" : "text-accent-success"
            }`}>{r.overallRisk}</span>
          </div>
          {r.flaggedClauses?.map((c: any, i: number) => (
            <div key={i} className="rounded-lg border border-border bg-surface/30 p-3 text-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-foreground">{c.type}</span>
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                  c.risk === "CRITICAL" ? "bg-accent-alert/20 text-accent-alert" :
                  c.risk === "HIGH" ? "bg-orange-400/20 text-orange-400" : "bg-yellow-400/20 text-yellow-400"
                }`}>{c.risk}</span>
              </div>
              <p className="text-muted-foreground">{c.suggestion}</p>
            </div>
          ))}
        </div>
      )}

      {species === "oracle-keeper" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-xl border border-border bg-surface/40 p-3">
            <div>
              <p className="text-2xl font-bold font-mono">${r.consensusPrice?.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">{r.asset} | {r.sources} sources</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Outliers</p>
              <p className="font-bold">{r.outliersRejected} rejected</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-lg border border-border bg-surface/30 p-2">
              <p className="text-muted-foreground">Spread</p>
              <p className="font-mono font-bold">{r.priceSpread}%</p>
            </div>
            <div className="rounded-lg border border-border bg-surface/30 p-2">
              <p className="text-muted-foreground">Manipulation</p>
              <p className={`font-bold ${r.manipulationRisk === "HIGH" ? "text-accent-alert" : "text-accent-success"}`}>{r.manipulationRisk}</p>
            </div>
          </div>
        </div>
      )}

      {species === "social-synth" && (
        <div className="space-y-3">
          <div className="flex items-center gap-3 rounded-xl border border-border bg-surface/40 p-3">
            <span className="text-2xl">{r.format === "meme" ? "😂" : r.format === "thread" ? "🧵" : "📝"}</span>
            <div>
              <p className="text-sm font-semibold capitalize">{r.format} &bull; {r.tone} tone</p>
              <p className="text-xs text-muted-foreground">Predicted engagement: {(r.predictedEngagement * 100).toFixed(0)}%</p>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-surface/30 p-3 text-xs">
            <p className="text-muted-foreground italic">"{r.content?.text?.slice(0, 120)}..."</p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="rounded-lg border border-border bg-surface/30 p-2 text-center">
              <p className="text-muted-foreground">❤️ Likes</p>
              <p className="font-mono font-bold">{r.engagementBreakdown?.likes?.toLocaleString()}</p>
            </div>
            <div className="rounded-lg border border-border bg-surface/30 p-2 text-center">
              <p className="text-muted-foreground">🔁 Retweets</p>
              <p className="font-mono font-bold">{r.engagementBreakdown?.retweets?.toLocaleString()}</p>
            </div>
            <div className="rounded-lg border border-border bg-surface/30 p-2 text-center">
              <p className="text-muted-foreground">👁️ Reach</p>
              <p className="font-mono font-bold">{r.engagementBreakdown?.predictedReach?.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Metrics footer */}
      <div className="flex items-center justify-between rounded-lg bg-surface/20 p-2 text-[10px] text-muted-foreground">
        <span>⚡ {output.metrics.inferenceTimeMs}ms inference time</span>
        <span>💾 {output.metrics.memoryUsedKb}KB memory</span>
        <span>🤖 {output.metrics.modelVersion}</span>
      </div>
    </div>
  );
}

export function SpeciesTestModal({ species, config, open, onOpenChange }: SpeciesTestModalProps) {
  const info = SPECIES_INFO[species];
  const [result, setResult] = useState<InferenceOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleTest() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`/api/inference/${species}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Test failed");
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Test failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { setResult(null); setError(null); } onOpenChange(o); }}>
      <DialogContent className="max-w-lg border-border bg-card sm:max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>🧪</span> Test Run: {info.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <ActionButton
            type="button"
            onClick={handleTest}
            disabled={loading}
            className="w-full"
            variant={result ? "outline" : "default"}
          >
            {loading ? <><Loader2 size={14} className="mr-2 animate-spin" /> Running inference...</> : result ? "🔄 Run Again" : "▶ Run Test Inference"}
          </ActionButton>

          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <Loader2 size={32} className="animate-spin text-accent-evolution mx-auto" />
                <p className="mt-3 text-sm text-muted-foreground">Running sealed inference in TEE...</p>
                <p className="text-xs text-muted-foreground/60 mt-1">0G Compute &bull; Intel TDX &bull; NVIDIA H100</p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-accent-alert/30 bg-accent-alert/10 p-3 text-xs text-accent-alert">
              <XCircle size={14} /> {error}
            </div>
          )}

          {result && renderResult(species, result)}

          {result && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
              <p className="flex items-center gap-1 text-xs text-primary">
                <CheckCircle2 size={14} /> Inference completed in TEE
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">
                Attestation: {result.teeAttestation.slice(0, 20)}...{result.teeAttestation.slice(-8)}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
