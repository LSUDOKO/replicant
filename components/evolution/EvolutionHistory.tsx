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
import { MOCK_EVOLUTION_EVENTS } from "@/lib/mock-data";
import { ArrowUp, ArrowDown, Loader2 } from "lucide-react";

const statusBadge = {
  completed: {
    label: "Completed",
    className: "bg-success/10 text-success border-success/20",
  },
  failed: {
    label: "Failed",
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
  mutating: {
    label: "Mutating",
    className: "bg-cyan/10 text-cyan border-cyan/20",
  },
  validating: {
    label: "Validating",
    className: "bg-warning/10 text-warning border-warning/20",
  },
  pending: {
    label: "Pending",
    className: "bg-muted-foreground/10 text-muted-foreground border-muted-foreground/20",
  },
};

const strategyLabel: Record<string, string> = {
  prompt_paraphrase: "Prompt Paraphrase",
  temperature_adjust: "Temperature Adjust",
  context_window_resize: "Context Resize",
  model_layer_prune: "Layer Prune",
  attention_head_retune: "Attention Retune",
  ensemble_weight_shift: "Ensemble Shift",
};

export function EvolutionHistory() {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Evolution History</CardTitle>
        <p className="text-xs text-muted-foreground">
          All past and current evolution events
        </p>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Agent</TableHead>
              <TableHead className="text-muted-foreground">Generation</TableHead>
              <TableHead className="text-muted-foreground">Strategy</TableHead>
              <TableHead className="text-muted-foreground">Fitness Δ</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground">Tx</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_EVOLUTION_EVENTS.map((event) => {
              const badge = statusBadge[event.status];
              return (
                <TableRow key={event.id} className="border-border">
                  <TableCell className="font-medium text-sm">
                    {event.agentName}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    Gen-{event.parentGeneration} → Gen-{event.childGeneration}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {strategyLabel[event.mutationStrategy] || event.mutationStrategy}
                  </TableCell>
                  <TableCell>
                    {event.fitnessImprovement > 0 ? (
                      <span className="flex items-center gap-1 text-xs text-success">
                        <ArrowUp size={12} />+{event.fitnessImprovement}%
                      </span>
                    ) : event.fitnessImprovement < 0 ? (
                      <span className="flex items-center gap-1 text-xs text-destructive">
                        <ArrowDown size={12} />{event.fitnessImprovement}%
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Loader2 size={12} className="animate-spin" />—
                      </span>
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
      </CardContent>
    </Card>
  );
}
