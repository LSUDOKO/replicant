"use client";

import { motion } from "framer-motion";
import { OG_COMPONENTS } from "@/lib/constants";
import { Cpu, Database, HardDrive, Fingerprint, Shield, Link as LinkIcon } from "lucide-react";

const icons = [Cpu, Database, HardDrive, Fingerprint, Shield, LinkIcon];

export function IntegrationMap() {
  return (
    <section id="integration" className="relative py-32 border-t border-border/50">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <span className="label-uppercase text-cyan">0G Integration</span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Powered by the Full 0G Stack
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Only 0G provides TEE sealed inference, AI Alignment Nodes, Agent ID
            (ERC-7857), petabyte storage, and sub-second finality — in one unified
            stack.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {OG_COMPONENTS.map((comp, i) => {
            const Icon = icons[i];
            return (
              <motion.div
                key={comp.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="rounded-xl border border-border bg-surface/50 p-5 hover:border-cyan/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan/10 border border-cyan/20">
                    <Icon size={18} className="text-cyan" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">{comp.name}</h3>
                    <span className="label-uppercase text-cyan/70">
                      {comp.feature}
                    </span>
                  </div>
                </div>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  {comp.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
