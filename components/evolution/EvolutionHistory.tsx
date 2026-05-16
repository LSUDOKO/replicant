"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ExplorerLink } from "@/components/shared/ExplorerLink";
import { useDashboardData } from "@/lib/queries/use-dashboard-data";
import { ArrowUp, ArrowDown, Loader2 } from "lucide-react";

const statusBadge = {
  completed: { label: "Completed", className: "bg-violet-500/10 text-violet-400 border-violet-500/20" },
  failed: { label: "Failed", className: "bg-white/10 text-white border-white/20" },
  mutating: { label: "Mutating", className: "bg-violet-500/10 text-violet-400 border-violet-500/20" },
  validating: { label: "Validating", className: "bg-violet-500/10 text-violet-400 border-violet-500/20" },
  pending: { label: "Pending", className: "bg-white/10 text-white/60 border-white/20" },
};

export function EvolutionHistory() {
  const { evolutions, isLoading } = useDashboardData();

  return (
    <>
      <Card className="border-white/10 bg-black">
        <CardHeader className="pb-2 border-b border-white/10">
          <CardTitle className="text-base font-medium text-white">Evolution History</CardTitle>
          <p className="text-xs text-white/60">
            All past and current evolution events
          </p>
        </CardHeader>
        <CardContent className="pt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={20} className="animate-spin text-white/50" />
            </div>
          ) : evolutions.length === 0 ? (
            <p className="py-8 text-center text-sm text-white/60">No evolution events yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead className="text-white/60">Agent</TableHead>
                  <TableHead className="text-white/60">Generation</TableHead>
                  <TableHead className="text-white/60">Fitness Δ</TableHead>
                  <TableHead className="text-white/60">Status</TableHead>
                  <TableHead className="text-white/60">Tx</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {evolutions.map((event) => {
                  const badge = statusBadge[event.status] ?? statusBadge.pending;

                  return (
                    <TableRow
                      key={event.id}
                      className="border-white/10 hover:bg-white/5"
                    >
                      <TableCell className="text-sm font-medium text-white">
                        {event.agentName}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-white/60">
                        Gen-{event.parentGeneration} → Gen-{event.childGeneration}
                      </TableCell>
                      <TableCell>
                        {event.status === "completed" && event.fitnessImprovement > 0 ? (
                          <span className="flex items-center gap-1 text-xs text-violet-400">
                            <ArrowUp size={12} />+{event.fitnessImprovement}%
                          </span>
                        ) : event.fitnessImprovement < 0 ? (
                          <span className="flex items-center gap-1 text-xs text-white">
                            <ArrowDown size={12} />{event.fitnessImprovement}%
                          </span>
                        ) : event.status === "mutating" ? (
                          <span className="flex items-center gap-1 text-xs text-white/60">
                            <Loader2 size={12} className="animate-spin" />&mdash;
                          </span>
                        ) : (
                          <span className="text-xs text-white/60">&mdash;</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={badge.className}>
                          {badge.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <ExplorerLink hash={event.txHash} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
}
