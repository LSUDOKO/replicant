"use client";

import { Badge } from "@/components/ui/badge";
import type { AgentStatus } from "@/types";

const statusConfig: Record<AgentStatus, { label: string; className: string }> = {
  active: {
    label: "Active",
    className: "bg-success/10 text-success border-success/20 hover:bg-success/15",
  },
  archived: {
    label: "Archived",
    className:
      "bg-muted-foreground/10 text-muted-foreground border-muted-foreground/20 hover:bg-muted-foreground/15",
  },
  slashed: {
    label: "Slashed",
    className: "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/15",
  },
  evolving: {
    label: "Evolving",
    className: "bg-cyan/10 text-cyan border-cyan/20 hover:bg-cyan/15",
  },
};

export function StatusBadge({ status }: { status: AgentStatus }) {
  const config = statusConfig[status];
  return (
    <Badge variant="outline" className={config.className}>
      <span
        className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${
          status === "active"
            ? "bg-success"
            : status === "slashed"
              ? "bg-destructive"
              : status === "evolving"
                ? "bg-cyan animate-pulse"
                : "bg-muted-foreground"
        }`}
      />
      {config.label}
    </Badge>
  );
}
