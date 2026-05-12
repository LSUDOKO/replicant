import { GlassCard } from "@/components/ui/glass-card";
import { MOCK_STATS } from "@/lib/mock-data";
import { ArrowUpRight, Bot, Dna, Target, Coins } from "lucide-react";

const icons = [Bot, Dna, Target, Coins];

export function StatsCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {MOCK_STATS.map((stat, i) => {
        const Icon = icons[i];
        return (
          <GlassCard key={stat.label} className="p-5">
            <div className="flex items-center justify-between">
              <span className="label-uppercase text-muted-foreground">
                {stat.label}
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Icon size={16} className="text-primary" />
              </div>
            </div>
            <div className="mt-3 text-3xl font-bold tracking-tight">
              {stat.value}
            </div>
            <div className="mt-1 flex items-center gap-1 text-xs text-success">
              <ArrowUpRight size={12} />
              {stat.change}
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
}
