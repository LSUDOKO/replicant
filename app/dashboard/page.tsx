import { StatsCards } from "@/components/dashboard/StatsCards";
import { AgentVitalsChart } from "@/components/dashboard/AgentVitalsChart";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { AlignmentGauge } from "@/components/dashboard/AlignmentGauge";
import { ActiveAgentPanel } from "@/components/dashboard/ActiveAgentPanel";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
        <p className="text-sm text-muted-foreground">
          Monitor your agent ecosystem at a glance.
        </p>
      </div>

      <StatsCards />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AgentVitalsChart />
        </div>
        <AlignmentGauge />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ActivityFeed />
        </div>
        <ActiveAgentPanel />
      </div>
    </div>
  );
}
