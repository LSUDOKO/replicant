"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { formatEther } from "viem";
import { ExternalLink, Shield, Zap, Lock, Globe, CheckCircle, Bot } from "lucide-react";
import { useTotalSupply, useAgents } from "@/lib/queries/agents";
import { SpeciesIcon } from "@/components/shared/SpeciesIcon";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { SPECIES_INFO } from "@/lib/constants";
import { publicEnv } from "@/lib/env";
import type { AgentSpecies } from "@/types";

// ─── Static content ───────────────────────────────────────────────────────────

const features = [
  { icon: Shield, title: "Privacy-Preserving Metadata", description: "Sensitive AI intelligence is AES-256 encrypted end-to-end. Proprietary models stay private throughout every transfer." },
  { icon: Lock, title: "Secure Metadata Transfers", description: "Ownership AND encrypted metadata transfer together via TEE oracle. New owners receive fully functional agents — nothing lost." },
  { icon: Zap, title: "Dynamic Data Management", description: "Agent state and behaviors evolve over time. Secure on-chain updates keep intelligence current within the NFT framework." },
  { icon: Globe, title: "Decentralized Storage", description: "0G Storage provides permanent, tamper-proof metadata hosting with no single point of failure." },
  { icon: CheckCircle, title: "Verifiable Ownership", description: "Cryptographic proofs validate every transfer. Oracle-based verification ensures transparent, trustless ownership control." },
  { icon: Bot, title: "AI-Specific Functionality", description: "Built-in agent lifecycle management, pre-execution ownership verification, and specialized AI use-case features." },
];

const transferSteps = [
  { step: "01", label: "Encrypt & Commit", desc: "Agent genome AES-256 encrypted and committed to 0G Storage with owner's public key." },
  { step: "02", label: "Oracle Processing", desc: "TEE oracle receives the transfer request and verifies ownership on-chain." },
  { step: "03", label: "Re-encrypt for Receiver", desc: "Inside the secure enclave, metadata is re-encrypted for the new owner." },
  { step: "04", label: "Secure Key Delivery", desc: "New sealed key delivered to receiver — no intermediary ever sees plaintext." },
  { step: "05", label: "Verify & Finalize", desc: "Smart contract validates the attestation proof and updates ownership." },
  { step: "06", label: "Access Granted", desc: "New owner can decrypt and run the agent. Transfer complete." },
];

const infra = [
  { component: "0G Storage", role: "Encrypted metadata storage", benefit: "Secure, permanent, owner-only access" },
  { component: "0G DA", role: "Transfer proof verification", benefit: "Guaranteed metadata availability" },
  { component: "0G Chain", role: "Smart contract execution", benefit: "Fast, low-cost INFT operations" },
  { component: "0G Compute", role: "Secure AI inference", benefit: "Private agent execution in TEE" },
];

const ACCENT: Record<string, string> = {
  "alpha-hunter": "#00D4FF",
  "code-weaver": "#8B5CF6",
  "game-master": "#D946EF",
  "docu-mind": "#F59E0B",
  "oracle-keeper": "#10B981",
  "social-synth": "#F97316",
};

// ─── Live INFT card ───────────────────────────────────────────────────────────

function LiveINFTCard({ agent }: { agent: { id: string; species: AgentSpecies; generation: number; status: string; fitnessScore: number; stake: number; owner: string } }) {
  const accent = ACCENT[agent.species] ?? "#8B5CF6";
  const speciesInfo = SPECIES_INFO[agent.species];
  const speciesLabel = agent.species.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");

  // Custom cubic-bezier for physical weight feel
  const transition = { duration: 0.7, ease: [0.32, 0.72, 0, 1] as [number, number, number, number] };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true }}
      transition={transition}
      className="group relative"
    >
      {/* Outer Shell (Double-Bezel) */}
      <div className="p-[1px] rounded-[2.5rem] bg-gradient-to-b from-white/15 to-white/5 border border-white/5 transition-colors duration-500 group-hover:from-white/20 group-hover:to-white/10">
        
        {/* Inner Core */}
        <div className="relative overflow-hidden rounded-[calc(2.5rem-1px)] bg-[#09090B] p-7 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
          
          {/* Hardware ID Line */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accent }} />
              <span className="text-[10px] font-mono tracking-widest text-white/30 uppercase">
                Protocol.INFT // 0x{agent.id.padStart(4, '0')}
              </span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-white/5 bg-white/[0.03] px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white/40">
              ERC-7857
            </div>
          </div>

          {/* Header Section */}
          <div className="flex items-start gap-5 mb-8">
            <div className="relative shrink-0">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.02] transition-transform duration-700 group-hover:scale-105 group-hover:rotate-3">
                <SpeciesIcon species={agent.species} size={24} className="opacity-80" />
              </div>
              <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-black border border-white/10 flex items-center justify-center">
                <div className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: accent }} />
              </div>
            </div>
            <div className="pt-1">
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30 mb-1" style={{ color: `${accent}40` }}>
                {speciesInfo?.domain ?? "Autonomous System"}
              </p>
              <h4 className="text-xl font-black uppercase tracking-tight text-white leading-none">
                {speciesLabel}
              </h4>
            </div>
          </div>

          {/* Technical Spec Grid */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 transition-colors duration-300 group-hover:bg-white/[0.04]">
              <p className="text-[9px] uppercase tracking-widest text-white/20 mb-2 font-medium">Generation</p>
              <p className="text-lg font-mono font-bold text-white leading-none tracking-tighter">
                G<span className="text-white/30">.</span>0{agent.generation}
              </p>
            </div>
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 transition-colors duration-300 group-hover:bg-white/[0.04]">
              <p className="text-[9px] uppercase tracking-widest text-white/20 mb-2 font-medium">Fitness</p>
              <div className="flex items-baseline gap-1">
                <p className="text-lg font-mono font-bold text-white leading-none tracking-tighter">
                  {agent.fitnessScore}
                </p>
                <span className="text-[10px] font-mono text-white/20">%</span>
              </div>
            </div>
            <div className="col-span-2 rounded-xl border border-white/5 bg-white/[0.02] p-4 transition-colors duration-300 group-hover:bg-white/[0.04]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-white/20 mb-2 font-medium">Locked Stake</p>
                  <p className="text-base font-mono font-bold text-white leading-none tracking-tighter">
                    {agent.stake.toFixed(3)} <span className="text-[10px] text-white/30">0G</span>
                  </p>
                </div>
                <div className="h-8 w-8 rounded-lg bg-white/[0.03] border border-white/5 flex items-center justify-center text-[10px] font-mono text-white/20">
                  REF
                </div>
              </div>
            </div>
          </div>

          {/* Description Block */}
          <div className="relative mb-8">
            <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-white/10 to-transparent" />
            <p className="pl-4 text-[13px] leading-relaxed text-white/40 font-sniglet line-clamp-3 italic italic-normal">
              {speciesInfo?.description}
            </p>
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-3 pt-6 border-t border-white/5">
            <div className="grow">
              <StatusBadge status={agent.status as "active" | "archived" | "slashed" | "evolving"} />
            </div>
            <Link
              href={`/dashboard/agents/${agent.id}`}
              className="flex h-10 items-center justify-center gap-2 rounded-full bg-white/[0.04] border border-white/10 px-5 text-[11px] font-bold uppercase tracking-widest text-white transition-all duration-300 hover:bg-white/10 hover:border-white/20 active:scale-[0.97]"
            >
              View Unit
              <ExternalLink size={10} className="text-white/40" />
            </Link>
          </div>

          {/* Protocol Fingerprint */}
          <div className="mt-4 flex items-center gap-2 border-t border-dashed border-white/5 pt-4 opacity-30 grayscale group-hover:grayscale-0 group-hover:opacity-50 transition-all duration-700">
            <div className="h-6 w-6 rounded bg-white/5 flex items-center justify-center font-mono text-[8px] text-white">
              S.R
            </div>
            <p className="text-[8px] font-mono tracking-tighter truncate">
              HASH: 0x{agent.owner.slice(2, 22)}...{agent.owner.slice(-8)}
            </p>
          </div>

        </div>
      </div>
    </motion.div>
  );
}

// ─── Skeleton card ────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="rounded-[16px] border border-white/[0.05] bg-white/[0.02] p-6 animate-pulse">
      <div className="flex items-center gap-4 mb-5">
        <div className="h-14 w-14 rounded-[14px] bg-white/[0.05]" />
        <div className="flex-1 space-y-2">
          <div className="h-2.5 w-16 rounded bg-white/[0.05]" />
          <div className="h-4 w-28 rounded bg-white/[0.05]" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-5">
        {[0, 1, 2].map((i) => <div key={i} className="h-14 rounded-[10px] bg-white/[0.04]" />)}
      </div>
      <div className="h-3 w-full rounded bg-white/[0.04] mb-2" />
      <div className="h-3 w-3/4 rounded bg-white/[0.04]" />
    </div>
  );
}

// ─── Live INFT showcase ───────────────────────────────────────────────────────

function LiveINFTShowcase() {
  const supplyResult = useTotalSupply();
  const totalSupply = Number(supplyResult.data ?? 0n);
  const { agents, isLoading } = useAgents(Math.min(totalSupply, 6));

  const hasContract = !!publicEnv.contracts.agentId;

  if (!hasContract) {
    return (
      <div className="rounded-[16px] border border-white/[0.06] bg-white/[0.02] p-10 text-center">
        <p className="text-sm text-white/30 font-sniglet">
          Connect a deployed contract to see live INFTs here.
        </p>
        <Link href="/dashboard/genesis" className="mt-4 inline-flex items-center gap-1.5 rounded-[10px] bg-violet-500/20 border border-violet-500/30 px-4 py-2 text-sm text-violet-400 hover:bg-violet-500/30 transition-colors">
          Mint the first INFT
        </Link>
      </div>
    );
  }

  if (isLoading || supplyResult.isLoading) {
    return (
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (agents.length === 0) {
    return (
      <div className="rounded-[16px] border border-white/[0.06] bg-white/[0.02] p-10 text-center">
        <p className="text-sm text-white/30 font-sniglet mb-4">
          No INFTs minted yet. Be the first.
        </p>
        <Link href="/dashboard/genesis" className="inline-flex items-center gap-1.5 rounded-[10px] bg-violet-500/20 border border-violet-500/30 px-4 py-2 text-sm text-violet-400 hover:bg-violet-500/30 transition-colors">
          Mint Genesis INFT
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {agents.slice(0, 6).map((agent) => (
        <LiveINFTCard key={agent.id} agent={agent} />
      ))}
    </div>
  );
}

// ─── Main section ─────────────────────────────────────────────────────────────

export function INFTSection() {
  return (
    <section className="relative overflow-hidden border-t border-violet-500/10 bg-black py-20 text-white">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[1000px] -translate-x-1/2 -translate-y-1/2 bg-violet-500/[0.05] blur-[150px]" />

      <div className="mx-auto max-w-7xl px-8 lg:px-16">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mx-auto mb-16 max-w-5xl text-center"
        >
          <span className="inline-block rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-1.5 text-[10px] font-medium uppercase tracking-[0.2em] text-violet-400 mb-6">
            ERC-7857 Standard
          </span>
          <h2 className="text-5xl font-black uppercase leading-[0.9] text-white sm:text-6xl lg:text-8xl">
            The INFT <br />
            <span className="text-violet-500 font-sniglet font-normal">Solution</span>
          </h2>
          <p className="mx-auto mt-8 max-w-3xl text-lg font-normal leading-relaxed text-white/60 md:text-xl font-sniglet">
            ERC-7857 is the first NFT standard built specifically for AI agents, enabling
            complete intelligence transfer on 0G Chain.
          </p>
        </motion.div>

        {/* ── Focused Value Prop ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative mb-20 overflow-hidden rounded-[20px] border border-white/[0.06] bg-gradient-to-br from-violet-500/[0.08] to-transparent p-10 text-center md:p-16"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_60%,rgba(139,92,246,0.15),transparent_60%)]" />
          <div className="relative z-10 mx-auto max-w-3xl">
            <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-violet-400/60 mb-4">Intelligence NFT</p>
            <h3 className="text-2xl font-black uppercase text-white leading-tight sm:text-3xl md:text-4xl">
              AI Agents as Transferable,<br className="hidden sm:block" /> Ownable Digital Assets
            </h3>
            <p className="mt-6 text-sm text-white/40 font-sniglet max-w-xl mx-auto">
              Securely transfer agent ownership and encrypted metadata together — 
              ensuring proprietary models stay private throughout the lifecycle.
            </p>
          </div>
        </motion.div>

        {/* ── Features grid ── */}
        <div className="mb-24">
          <motion.h3
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center text-3xl font-black uppercase text-white"
          >
            Revolutionary Features
          </motion.h3>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.6 }}
                  className="group relative overflow-hidden rounded-[14px] border border-white/[0.06] bg-gradient-to-b from-white/[0.03] to-transparent p-8 transition-all duration-500 hover:-translate-y-1 hover:border-violet-500/20 hover:shadow-[0_0_40px_rgba(139,92,246,0.08)]"
                >
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-violet-500/[0.03] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  <div className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-violet-500/20 bg-violet-500/10">
                    <Icon size={18} className="text-violet-400" />
                  </div>
                  <h4 className="mt-4 text-[16px] font-bold text-white">{f.title}</h4>
                  <p className="mt-3 text-sm leading-relaxed text-white/45 font-sniglet font-normal group-hover:text-white/65 transition-colors duration-300">
                    {f.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ── Live INFTs from chain ── */}
        <div className="mb-24">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 flex items-end justify-between gap-4"
          >
            <div>
              <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-violet-400/60">Live on 0G Chain</span>
              <h3 className="mt-2 text-3xl font-black uppercase text-white">Minted INFTs</h3>
              <p className="mt-2 text-sm text-white/40 font-sniglet font-normal max-w-xl">
                Real ERC-7857 agents minted on-chain. Each one is a fully transferable Intelligence NFT with encrypted genome stored on 0G Storage.
              </p>
            </div>
            <Link
              href="/dashboard/agents"
              className="shrink-0 inline-flex items-center gap-1.5 rounded-[10px] border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-[12px] text-white/50 hover:text-white hover:bg-white/[0.06] transition-all duration-200"
            >
              View all <ExternalLink size={11} />
            </Link>
          </motion.div>

          <LiveINFTShowcase />
        </div>

        {/* ── Transfer flow ── */}
        <div className="mb-24">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h3 className="text-3xl font-black uppercase text-white">How INFT Transfers Work</h3>
            <p className="mt-4 text-base text-white/50 font-sniglet font-normal max-w-2xl mx-auto">
              Both token ownership and encrypted metadata transfer securely together — no intermediary ever sees the plaintext.
            </p>
          </motion.div>

          <div className="relative">
            <div className="absolute left-[28px] top-8 bottom-8 w-px bg-gradient-to-b from-violet-500/40 via-violet-500/20 to-transparent hidden md:block" />
            <div className="grid gap-3">
              {transferSteps.map((s, i) => (
                <motion.div
                  key={s.step}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                  className="flex items-start gap-6 rounded-[12px] border border-white/[0.05] bg-white/[0.02] p-5 transition-all duration-300 hover:border-violet-500/15 hover:bg-white/[0.03]"
                >
                  <div className="shrink-0 flex h-10 w-10 items-center justify-center rounded-full border border-violet-500/30 bg-violet-500/10 text-[12px] font-bold text-violet-400 font-mono">
                    {s.step}
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-white">{s.label}</p>
                    <p className="mt-1 text-[13px] text-white/45 font-sniglet font-normal leading-relaxed">{s.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* ── 0G Infrastructure table ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="rounded-[20px] border border-white/[0.06] bg-white/[0.02] overflow-hidden"
        >
          <div className="border-b border-white/[0.06] px-8 py-6">
            <h3 className="text-xl font-bold text-white">Powered by 0G Infrastructure</h3>
            <p className="mt-1 text-sm text-white/45 font-sniglet font-normal">
              INFTs leverage the complete 0G ecosystem for optimal performance.
            </p>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {infra.map((row) => (
              <div key={row.component} className="grid grid-cols-3 gap-4 px-8 py-5 transition-colors hover:bg-white/[0.02]">
                <p className="text-[13px] font-semibold text-violet-400">{row.component}</p>
                <p className="text-[13px] text-white/60">{row.role}</p>
                <p className="text-[13px] text-white/40 font-sniglet font-normal">{row.benefit}</p>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  );
}
