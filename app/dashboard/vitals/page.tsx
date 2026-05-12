import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { AgentVitalsChart } from "@/components/dashboard/AgentVitalsChart";
import { StatsCards } from "@/components/dashboard/StatsCards";

export default function VitalsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Vitals</h1>
        <p className="text-sm text-muted-foreground">
          Live fitness, alignment, inference, and on-chain execution signals for
          the active agent cohort.
        </p>
      </div>

      <StatsCards />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AgentVitalsChart />
        </div>
        <ActivityFeed />
      </div>
    </div>
  );
}
