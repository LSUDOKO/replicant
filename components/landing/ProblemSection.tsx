"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const problems = [
  {
    title: "$100K – $1M+",
    subtitle: "Lifecycle Cost",
    description:
      "Building, deploying, and retraining a single AI agent costs hundreds of thousands of dollars per cycle.",
  },
  {
    title: "6 – 18 Months",
    subtitle: "Time to Rebuild",
    description:
      "When agents degrade, teams spend months manually rebuilding — losing all institutional knowledge.",
  },
  {
    title: "Then Repeat",
    subtitle: "Infinite Loop",
    description:
      "No memory transfer. No lineage. Every new version starts from zero. The cycle never ends.",
  },
];

export function ProblemSection() {
  return (
    <section className="relative overflow-hidden border-t border-violet-500/10 bg-black py-32 text-white">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[900px] -translate-x-1/2 bg-violet-500/5 blur-[180px]" />

      <div className="mx-auto max-w-7xl px-8 lg:px-16">
        <div className="mx-auto mb-24 max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl font-black uppercase leading-[0.9] text-white sm:text-6xl lg:text-8xl">
              The AI Agent <br />
              <span className="text-violet-500 font-sniglet font-normal">Extinction</span> Crisis
            </h2>
            <p className="mx-auto mt-8 max-w-3xl text-lg font-normal leading-relaxed text-white/60 md:text-xl font-sniglet">
              Every AI agent deployed today is a disposable tool. No DNA, no
              reproduction, no selection. Every team rebuilds from scratch.
            </p>
          </motion.div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3 items-start">
          {problems.map((problem, i) => (
            <motion.div
              key={problem.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: i * 0.15, type: "spring", stiffness: 100 }}
              className={cn(
                "group relative h-full",
                i === 1 ? "lg:mt-16" : i === 2 ? "lg:mt-32" : ""
              )}
            >
              <div className="relative h-full overflow-hidden rounded-[14px] border border-white/[0.06] bg-gradient-to-b from-white/[0.03] to-transparent p-10 transition-all duration-500 hover:-translate-y-1 hover:border-violet-500/20 hover:shadow-[0_0_50px_rgba(139,92,246,0.08)]">
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-violet-500/[0.02] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                <div className="relative z-10">
                  <span className="text-[11px] font-normal uppercase tracking-[0.2em] text-violet-400/50 font-sniglet">
                    {problem.subtitle}
                  </span>
                  <h3 className="mt-2 text-4xl font-black uppercase leading-[1.1] tracking-tight text-white">
                    {problem.title}
                  </h3>

                  <div className="my-8 h-px w-12 bg-gradient-to-r from-violet-500/40 to-transparent" />

                  <p className="text-base leading-relaxed text-white/50 transition-colors duration-300 group-hover:text-white/70 font-sniglet font-normal">
                    {problem.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
