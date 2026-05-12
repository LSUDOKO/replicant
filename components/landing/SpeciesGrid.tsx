"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SPECIES_INFO } from "@/lib/constants";
import { SpeciesIcon } from "@/components/shared/SpeciesIcon";
import type { AgentSpecies } from "@/types";

const speciesOrder: AgentSpecies[] = [
  "alpha-hunter",
  "code-weaver",
  "game-master",
  "docu-mind",
  "oracle-keeper",
  "social-synth",
];

export function SpeciesGrid() {
  return (
    <section id="species" className="relative py-32 border-t border-border/50">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <span className="label-uppercase text-violet">Agent Species</span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Six Evolving Species
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Each species targets a different domain. All share the same evolution
            engine. All improve autonomously.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {speciesOrder.map((speciesId, i) => {
            const species = SPECIES_INFO[speciesId];
            return (
              <motion.div
                key={speciesId}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <Card className="group border-border bg-surface/50 hover:border-primary/30 hover:glow-cyan transition-all duration-300 h-full">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-surface border border-border-bright group-hover:border-primary/30 transition-colors">
                        <SpeciesIcon species={speciesId} size={22} />
                      </div>
                      <Badge
                        variant="outline"
                        className="border-border-bright text-muted-foreground"
                      >
                        {species.domain}
                      </Badge>
                    </div>
                    <h3 className="mt-4 text-lg font-semibold">{species.name}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {species.description}
                    </p>
                    <div className="mt-4 rounded-lg bg-background/50 border border-border p-3">
                      <p className="text-xs italic text-muted-foreground leading-relaxed">
                        &ldquo;{species.demoLine}&rdquo;
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
