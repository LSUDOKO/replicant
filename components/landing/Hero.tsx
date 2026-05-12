"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ActionButton } from "@/components/ui/action-button";
import { GlassCard } from "@/components/ui/glass-card";
import { ArrowRight, BookOpen, Dna } from "lucide-react";

export function Hero() {
  return (
    <section className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden pt-16">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/4 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-accent-evolution/8 blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/3 h-[400px] w-[400px] rounded-full bg-accent-success/8 blur-[100px]" />
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(6,182,212,0.45) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.45) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Top badge */}
          <div className="mx-auto mb-8 inline-flex items-center gap-2 rounded-full border border-border-bright bg-surface px-4 py-1.5">
            <Dna size={14} className="text-primary" />
            <span className="label-uppercase text-muted-foreground">
              Built on 0G
            </span>
          </div>

          {/* Title */}
          <h1 className="mx-auto max-w-4xl text-5xl font-bold leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl">
            <span className="text-gradient-cyan">AI Agents</span> that Evolve,
            Reproduce &amp; Improve{" "}
            <span className="text-gradient-violet">Themselves</span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            The first protocol where AI agents autonomously self-improve via sealed
            mutation in TEE, with on-chain lineage and decentralized safety alignment.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/dashboard">
              <ActionButton
                size="lg"
                className="px-8 text-base"
              >
                Launch App
                <ArrowRight size={18} className="ml-2" />
              </ActionButton>
            </Link>
            <Button
              variant="outline"
              size="lg"
              className="border-border-bright bg-surface/50 text-foreground hover:bg-surface px-8 text-base"
            >
              <BookOpen size={18} className="mr-2" />
              Read Docs
            </Button>
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          className="mt-20 grid grid-cols-2 gap-4 sm:grid-cols-4"
        >
          {[
            { value: "6", label: "Agent Species" },
            { value: "TEE", label: "Sealed Evolution" },
            { value: "< 1s", label: "Chain Finality" },
            { value: "Peta", label: "0G Storage Scale" },
          ].map((stat) => (
            <GlassCard
              key={stat.label}
              className="px-4 py-5"
            >
              <div className="text-2xl font-bold text-primary">{stat.value}</div>
              <div className="mt-1 label-uppercase text-muted-foreground">
                {stat.label}
              </div>
            </GlassCard>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
