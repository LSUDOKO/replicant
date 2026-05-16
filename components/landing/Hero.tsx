"use client";

import { motion, type Variants } from "framer-motion";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20,
    },
  },
};

export function Hero() {
  return (
    <section className="relative flex min-h-[100dvh] items-center overflow-hidden bg-black pt-20 text-white">
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        className="absolute inset-0 h-full w-full object-cover opacity-55"
      >
        <source src="/hero-bg.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-black/40" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_55%,rgba(139,92,246,0.22),transparent_42%)]" />
      <div className="relative z-10 mx-auto w-full max-w-[1400px] px-8 lg:px-16">
        <div className="grid grid-cols-1 items-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-4xl"
          >
            <motion.h1
              variants={itemVariants}
              className="max-w-4xl text-5xl font-black uppercase leading-[0.9] text-white md:text-7xl lg:text-8xl"
            >
              The Intelligence Exchange Built for Infinite, Secure{" "}
              <span className="relative inline-flex items-center">
                <img
                  src="/Scene-ezgif.com-crop.gif"
                  alt="Evolution"
                  className="inline-block h-[1.1em] w-auto translate-y-[0.08em] object-contain align-text-bottom"
                />
              </span>
              .<br />
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="mt-8 max-w-2xl text-lg font-medium leading-relaxed text-white/85 md:text-xl"
            >Replicant transforms static AI into self-improving digital organisms. Agents evolve inside sealed 0G enclaves, preserving their memory, lineage, and proprietary strategy forever.
            </motion.p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
