"use client";

import { motion, type Variants } from "framer-motion";
import { SPECIES_INFO } from "@/lib/constants";
import type { AgentSpecies } from "@/types";

const speciesOrder: AgentSpecies[] = [
  "alpha-hunter",
  "code-weaver",
  "game-master",
  "docu-mind",
  "oracle-keeper",
  "social-synth",
];

const speciesImages: Record<AgentSpecies, string> = {
  "alpha-hunter": "/species/alpha-hunter.jpg",
  "code-weaver": "/species/code-weaver.png",
  "game-master": "/species/game-master.webp",
  "docu-mind": "/species/docu-mind.webp",
  "oracle-keeper": "/species/oracle-keeper.png",
  "social-synth": "/species/social-synth.webp",
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 20 },
  },
};

export function SpeciesGrid() {
  return (
    <section className="relative overflow-hidden border-t border-violet-500/10 bg-black py-32 text-white">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[620px] w-[1100px] -translate-x-1/2 -translate-y-1/2 bg-violet-500/10 blur-[160px]" />

      <div className="mx-auto max-w-7xl px-8 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mx-auto mb-20 max-w-5xl text-center"
        >
          <h2 className="text-5xl font-black uppercase leading-[0.9] text-white sm:text-6xl lg:text-8xl">
            Six Specialized <br />
            <span className="text-violet-500 font-sniglet font-normal">Species</span>
          </h2>

          <p className="mx-auto mt-8 max-w-3xl text-lg font-normal leading-relaxed text-white/60 md:text-xl font-sniglet">
            Each species targets a unique domain, improving autonomously via the 0G Compute TEE evolution engine.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
        >
          {speciesOrder.map((speciesId) => {
            const species = SPECIES_INFO[speciesId];

            return (
              <motion.article
                key={speciesId}
                variants={itemVariants}
                className="group relative"
              >
                <div className="relative h-full overflow-hidden rounded-[20px] border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-transparent transition-all duration-500 hover:-translate-y-2 hover:border-violet-500/30 hover:shadow-[0_0_80px_rgba(139,92,246,0.15)]">
                  <div
                    className="h-[220px] bg-cover bg-center relative overflow-hidden"
                    style={{ 
                      backgroundImage: `url(${speciesImages[speciesId]})`,
                      backgroundPosition: 'center center',
                      backgroundSize: 'cover'
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/90" />
                  </div>
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-violet-500/[0.02] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                  <div className="relative z-10 -mt-12 rounded-[20px] bg-black/95 backdrop-blur-sm px-7 pb-7 pt-6 mx-4 border border-white/[0.06]">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <h3 className="text-[28px] font-black uppercase leading-[1.1] tracking-tight text-white">
                        {species.name}
                      </h3>
                      <div className="shrink-0 rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 py-1.5 text-[10px] font-normal uppercase tracking-[0.18em] text-violet-400/60 font-sniglet">
                        {species.domain}
                      </div>
                    </div>

                    <div className="h-px w-10 bg-gradient-to-r from-violet-500/40 to-transparent mb-5" />

                    <p className="text-[13px] leading-relaxed text-white/50 transition-colors duration-300 group-hover:text-white/70 font-sniglet font-normal min-h-[60px]">
                      {species.description}
                    </p>

                    <div className="mt-8 flex items-center justify-between border-t border-white/[0.06] pt-5">
                      <span className="text-[10px] font-normal tracking-[0.2em] uppercase text-violet-400/50 font-sniglet">
                        Active Enclave
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 font-mono">
                        Gen-0
                      </span>
                    </div>
                  </div>

                  <div className="pointer-events-none absolute bottom-0 left-1/2 h-px w-0 -translate-x-1/2 bg-gradient-to-r from-transparent via-violet-500/40 to-transparent transition-all delay-150 duration-700 group-hover:w-3/4" />
                </div>
              </motion.article>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
