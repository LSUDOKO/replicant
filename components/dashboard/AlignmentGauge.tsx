import { GlassCard } from "@/components/ui/glass-card";
import { Progress } from "@/components/ui/progress";
import { MOCK_AGENTS } from "@/lib/mock-data";
import { Shield, CheckCircle2, AlertTriangle } from "lucide-react";

export function AlignmentGauge() {
  const activeAgents = MOCK_AGENTS.filter((a) => a.status === "active");
  const avgAlignment =
    activeAgents.reduce((sum, a) => sum + a.alignmentScore, 0) /
    activeAgents.length;

  return (
    <GlassCard className="p-4">
      <div className="pb-2">
        <h2 className="text-base font-medium">Alignment Status</h2>
        <p className="text-xs text-muted-foreground">
          AI Alignment Node monitoring
        </p>
      </div>
      <div className="space-y-5">
        {/* Overall score */}
        <div className="rounded-lg border border-border bg-surface/50 p-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <Shield size={20} className="text-success" />
            <span className="text-3xl font-bold text-success">
              {avgAlignment.toFixed(0)}
            </span>
          </div>
          <p className="mt-1 label-uppercase text-muted-foreground">
            Avg Alignment Score
          </p>
        </div>

        {/* Per-agent scores */}
        <div className="space-y-3">
          {activeAgents.slice(0, 4).map((agent) => (
            <div key={agent.id} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium truncate">{agent.name}</span>
                <div className="flex items-center gap-1.5">
                  {agent.alignmentScore >= 90 ? (
                    <CheckCircle2 size={12} className="text-success" />
                  ) : (
                    <AlertTriangle size={12} className="text-warning" />
                  )}
                  <span className="text-xs font-mono text-muted-foreground">
                    {agent.alignmentScore}
                  </span>
                </div>
              </div>
              <Progress
                value={agent.alignmentScore}
                className="h-1.5 bg-surface"
              />
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}
