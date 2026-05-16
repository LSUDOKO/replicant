"use client";

import { motion } from "framer-motion";
import { OG_COMPONENTS } from "@/lib/constants";

const icons = [
  "M4 7V4h16v3M9 20h6M12 4v16M4 11l8 3 8-3",
  "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7M3 7a2 2 0 012-2h14a2 2 0 012 2M3 7l8 3 8-3",
  "M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8M9 12h6",
  "M12 2a10 10 0 1010 10A10 10 0 0012 2zm0 6a4 4 0 11-4 4 4 4 0 014-4zm0 14a14 14 0 0014-14",
  "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM12 8v4M12 16h0",
  "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
];

export function IntegrationMap() {
  return (
    <section className="relative overflow-hidden border-t border-violet-500/10 bg-black py-32 text-white">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[900px] -translate-x-1/2 bg-violet-500/5 blur-[180px]" />

      <div className="mx-auto max-w-7xl px-8 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mx-auto mb-20 max-w-5xl text-center"
        >
          {/* <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-violet-500/20 bg-violet-500/10 px-5 py-2 text-xs font-normal uppercase tracking-[0.2em] text-violet-400 font-sniglet">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 7V4h16v3" />
              <path d="M9 20h6" />
              <path d="M12 4v16" />
            </svg>
            0G Integration
          </div> */}
          <h2 className="text-5xl font-black uppercase leading-[0.9] text-white sm:text-6xl lg:text-7xl">
            Powered by the Full <br />
            <span className="text-violet-500 font-sniglet font-normal">0G Stack</span>
          </h2>
          <p className="mx-auto mt-8 max-w-4xl text-lg font-normal leading-relaxed text-white/60 md:text-xl font-sniglet">
            Only 0G provides TEE sealed inference, AI Alignment Nodes, Agent ID
            (ERC-7857), petabyte storage, and sub-second finality &mdash; in one
            unified stack.
          </p>
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {OG_COMPONENTS.map((comp, i) => (
            <motion.div
              key={comp.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group relative"
            >
              <div className="relative h-full overflow-hidden rounded-[14px] border border-white/[0.06] bg-gradient-to-b from-white/[0.03] to-transparent p-7 transition-all duration-500 hover:-translate-y-1 hover:border-violet-500/20 hover:shadow-[0_0_50px_rgba(139,92,246,0.08)]">
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-violet-500/[0.02] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                <div className="relative z-10">
                  <div className="flex items-start gap-4">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-[10px] border border-white/[0.06] bg-white/[0.03] text-violet-400 transition-all duration-500 group-hover:border-violet-500/30 group-hover:bg-violet-500/10">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d={icons[i]} />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-black uppercase tracking-tight text-white">
                        {comp.name}
                      </h3>
                      <span className="mt-0.5 block text-[11px] font-normal uppercase tracking-[0.15em] text-violet-400/60 font-sniglet">
                        {comp.feature}
                      </span>
                    </div>
                  </div>

                  <p className="mt-5 text-sm leading-relaxed text-white/40 transition-colors duration-300 group-hover:text-white/60 font-sniglet font-normal">
                    {comp.description}
                  </p>
                </div>

                <div className="pointer-events-none absolute bottom-0 left-1/2 h-px w-0 -translate-x-1/2 bg-gradient-to-r from-transparent via-violet-500/30 to-transparent transition-all delay-150 duration-700 group-hover:w-3/4" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
