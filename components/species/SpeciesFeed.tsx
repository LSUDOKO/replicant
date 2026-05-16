"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { SPECIES_IMAGES } from "@/lib/species/engine";
import { ExplorerLinkWrapper } from "@/components/shared/ExplorerLink";
import type { SpeciesId, InferenceOutput } from "@/lib/species/engine";

interface FeedItem {
  id: string;
  species: SpeciesId;
  output: InferenceOutput;
  timestamp: number;
}

interface SpeciesFeedProps {
  species: SpeciesId;
  title: string;
  accentColor: string;
}

const ICONS: Record<string, string> = {
  "alpha-hunter": "📊",
  "code-weaver": "📄",
  "game-master": "🎮",
  "docu-mind": "📋",
  "oracle-keeper": "💰",
  "social-synth": "🐦",
};

function renderOutput(species: SpeciesId, output: InferenceOutput): string {
  const r = output.result;
  switch (species) {
    case "alpha-hunter": {
      const sr = r as any;
      return `${sr.token ?? "—"} | ${sr.signal ?? "—"} | ${(sr.confidence * 100).toFixed(0)}% confidence`;
    }
    case "code-weaver": {
      const sr = r as any;
      const vulns = sr.vulnerabilities?.length ?? 0;
      return `${vulns} vulnerabilities found | Risk: ${sr.overallRisk ?? "—"}`;
    }
    case "game-master": {
      const sr = r as any;
      return `Move: ${sr.move?.type ?? "—"} | Strategy: ${sr.strategy ?? "—"}`;
    }
    case "docu-mind": {
      const sr = r as any;
      const flagged = sr.flaggedClauses?.length ?? 0;
      return `${sr.clauseCount ?? 0} clauses | ${flagged} flagged | Risk: ${sr.overallRisk ?? "—"}`;
    }
    case "oracle-keeper": {
      const sr = r as any;
      return `${sr.asset ?? "—"}: $${sr.consensusPrice?.toFixed(2) ?? "—"} | ${sr.sources ?? 0} sources`;
    }
    case "social-synth": {
      const sr = r as any;
      return `${sr.format ?? "—"} | ${sr.tone ?? "—"} tone | Engagement: ${((sr.predictedEngagement ?? 0) * 100).toFixed(0)}%`;
    }
  }
}

export function SpeciesFeed({ species, title, accentColor }: SpeciesFeedProps) {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [isLive, setIsLive] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const addItem = useCallback(async () => {
    try {
      const res = await fetch(`/api/inference/${species}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: {} }),
      });
      if (!res.ok) return;
      const output: InferenceOutput = await res.json();
      setItems((prev) => [
        {
          id: output.teeAttestation.slice(0, 12),
          species,
          output,
          timestamp: output.timestamp,
        },
        ...prev.slice(0, 19),
      ]);
    } catch {
      // silent
    }
  }, [species]);

  useEffect(() => {
    if (isLive) {
      addItem();
      intervalRef.current = setInterval(addItem, 8000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isLive, addItem]);

  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-xl">{ICONS[species] ?? "🔬"}</span>
          <div>
            <h3 className="font-heading text-sm font-semibold text-foreground">{title}</h3>
            <p className="text-[10px] text-muted-foreground">TEE Verified Inference Feed</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsLive(!isLive)}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-medium transition-colors ${
            isLive
              ? "bg-accent-success/15 text-accent-success"
              : "bg-muted text-muted-foreground"
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${isLive ? "bg-accent-success animate-pulse" : "bg-muted-foreground"}`} />
          {isLive ? "LIVE" : "PAUSED"}
        </button>
      </div>

      <div className="space-y-2 max-h-[320px] overflow-y-auto scrollbar-thin">
        {items.length === 0 && (
          <p className="text-xs text-muted-foreground/60 text-center py-8">
            Waiting for first inference...
          </p>
        )}
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-2 rounded-lg border border-border bg-surface/30 px-3 py-2 text-xs"
            style={{ borderLeftColor: accentColor, borderLeftWidth: 2 }}
          >
            <div className="flex-1 min-w-0">
              <p className="truncate text-foreground/80">{renderOutput(species, item.output)}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                TEE Verified &bull; Conf: {(item.output.confidence * 100).toFixed(0)}% &bull; {item.output.metrics.inferenceTimeMs}ms
              </p>
            </div>
            <ExplorerLinkWrapper value={item.output.teeAttestation} type="tx" className="shrink-0 text-[10px]" />
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
