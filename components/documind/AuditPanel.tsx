"use client";

import { useState, useCallback } from "react";
import {
  FileText, AlertTriangle, Scale, Gavel, Upload,
  ChevronDown, ChevronUp, Shield, Loader2, ExternalLink,
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { ActionButton } from "@/components/ui/action-button";
import type { AuditReport, ClauseAnalysis, Jurisdiction } from "@/lib/documind/types";

const JURISDICTIONS: { value: Jurisdiction; label: string }[] = [
  { value: "US-Delaware", label: "US - Delaware" },
  { value: "US-California", label: "US - California" },
  { value: "UK-England", label: "UK - England & Wales" },
  { value: "EU-Germany", label: "EU - Germany" },
  { value: "Singapore", label: "Singapore" },
  { value: "UAE-DIFC", label: "UAE - DIFC" },
];

function getSeverityColor(severity: string): string {
  switch (severity) {
    case "CRITICAL": return "border-destructive/50 bg-destructive/10";
    case "HIGH": return "border-orange-500/50 bg-orange-500/10";
    case "MEDIUM": return "border-yellow-500/50 bg-yellow-500/10";
    case "LOW": return "border-blue-500/50 bg-blue-500/10";
    default: return "border-violet-500/30 bg-violet-500/10";
  }
}

function getSeverityBadge(severity: string): string {
  switch (severity) {
    case "CRITICAL": return "bg-destructive/20 text-destructive";
    case "HIGH": return "bg-orange-500/20 text-orange-400";
    case "MEDIUM": return "bg-yellow-500/20 text-yellow-400";
    case "LOW": return "bg-blue-500/20 text-blue-400";
    default: return "bg-violet-500/20 text-violet-400";
  }
}

function getRiskColor(risk: string): string {
  switch (risk) {
    case "CRITICAL": return "text-destructive";
    case "HIGH": return "text-orange-400";
    case "MEDIUM": return "text-yellow-400";
    case "LOW": return "text-blue-400";
    case "SAFE": return "text-violet-400";
    default: return "text-muted-foreground";
  }
}

function ClauseCard({ clause }: { clause: ClauseAnalysis }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between p-4 text-left hover:bg-surface/20 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className={`w-2 h-2 rounded-full ${
            clause.riskLevel === "CRITICAL" ? "bg-destructive" :
            clause.riskLevel === "HIGH" ? "bg-orange-500" :
            clause.riskLevel === "MEDIUM" ? "bg-yellow-500" :
            clause.riskLevel === "LOW" ? "bg-blue-500" : "bg-violet-500"
          }`} />
          <div>
            <p className="text-sm font-medium">{clause.header}</p>
            <p className="text-[11px] text-muted-foreground">{clause.classification} · Lines {clause.lineStart}-{clause.lineEnd}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] rounded-full px-2 py-0.5 font-medium ${getSeverityBadge(clause.riskLevel)}`}>
            {clause.riskLevel}
          </span>
          {clause.riskFlags.length > 0 && (
            <span className="text-[10px] text-muted-foreground">{clause.riskFlags.length} flags</span>
          )}
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border px-4 pb-4 space-y-3">
          {clause.standardComparison.hasStandard && (
            <div className="pt-3">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Standard Comparison</p>
              <div className="rounded-xl border border-border bg-surface/30 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full transition-all"
                      style={{ width: `${(clause.standardComparison.similarity * 100).toFixed(0)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground">{(clause.standardComparison.similarity * 100).toFixed(0)}% match</span>
                </div>
                <p className="text-[11px] text-muted-foreground">{clause.standardComparison.notes}</p>
                {clause.standardComparison.standardText && (
                  <details className="mt-2">
                    <summary className="text-[10px] text-muted-foreground cursor-pointer hover:text-foreground">Standard template</summary>
                    <p className="mt-1 text-[11px] text-muted-foreground/70 leading-relaxed">{clause.standardComparison.standardText}</p>
                  </details>
                )}
              </div>
            </div>
          )}

          {clause.riskFlags.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Risk Flags</p>
              <div className="space-y-2">
                {clause.riskFlags.map((flag, i) => (
                  <div key={i} className={`rounded-xl border-l-2 p-3 ${getSeverityColor(flag.severity)}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[10px] font-medium ${getRiskColor(flag.severity)}`}>{flag.severity}</span>
                      <span className="text-[10px] text-muted-foreground">Lines {flag.lineStart}-{flag.lineEnd}</span>
                    </div>
                    <p className="text-sm mb-1">"{flag.text}"</p>
                    <p className="text-[11px] text-muted-foreground mb-1">{flag.reason}</p>
                    <div className="rounded-lg border border-accent/20 bg-accent/10 p-2">
                      <p className="text-[10px] font-medium text-accent">Suggestion</p>
                      <p className="text-[11px] text-muted-foreground">{flag.suggestion}</p>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">Ref: {flag.standardReference}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <details>
            <summary className="text-[10px] text-muted-foreground cursor-pointer hover:text-foreground">Clause text</summary>
            <p className="mt-1 text-[11px] font-mono text-muted-foreground/70 whitespace-pre-wrap">{clause.text}</p>
          </details>
        </div>
      )}
    </div>
  );
}

interface AuditPanelProps {
  agentId?: string;
}

export function AuditPanel({ agentId: _agentId }: AuditPanelProps) {
  const [text, setText] = useState("");
  const [jurisdiction, setJurisdiction] = useState<Jurisdiction>("US-Delaware");
  const [report, setReport] = useState<AuditReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"input" | "result">("input");

  const handleSubmit = useCallback(async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/documind/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ document: text, filename: "contract.txt", jurisdiction }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Analysis failed");
      setReport(data.report);
      setMode("result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  }, [text, jurisdiction]);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("document", file);
      formData.append("jurisdiction", jurisdiction);

      const res = await fetch("/api/documind/audit", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Analysis failed");
      setReport(data.report);
      setMode("result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  }, [jurisdiction]);

  const reset = useCallback(() => {
    setMode("input");
    setReport(null);
    setText("");
    setError(null);
  }, []);

  return (
    <div className="space-y-4">
      <GlassCard className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border-bright bg-surface">
              <FileText size={20} className="text-accent-docu" />
            </div>
            <div>
              <h2 className="text-base font-medium">DocuMind Contract Analyzer</h2>
              <p className="text-xs text-muted-foreground">TEE-sealed legal audit with jurisdiction standards</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Scale size={14} className="text-destructive" />
            <select
              value={jurisdiction}
              onChange={(e) => setJurisdiction(e.target.value as Jurisdiction)}
              className="rounded-lg border border-border bg-surface px-2 py-1 text-xs text-foreground"
            >
              {JURISDICTIONS.map((j) => (
                <option key={j.value} value={j.value}>{j.label}</option>
              ))}
            </select>
          </div>
        </div>
      </GlassCard>

      {mode === "input" ? (
        <GlassCard className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Upload or paste contract text</p>
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
              <ActionButton type="button" variant="outline" size="sm" as-child>
                <span><Upload size={14} className="mr-1" /> Upload File</span>
              </ActionButton>
            </label>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste legal contract text here..."
            className="min-h-[250px] w-full rounded-xl border border-border bg-surface/50 p-4 text-xs leading-relaxed font-mono text-foreground placeholder:text-muted-foreground/40 focus:border-accent-docu/50 focus:outline-none"
            spellCheck={false}
          />
          <p className="text-[11px] text-muted-foreground">{text.length.toLocaleString()} chars · {text.split("\n").length} lines</p>

          {error && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3">
              <p className="text-xs text-destructive">{error}</p>
            </div>
          )}

          <ActionButton
            type="button"
            onClick={handleSubmit}
            disabled={!text.trim() || loading}
            className="w-full"
          >
            {loading ? (
              <><Loader2 size={14} className="mr-1 animate-spin" /> Analyzing in TEE...</>
            ) : (
              <><Shield size={14} className="mr-1" /> Run Legal Audit</>
            )}
          </ActionButton>
        </GlassCard>
      ) : report ? (
        <>
          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border-bright bg-surface">
                  <FileText size={20} className="text-accent-docu" />
                </div>
                <div>
                  <h2 className="text-base font-medium">{report.documentName}</h2>
                  <p className="text-xs text-muted-foreground">Report #{report.id} · {new Date(report.timestamp).toLocaleString()}</p>
                </div>
              </div>
              <ActionButton type="button" variant="outline" size="sm" onClick={reset}>
                New Audit
              </ActionButton>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Overall Risk</p>
                <p className={`text-3xl font-bold mt-1 ${getRiskColor(report.overallRisk)}`}>{report.overallRisk}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span>{report.totalClauses} clauses</span>
                  <span className="text-accent">{report.jurisdiction}</span>
                </div>
              </div>
              <div className="text-right space-y-1">
                <div className="flex items-center gap-1 justify-end">
                  <Gavel size={12} className="text-accent" />
                  <span className="text-[10px] font-mono text-muted-foreground">TEE: {report.teeAttestation.slice(0, 10)}...</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-2 text-center mb-4">
              {[
                { label: "Critical", value: report.riskBreakdown["CRITICAL"] || 0, color: "text-destructive" },
                { label: "High", value: report.riskBreakdown["HIGH"] || 0, color: "text-orange-400" },
                { label: "Medium", value: report.riskBreakdown["MEDIUM"] || 0, color: "text-yellow-400" },
                { label: "Low", value: report.riskBreakdown["LOW"] || 0, color: "text-blue-400" },
                { label: "Safe", value: report.riskBreakdown["SAFE"] || 0, color: "text-violet-400" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-border bg-surface/50 p-2">
                  <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="flex h-2 overflow-hidden rounded-full bg-muted">
              {(["CRITICAL", "HIGH", "MEDIUM", "LOW", "SAFE"] as const).map((sev) => {
                const total = Object.values(report.riskBreakdown).reduce((a, b) => a + b, 0) || 1;
                const pct = ((report.riskBreakdown[sev] || 0) / total) * 100;
                if (pct === 0) return null;
                return (
                  <div
                    key={sev}
                    className={
                      sev === "CRITICAL" ? "bg-destructive" :
                      sev === "HIGH" ? "bg-orange-500" :
                      sev === "MEDIUM" ? "bg-yellow-500" :
                      sev === "LOW" ? "bg-blue-500" : "bg-violet-500"
                    }
                    style={{ width: `${pct}%` }}
                  />
                );
              })}
            </div>
          </GlassCard>

          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground px-1">Clause Analysis ({report.clausesAnalyzed.length})</p>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {report.clausesAnalyzed.map((clause) => (
                <ClauseCard key={clause.id} clause={clause} />
              ))}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
