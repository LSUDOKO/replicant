"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Clock, RotateCcw } from "lucide-react";

const problems = [
  {
    icon: DollarSign,
    title: "$100K – $1M+",
    subtitle: "Lifecycle Cost",
    description:
      "Building, deploying, and retraining a single AI agent costs hundreds of thousands of dollars per cycle.",
  },
  {
    icon: Clock,
    title: "6 – 18 Months",
    subtitle: "Time to Rebuild",
    description:
      "When agents degrade, teams spend months manually rebuilding — losing all institutional knowledge.",
  },
  {
    icon: RotateCcw,
    title: "Then Repeat",
    subtitle: "Infinite Loop",
    description:
      "No memory transfer. No lineage. Every new version starts from zero. The cycle never ends.",
  },
];

export function ProblemSection() {
  return (
    <section id="features" className="relative py-32">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <span className="label-uppercase text-destructive">The Problem</span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            The AI Agent Extinction Crisis
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Every AI agent deployed today is a disposable tool. No DNA, no
            reproduction, no natural selection. Every team rebuilds the wheel.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {problems.map((problem, i) => (
            <motion.div
              key={problem.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Card className="border-border bg-surface/50 hover:border-destructive/30 transition-colors h-full">
                <CardContent className="pt-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10 border border-destructive/20">
                    <problem.icon size={20} className="text-destructive" />
                  </div>
                  <h3 className="mt-4 text-2xl font-bold">{problem.title}</h3>
                  <p className="label-uppercase mt-1 text-destructive/80">
                    {problem.subtitle}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {problem.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
