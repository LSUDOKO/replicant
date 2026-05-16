"use client";

import { motion, type Variants } from "framer-motion";
import { TreeStructure, Pulse, Robot, Swap } from "@phosphor-icons/react";

const steps = [
  {
    icon: TreeStructure,
    phase: "Phase 01",
    title: "Genesis",
    subtitle: "Encrypted agent birth",
    description:
      "Deploy your agent species. Configuration encrypted and uploaded to 0G Storage. Gen-0 Agent ID minted on-chain.",
    detail: "Configuration, identity, and first-generation state are sealed before the agent enters the network.",
  },
  {
    icon: Pulse,
    phase: "Phase 02",
    title: "Life",
    subtitle: "Runtime performance loop",
    description:
      "Agent performs its task. Performance metrics logged to 0G Storage KV layer. Users subscribe to outputs.",
    detail: "Every useful output becomes measurable signal for fitness, alignment, and subscription demand.",
  },
  {
    icon: Robot,
    phase: "Phase 03",
    title: "Evolution",
    subtitle: "TEE mutation chamber",
    description:
      "Performance drops? Agent enters TEE Evolution Chamber. 50 mutations tested. Best child minted. Memory transferred.",
    detail: "Mutation happens privately while lineage stays verifiable, so strategy improves without exposure.",
  },
  {
    icon: Swap,
    phase: "Phase 04",
    title: "Commerce",
    subtitle: "Sealed marketplace handoff",
    description:
      "Child agent listed on marketplace. Sealed handover — strategy never exposed. Royalties flow to original creator.",
    detail: "Creators keep upside from descendants while buyers receive usable agents without seeing private strategy.",
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const stepVariants: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20,
    },
  },
};

export function HowItWorks() {
  return (
    <section className="relative overflow-hidden border-t border-violet-500/20 bg-black py-32 text-white">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[620px] w-[1100px] -translate-x-1/2 -translate-y-1/2 bg-violet-500/10 blur-[160px]" />

      <div className="mx-auto max-w-7xl px-8 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mx-auto mb-20 max-w-4xl text-center"
        >
          <h2 className="text-5xl font-black uppercase leading-[0.95] text-white sm:text-6xl lg:text-7xl">
            From Genesis <br />
            <span className="text-violet-500">to Commerce</span>
          </h2>
          <p className="mx-auto mt-8 max-w-2xl text-lg font-medium leading-relaxed text-white/80 md:text-xl">
            Four phases of autonomous agent evolution, fully on-chain, fully sealed, and fully safe.
          </p>
        </motion.div>

        <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid gap-8 md:grid-cols-2 xl:grid-cols-4"
        >
          {steps.map((step, i) => (
            <motion.article
              key={step.title}
              variants={stepVariants}
              className="group relative flex min-h-[460px] overflow-hidden rounded-[10px] border border-violet-500/35 bg-black text-center shadow-[0_22px_70px_rgba(139,92,246,0.18)] transition duration-300 hover:-translate-y-1 hover:border-violet-400"
            >
              <div
                className="absolute inset-0 bg-cover bg-center opacity-80 transition duration-300 group-hover:opacity-95"
                style={{ backgroundImage: "url('/replicant-logo.jpeg')" }}
              />
              <div className="absolute inset-0 bg-black/55 transition duration-300 group-hover:bg-black/30" />

              <div className="relative flex w-full flex-col justify-end">
                <div className="flex min-h-[210px] items-center justify-center px-6 opacity-0 transition duration-300 group-hover:opacity-100 md:-translate-y-8 md:group-hover:translate-y-0">
                  <div className="inline-flex items-center gap-3 rounded-full border-2 border-white px-5 py-3 text-sm font-black uppercase text-white">
                    <step.icon size={22} weight="duotone" />
                    {step.phase}
                  </div>
                </div>

                <div className="relative translate-y-0 bg-black p-6 transition duration-300 md:translate-y-32 md:group-hover:translate-y-0">
                  <p className="mb-3 text-[11px] font-black uppercase tracking-[0.2em] text-violet-400">
                    {step.phase}
                  </p>
                  <h3 className="relative mb-3 pb-4 text-3xl font-black uppercase text-white after:absolute after:bottom-0 after:left-1/2 after:h-[3px] after:w-12 after:-translate-x-1/2 after:bg-violet-500">
                    {step.title}
                  </h3>
                  <p className="text-sm font-bold uppercase text-white/75">
                    {step.subtitle}
                  </p>
                  <p className="mt-5 text-sm leading-relaxed text-white/80">
                    {step.description}
                  </p>

                  <div className="mt-5 grid gap-3 opacity-100 transition duration-300 md:opacity-0 md:group-hover:opacity-100">
                    <div className="rounded-[10px] border border-violet-500/30 bg-violet-500/15 p-4 text-sm font-bold text-white">
                      0{i + 1}
                    </div>
                    <p className="text-xs leading-relaxed text-white/70">
                      {step.detail}
                    </p>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
