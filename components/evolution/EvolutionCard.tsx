"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SpeciesIcon } from "@/components/shared/SpeciesIcon";
import { ExplorerLink } from "@/components/shared/ExplorerLink";
import { MOCK_EVOLUTION_EVENTS, MOCK_AGENTS } from "@/lib/mock-data";
import { FlaskConical, Loader2, ShieldCheck } from "lucide-react";

export function EvolutionCard() {
  const activeEvolution = MOCK_EVOLUTION_EVENTS.find(
    (e) => e.status === "mutating" || e.status === "validating"
  );
  const agent = activeEvolution
    ? MOCK_AGENTS.find((a) => a.id === activeEvolution.agentId)
    : null;

  if (!activeEvolution || !agent) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <FlaskConical size={40} className="text-muted-foreground/30" />
          <p className="mt-4 text-sm text-muted-foreground">
            No active evolutions. Agents are performing well.
          </p>
        </CardContent>
      </Card>
    );
  }

  const isMutating = activeEvolution.status === "mutating";
  const progressValue = isMutating ? 62 : 85;

  return (
    <Card className="border-primary/20 bg-card glow-cyan overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <FlaskConical size={18} className="text-primary" />
            </motion.div>
            Active Evolution
          </CardTitle>
          <Badge className="bg-cyan/10 text-cyan border-cyan/20">
            <Loader2 size={12} className="mr-1 animate-spin" />
            {isMutating ? "Mutating" : "Validating"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Agent info */}
        <div className="flex items-center gap-3 rounded-lg border border-border bg-surface/50 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface border border-border-bright">
            <SpeciesIcon species={agent.species} size={20} />
          </div>
          <div>
            <p className="font-medium">{agent.name}</p>
            <p className="text-xs text-muted-foreground">
              Gen-{activeEvolution.parentGeneration} → Gen-
              {activeEvolution.childGeneration}
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {isMutating
                ? "Testing 50 mutation candidates..."
                : "AI Alignment Node scanning..."}
            </span>
            <span className="text-xs font-mono text-primary">{progressValue}%</span>
          </div>
          <div className="relative">
            <Progress value={progressValue} className="h-2 bg-surface" />
            <motion.div
              className="absolute top-0 left-0 h-full rounded-full bg-primary/20"
              animate={{ width: ["0%", "100%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              style={{ maxWidth: `${progressValue}%` }}
            />
          </div>
        </div>

        {/* Stages */}
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              label: "Mutation",
              icon: FlaskConical,
              done: true,
              active: isMutating,
            },
            {
              label: "Training",
              icon: Loader2,
              done: !isMutating,
              active: isMutating,
            },
            {
              label: "Alignment",
              icon: ShieldCheck,
              done: false,
              active: !isMutating,
            },
          ].map((stage) => (
            <div
              key={stage.label}
              className={`rounded-lg border p-3 text-center text-xs ${
                stage.active
                  ? "border-primary/30 bg-primary/5"
                  : stage.done
                    ? "border-success/20 bg-success/5"
                    : "border-border bg-surface/50"
              }`}
            >
              <stage.icon
                size={16}
                className={`mx-auto ${
                  stage.active
                    ? "text-primary animate-pulse"
                    : stage.done
                      ? "text-success"
                      : "text-muted-foreground/50"
                }`}
              />
              <p className="mt-1.5 font-medium">{stage.label}</p>
            </div>
          ))}
        </div>

        <ExplorerLink hash={activeEvolution.txHash} />
      </CardContent>
    </Card>
  );
}
