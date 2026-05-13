"use client";

import { ArrowUpRight, Bot, Coins, Dna, Target } from "lucide-react";

import { GlassCard } from "@/components/ui/glass-card";
import { useDashboardData } from "@/lib/queries/use-dashboard-data";

const ICONS = [Bot, Dna, Target, Coins];

export function StatsCards() {
  const { stats, isLoading, isMockData } = useDashboardData();

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, i) => {
        const Icon = ICONS[i];
        return (
          <GlassCard key={stat.label} className="p-5">
            <div className="flex items-center justify-between">
              <span className="label-uppercase text-muted-foreground">{stat.label}</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Icon size={16} className="text-primary" />
              </div>
            </div>
            <div className="mt-3 text-3xl font-bold tracking-tight">
              {isLoading ? (
                <span className="inline-block h-8 w-16 animate-pulse rounded bg-surface" />
              ) : (
                stat.value
              )}
            </div>
            <div className="mt-1 flex items-center gap-1 text-xs text-success">
              <ArrowUpRight size={12} />
              {stat.change}
              {isMockData && (
                <span className="ml-1 text-muted-foreground/60">(demo)</span>
              )}
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
}
