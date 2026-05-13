"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { Progress } from "@/components/ui/progress";
import { useDashboardData } from "@/lib/queries/use-dashboard-data";
import { Shield, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";

export function AlignmentGauge() {
  const { agents, isLoading } = useDashboardData();

  const activeAgents = (agents ?? []).filter((a) => a.status === "active");
  const avgAlignment =
    activeAgents.length > 0
      ? activeAgents.reduce((sum, a) => sum + a.alignmentScore, 0) / activeAgents.length
      : 0;

  return (
    <GlassCard className="p-4">
      <div className="pb-2">
        <h2 className="text-base font-medium">Alignment Status</h2>
        <p className="text-xs text-muted-foreground">
          AI Alignment Node monitoring
        </p>
      </div>
      <div className="space-y-5">
        <div className="rounded-lg border border-border bg-surface/50 p-4 text-center">
          {isLoading ? (
            <Loader2 size={20} className="mx-auto animate-spin text-muted-foreground/50" />
          ) : (
            <>
              <div className="flex items-center justify-center gap-2">
                <Shield size={20} className="text-success" />
                <span className="text-3xl font-bold text-success">
                  {avgAlignment.toFixed(0)}
                </span>
              </div>
              <p className="mt-1 label-uppercase text-muted-foreground">
                Avg Alignment Score
              </p>
            </>
          )}
        </div>

        <div className="space-y-3">
          {activeAgents.length === 0 && !isLoading ? (
            <p className="py-4 text-center text-xs text-muted-foreground/60">No active agents</p>
          ) : (
            activeAgents.slice(0, 4).map((agent) => (
              <div key={agent.id} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="truncate text-xs font-medium">{agent.name}</span>
                  <div className="flex items-center gap-1.5">
                    {agent.alignmentScore >= 90 ? (
                      <CheckCircle2 size={12} className="text-success" />
                    ) : (
                      <AlertTriangle size={12} className="text-warning" />
                    )}
                    <span className="font-mono text-xs text-muted-foreground">
                      {agent.alignmentScore}
                    </span>
                  </div>
                </div>
                <Progress value={agent.alignmentScore} className="h-1.5 bg-surface" />
              </div>
            ))
          )}
        </div>
      </div>
    </GlassCard>
  );
}