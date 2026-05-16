"use client";

import { ArrowUpRight, Bot, Dna, Target, Coins } from "lucide-react";

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
              <span className="text-[11px] font-medium tracking-[0.06em] uppercase text-[#8B8B9E]">
                {stat.label}
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#8b5cf6]/10">
                <Icon size={14} className="text-[#8b5cf6]" />
              </div>
            </div>
            <div className="mt-4 text-[32px] font-bold tracking-tight text-white">
              {isLoading ? (
                <span className="inline-block h-8 w-16 animate-pulse rounded bg-[#202028]" />
              ) : (
                stat.value
              )}
            </div>
            <div className="mt-2 flex items-center gap-1 text-xs text-[#8B5CF6]">
              <ArrowUpRight size={12} />
              {stat.change}
              {isMockData && (
                <span className="ml-1 text-[#8B8B9E]/60">(demo)</span>
              )}
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
}
