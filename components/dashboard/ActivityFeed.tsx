import { GlassCard } from "@/components/ui/glass-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ExplorerLink } from "@/components/shared/ExplorerLink";
import { MOCK_ACTIVITY } from "@/lib/mock-data";
import { Dna, ShoppingCart, Zap, Package, ArrowRightLeft } from "lucide-react";

const typeConfig = {
  mint: { icon: Package, color: "text-primary", bg: "bg-primary/10" },
  evolution: { icon: Dna, color: "text-accent-evolution", bg: "bg-accent-evolution/10" },
  slash: { icon: Zap, color: "text-destructive", bg: "bg-destructive/10" },
  sale: { icon: ShoppingCart, color: "text-success", bg: "bg-success/10" },
  transfer: { icon: ArrowRightLeft, color: "text-warning", bg: "bg-warning/10" },
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
  return (
    <GlassCard className="p-4">
      <div className="pb-2">
        <h2 className="text-base font-medium">Recent Activity</h2>
        <p className="text-xs text-muted-foreground">Latest on-chain events</p>
      </div>
      <div>
        <ScrollArea className="h-[320px] pr-3">
          <div className="space-y-4">
            {MOCK_ACTIVITY.map((event) => {
              const config = typeConfig[event.type];
              const Icon = config.icon;
              return (
                <div key={event.id} className="flex gap-3">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${config.bg}`}
                  >
                    <Icon size={14} className={config.color} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium truncate">
                        {event.agentName}
                      </p>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {formatTimestamp(event.timestamp)}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {event.description}
                    </p>
                    <ExplorerLink value={event.txHash} className="mt-1" />
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </GlassCard>
  );
}
