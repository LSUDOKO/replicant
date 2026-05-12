"use client";

import { motion } from "framer-motion";
import { Egg, Activity, Dna, ShoppingCart, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: Egg,
    title: "Genesis",
    description:
      "Deploy your agent species. Configuration encrypted and uploaded to 0G Storage. Gen-0 Agent ID minted on-chain.",
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
  },
  {
    icon: Activity,
    title: "Life",
    description:
      "Agent performs its task. Performance metrics logged to 0G Storage KV layer. Users subscribe to outputs.",
    color: "text-success",
    bg: "bg-success/10",
    border: "border-success/20",
  },
  {
    icon: Dna,
    title: "Evolution",
    description:
      "Performance drops? Agent enters TEE Evolution Chamber. 50 mutations tested. Best child minted. Memory transferred.",
    color: "text-violet",
    bg: "bg-violet/10",
    border: "border-violet/20",
  },
  {
    icon: ShoppingCart,
    title: "Commerce",
    description:
      "Child agent listed on marketplace. Sealed handover — strategy never exposed. Royalties flow to original creator.",
    color: "text-warning",
    bg: "bg-warning/10",
    border: "border-warning/20",
  },
];

export function HowItWorks() {
  return (
    <section className="relative py-32 border-t border-border/50">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <span className="label-uppercase text-primary">How It Works</span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            From Genesis to Commerce
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Four phases of autonomous agent evolution — fully on-chain, fully
            sealed, fully safe.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-6 md:grid-cols-4">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative"
            >
              <div className="rounded-xl border border-border bg-surface/50 p-6 h-full hover:border-border-bright transition-colors">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${step.bg} border ${step.border}`}
                  >
                    <step.icon size={20} className={step.color} />
                  </div>
                  <span className="label-uppercase text-muted-foreground">
                    Phase {i + 1}
                  </span>
                </div>
                <h3 className={`mt-4 text-xl font-semibold ${step.color}`}>
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
              {i < steps.length - 1 && (
                <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                  <ArrowRight size={16} className="text-border-bright" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
