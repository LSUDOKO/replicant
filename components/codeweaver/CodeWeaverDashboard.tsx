"use client";

import { useState, useRef, useCallback } from "react";
import {
  Loader2,
  Shield,
  Upload,
  FileCode,
  AlertTriangle,
  CheckCircle,
  XCircle,
  AlertOctagon,
  Info,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { ActionButton } from "@/components/ui/action-button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { AuditReport, VulnerabilityFinding } from "@/lib/codeweaver";

function getSeverityIcon(severity: string) {
  switch (severity) {
    case "critical": return <XCircle size={14} className="text-red-400" />;
    case "high": return <AlertOctagon size={14} className="text-orange-400" />;
    case "medium": return <AlertTriangle size={14} className="text-yellow-400" />;
    case "low": return <Info size={14} className="text-blue-400" />;
    default: return <Info size={14} className="text-muted-foreground" />;
  }
}

function getSeverityColor(severity: string) {
  switch (severity) {
    case "critical": return "border-red-500/30 bg-red-500/10";
    case "high": return "border-orange-500/30 bg-orange-500/10";
    case "medium": return "border-yellow-500/30 bg-yellow-500/10";
    case "low": return "border-blue-500/30 bg-blue-500/10";
    default: return "border-border bg-surface/50";
  }
}

function FindingCard({ finding }: { finding: VulnerabilityFinding }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`rounded-xl border p-4 ${getSeverityColor(finding.severity)}`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-start justify-between text-left"
      >
        <div className="flex items-start gap-3">
          {getSeverityIcon(finding.severity)}
          <div>
            <p className="text-sm font-medium">{finding.title}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {finding.ruleId} | Line {finding.lineStart}{finding.lineEnd !== finding.lineStart ? `-${finding.lineEnd}` : ""}
            </p>
          </div>
        </div>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase ${
          finding.severity === "critical" ? "bg-red-500/20 text-red-400" :
          finding.severity === "high" ? "bg-orange-500/20 text-orange-400" :
          finding.severity === "medium" ? "bg-yellow-500/20 text-yellow-400" :
          finding.severity === "low" ? "bg-blue-500/20 text-blue-400" :
          "bg-muted text-muted-foreground"
        }`}>
          {finding.severity}
        </span>
      </button>
      {expanded && (
        <div className="mt-3 space-y-2 border-t border-border/50 pt-3">
          <p className="text-xs text-muted-foreground">{finding.description}</p>
          {finding.sourceCode && (
            <pre className="overflow-x-auto rounded-lg border border-border bg-black/20 p-3 text-[11px] leading-relaxed">
              <code>{finding.sourceCode}</code>
            </pre>
          )}
          <div className="rounded-lg border border-violet-500/20 bg-violet-500/10 p-3">
            <p className="text-[11px] font-medium text-violet-400">Recommendation</p>
            <p className="mt-1 text-[11px] text-muted-foreground">{finding.recommendation}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function SeverityBar({ summary }: { summary: AuditReport["summary"] }) {
  const total = summary.total || 1;
  return (
    <div className="flex h-2 overflow-hidden rounded-full bg-muted">
      <div
        className="bg-red-500 transition-all"
        style={{ width: `${(summary.critical / total) * 100}%` }}
      />
      <div
        className="bg-orange-500 transition-all"
        style={{ width: `${(summary.high / total) * 100}%` }}
      />
      <div
        className="bg-yellow-500 transition-all"
        style={{ width: `${(summary.medium / total) * 100}%` }}
      />
      <div
        className="bg-blue-500 transition-all"
        style={{ width: `${(summary.low / total) * 100}%` }}
      />
      <div
        className="bg-muted-foreground/30 transition-all"
        style={{ width: `${(summary.informational / total) * 100}%` }}
      />
    </div>
  );
}

interface CodeWeaverDashboardProps {
  agentId?: string;
}

export function CodeWeaverDashboard({ agentId }: CodeWeaverDashboardProps) {
  const [source, setSource] = useState("");
  const [contractName, setContractName] = useState("");
  const [report, setReport] = useState<AuditReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"input" | "result">("input");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".sol")) {
      setError("Only .sol files are accepted");
      return;
    }
    setContractName(file.name.replace(/\.sol$/i, ""));
    const reader = new FileReader();
    reader.onload = (ev) => {
      setSource(ev.target?.result as string || "");
    };
    reader.readAsText(file);
  }, []);

  const handleAudit = useCallback(async () => {
    if (!source.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/codeweaver/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractSource: source,
          contractName: contractName || undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Audit failed");
      }
      setReport(data.report);
      setMode("result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Audit failed");
    } finally {
      setLoading(false);
    }
  }, [source, contractName]);

  const reset = useCallback(() => {
    setMode("input");
    setReport(null);
    setSource("");
    setContractName("");
    setError(null);
  }, []);

  return (
    <div className="space-y-4">
      {mode === "input" ? (
        <>
          <GlassCard className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border-bright bg-surface">
                <Shield size={20} className="text-accent-audit" />
              </div>
              <div>
                <h2 className="text-base font-medium">CodeWeaver Audit</h2>
                <p className="text-xs text-muted-foreground">
                  TEE-sealed smart contract security analysis
                </p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Upload Contract</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".sol"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <ActionButton
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={14} className="mr-1" /> Browse
                </ActionButton>
              </div>

              <div>
                <textarea
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="Paste your Solidity contract source code here..."
                  className="min-h-[300px] w-full rounded-xl border border-border bg-surface/50 p-4 font-mono text-xs leading-relaxed text-foreground placeholder:text-muted-foreground/40 focus:border-accent-audit/50 focus:outline-none"
                  spellCheck={false}
                />
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {source.length.toLocaleString()} chars · {
                    source.split("\n").length
                  } lines
                </p>
              </div>

              {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3">
                  <p className="text-xs text-red-400">{error}</p>
                </div>
              )}

              <ActionButton
                type="button"
                onClick={handleAudit}
                disabled={!source.trim() || loading}
                className="w-full"
              >
                {loading ? (
                  <><Loader2 size={14} className="mr-1 animate-spin" /> Auditing...</>
                ) : (
                  <><Shield size={14} className="mr-1" /> Run Security Audit</>
                )}
              </ActionButton>
            </div>
          </GlassCard>
        </>
      ) : report ? (
        <>
          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border-bright bg-surface">
                  <Shield size={20} className="text-accent-audit" />
                </div>
                <div>
                  <h2 className="text-base font-medium">{report.contractName}</h2>
                  <p className="text-xs text-muted-foreground">
                    Report #{report.id} · {new Date(report.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
              <ActionButton type="button" variant="outline" size="sm" onClick={reset}>
                <ArrowLeft size={14} className="mr-1" /> New Audit
              </ActionButton>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="grid grid-cols-5 gap-3 text-center">
              {[
                { label: "Total", value: report.summary.total, color: "text-foreground" },
                { label: "Critical", value: report.summary.critical, color: "text-red-400" },
                { label: "High", value: report.summary.high, color: "text-orange-400" },
                { label: "Medium", value: report.summary.medium, color: "text-yellow-400" },
                { label: "Low", value: report.summary.low, color: "text-blue-400" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-border bg-surface/50 p-3">
                  <p className="text-2xl font-bold tracking-tight ${s.color}">{s.value}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
            <SeverityBar summary={report.summary} />
          </GlassCard>

          <Tabs defaultValue="findings" className="mt-4">
            <TabsList className="border border-border bg-surface">
              <TabsTrigger value="findings">
                <AlertTriangle size={13} className="mr-1.5" />
                Findings ({report.findings.length})
              </TabsTrigger>
              <TabsTrigger value="info">
                <FileCode size={13} className="mr-1.5" />
                Contract Info
              </TabsTrigger>
              <TabsTrigger value="attestation">
                <CheckCircle size={13} className="mr-1.5" />
                Attestation
              </TabsTrigger>
            </TabsList>

            <TabsContent value="findings" className="mt-4 space-y-2">
              {report.findings.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-12 text-center">
                  <CheckCircle size={32} className="text-violet-400" />
                  <p className="text-sm text-muted-foreground">No vulnerabilities detected</p>
                </div>
              ) : (
                report.findings.map((f, i) => <FindingCard key={`${f.ruleId}-${i}`} finding={f} />)
              )}
            </TabsContent>

            <TabsContent value="info" className="mt-4 space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-border bg-surface/50 p-3">
                  <p className="label-uppercase text-muted-foreground">Name</p>
                  <p className="mt-1 text-sm">{report.contractInfo.name}</p>
                </div>
                <div className="rounded-xl border border-border bg-surface/50 p-3">
                  <p className="label-uppercase text-muted-foreground">Pragma</p>
                  <p className="mt-1 font-mono text-sm">{report.contractInfo.pragma || "—"}</p>
                </div>
                <div className="rounded-xl border border-border bg-surface/50 p-3">
                  <p className="label-uppercase text-muted-foreground">Functions</p>
                  <p className="mt-1 text-sm">{report.contractInfo.functions.length}</p>
                </div>
                <div className="rounded-xl border border-border bg-surface/50 p-3">
                  <p className="label-uppercase text-muted-foreground">Lines of Code</p>
                  <p className="mt-1 text-sm">{report.contractInfo.lines}</p>
                </div>
                <div className="rounded-xl border border-border bg-surface/50 p-3">
                  <p className="label-uppercase text-muted-foreground">State Variables</p>
                  <p className="mt-1 text-sm">{report.contractInfo.stateVariables.length}</p>
                </div>
                <div className="rounded-xl border border-border bg-surface/50 p-3">
                  <p className="label-uppercase text-muted-foreground">Inheritance</p>
                  <p className="mt-1 text-sm">{report.contractInfo.inheritance.join(", ") || "None"}</p>
                </div>
              </div>

              {report.contractInfo.functions.length > 0 && (
                <div className="rounded-xl border border-border bg-surface/50 p-3">
                  <p className="label-uppercase text-muted-foreground">Functions</p>
                  <div className="mt-2 space-y-1">
                    {report.contractInfo.functions.map((fn, i) => (
                      <div key={i} className="flex items-center justify-between rounded-lg bg-black/10 px-3 py-1.5">
                        <span className="font-mono text-xs">{fn.name}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {fn.visibility} · {fn.mutability}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {report.contractInfo.mappings.map((m, i) => (
                <div key={i} className="rounded-xl border border-border bg-surface/50 p-3">
                  <p className="label-uppercase text-muted-foreground">Mapping: {m.name}</p>
                  <p className="mt-1 font-mono text-xs">{m.keyType} → {m.valueType}</p>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="attestation" className="mt-4 space-y-3">
              <div className="rounded-xl border border-border bg-surface/50 p-4">
                <p className="label-uppercase text-muted-foreground">TEE Attestation</p>
                <p className="mt-2 font-mono text-xs break-all text-muted-foreground">
                  {report.teeAttestation}
                </p>
              </div>
              {report.storageHash && (
                <div className="rounded-xl border border-border bg-surface/50 p-4">
                  <p className="label-uppercase text-muted-foreground">0G Storage Hash</p>
                  <p className="mt-2 font-mono text-xs break-all text-muted-foreground">
                    {report.storageHash}
                  </p>
                </div>
              )}
              <div className="rounded-xl border border-border bg-surface/50 p-4">
                <p className="label-uppercase text-muted-foreground">LLM Analysis</p>
                <p className="mt-1 text-sm">{report.llmAnalyzed ? "AI-assisted analysis performed" : "Pattern-based only"}</p>
              </div>
            </TabsContent>
          </Tabs>
        </>
      ) : null}
    </div>
  );
}
