"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { Progress, ProgressTrack, ProgressIndicator } from "@/components/ui/progress";
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
        <h2 className="text-sm font-semibold text-white">Alignment Status</h2>
        <p className="text-xs text-[#8B8B9E]">
          AI Alignment Node monitoring
        </p>
      </div>
      <div className="space-y-5">
        <div className="rounded-lg border border-[#2D2D3D] bg-[#202028] p-4 text-center">
          {isLoading ? (
            <Loader2 size={20} className="mx-auto animate-spin text-[#8B8B9E]/50" />
          ) : (
            <>
              <div className="flex items-center justify-center gap-2">
                <span className="text-3xl font-bold text-[#8B5CF6]">
                  {avgAlignment.toFixed(0)}
                </span>
              </div>
              <p className="mt-1 text-[11px] font-medium tracking-[0.06em] uppercase text-[#8B8B9E]">
                Avg Alignment Score
              </p>
            </>
          )}
        </div>

        <div className="space-y-4">
          {activeAgents.length === 0 && !isLoading ? (
            <p className="py-4 text-center text-xs text-[#8B8B9E]/60">No active agents</p>
          ) : (
            activeAgents.slice(0, 4).map((agent) => (
              <div key={agent.id} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="truncate text-xs font-medium text-white">{agent.name}</span>
                  <div className="flex items-center gap-1.5">
                    {agent.alignmentScore >= 90 ? (
                      <CheckCircle2 size={12} className="text-[#8B5CF6]" />
                    ) : (
                      <AlertTriangle size={12} className="text-[#F59E0B]" />
                    )}
                    <span className="font-mono text-xs text-[#8B8B9E]">
                      {agent.alignmentScore}
                    </span>
                  </div>
                </div>
                <Progress value={agent.alignmentScore}>
                  <ProgressTrack className="h-[6px] rounded-full bg-[#202028]">
                    <ProgressIndicator className="h-full rounded-full bg-[#8b5cf6]" />
                  </ProgressTrack>
                </Progress>
              </div>
            ))
          )}
        </div>
      </div>
    </GlassCard>
  );
}
