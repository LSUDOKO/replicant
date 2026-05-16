"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ExplorerLink } from "@/components/shared/ExplorerLink";
import { useDashboardData } from "@/lib/queries/use-dashboard-data";
import { Dna, ShoppingCart, Zap, Package, ArrowRightLeft, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const typeConfig = {
  mint: { icon: Package, color: "text-[#8b5cf6]", bg: "bg-[#8b5cf6]/10" },
  evolution: { icon: Dna, color: "text-[#8b5cf6]", bg: "bg-[#8b5cf6]/10" },
  slash: { icon: Zap, color: "text-[#ef4444]", bg: "bg-[#ef4444]/10" },
  sale: { icon: ShoppingCart, color: "text-[#8B5CF6]", bg: "bg-[#8B5CF6]/10" },
  transfer: { icon: ArrowRightLeft, color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/10" },
};

function formatTimestamp(ts: string) {
  const d = new Date(ts);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function ActivityFeed() {
  const { activity, isLoading, isMockData } = useDashboardData();

  return (
    <GlassCard className="p-4">
      <div className="flex items-center justify-between pb-3">
        <div>
          <h2 className="text-sm font-semibold text-white">Recent Activity</h2>
          <p className="text-xs text-[#8B8B9E]">Latest on-chain events</p>
        </div>
        {isMockData && (
          <span className="text-[10px] text-[#8B8B9E]/60">demo data</span>
        )}
      </div>
      <div>
        <ScrollArea className="h-[320px] pr-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={20} className="animate-spin text-[#8B8B9E]/50" />
            </div>
          ) : activity.length === 0 ? (
            <div className="py-12 text-center text-sm text-[#8B8B9E]/60">No activity yet</div>
          ) : (
            <div className="space-y-1">
              {activity.map((event) => {
                const config = typeConfig[event.type];
                const Icon = config.icon;
                return (
                  <div
                    key={event.id}
                    className="flex gap-3 rounded-lg px-2 py-2.5 transition-colors duration-200 hover:bg-white/[0.04]"
                  >
                    <div
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                        config.bg
                      )}
                    >
                      <Icon size={14} className={cn(config.color)} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate text-sm font-medium text-white">
                          {event.agentName}
                        </p>
                        <span className="shrink-0 text-xs text-[#8B8B9E]">
                          {formatTimestamp(event.timestamp)}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-[#8B8B9E]">
                        {event.description}
                      </p>
                      {event.txHash && (
                        <ExplorerLink value={event.txHash} className="mt-1" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>
    </GlassCard>
  );
}
