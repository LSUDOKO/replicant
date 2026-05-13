"use client";

import { use, useEffect, useState } from "react";
import { useAccount, useReadContract } from "wagmi";
import { formatEther, type Address, type Hash } from "viem";
import { Loader2, ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { SpeciesIcon } from "@/components/shared/SpeciesIcon";
import { ExplorerLinkWrapper } from "@/components/shared/ExplorerLink";
import { SPECIES_INFO } from "@/lib/constants";
import { replicantAgentNftAbi, agentIdContractAddresses } from "@/lib/contracts/erc7857-agent-id";
import { replicantMarketplaceAbi, marketplaceContractAddresses } from "@/lib/contracts/marketplace";
import { publicEnv } from "@/lib/env";

const SPECIES_MAP: string[] = ["alpha-hunter", "code-weaver", "game-master", "docu-mind", "oracle-keeper", "social-synth"];
const STATUS_MAP: string[] = ["active", "archived", "slashed", "evolving"];

export default function AgentDetailPage({ params }: { params: Promise<{ agentId: string }> }) {
  const { agentId } = use(params);
  const id = BigInt(agentId);
  const { address, isConnected } = useAccount();
  const [agentData, setAgentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const nftAddr = agentIdContractAddresses[publicEnv.network] as Address | undefined;
  const marketAddr = marketplaceContractAddresses[publicEnv.network] as Address | undefined;

  const { data: metadata } = useReadContract({
    address: nftAddr, abi: replicantAgentNftAbi,
    functionName: "getAgentMetadata", args: [id],
    query: { enabled: !!nftAddr },
  });

  const { data: owner } = useReadContract({
    address: nftAddr, abi: replicantAgentNftAbi,
    functionName: "ownerOf", args: [id],
    query: { enabled: !!nftAddr },
  });

  const { data: creator } = useReadContract({
    address: nftAddr, abi: replicantAgentNftAbi,
    functionName: "creatorOf", args: [id],
    query: { enabled: !!nftAddr },
  });

  const { data: lineage } = useReadContract({
    address: nftAddr, abi: replicantAgentNftAbi,
    functionName: "getLineage", args: [id],
    query: { enabled: !!nftAddr },
  });

  const { data: children } = useReadContract({
    address: nftAddr, abi: replicantAgentNftAbi,
    functionName: "getChildren", args: [id],
    query: { enabled: !!nftAddr },
  });

  const { data: listing } = useReadContract({
    address: marketAddr, abi: replicantMarketplaceAbi,
    functionName: "listings", args: [id],
    query: { enabled: !!marketAddr },
  });

  useEffect(() => {
    if (metadata && owner) {
      const m = metadata as any;
      setAgentData({
        speciesType: Number(m.speciesType),
        generation: Number(m.generation),
        status: STATUS_MAP[Number(m.status)] ?? "active",
        parentId: Number(m.parentId),
        fitnessScore: Number(m.fitnessScore),
        stake: formatEther(m.stake),
        storageRootHash: m.storageRootHash,
        teeAttestationHash: m.teeAttestationHash,
        alignmentVerdictHash: m.alignmentVerdictHash,
        owner: owner as Address,
        creator: (creator ?? owner) as Address,
        lineage: (lineage as bigint[] ?? []).map(Number),
        children: (children as bigint[] ?? []).map(Number),
        listing: listing ? {
          seller: (listing as any)[0] as Address,
          price: formatEther((listing as any)[1] as bigint),
          active: (listing as any)[2] as boolean,
        } : null,
        name: `${SPECIES_MAP[Number(m.speciesType)] ?? "unknown"} #${agentId}`,
      });
      setLoading(false);
    }
  }, [metadata, owner, creator, lineage, children, listing, agentId]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 size={28} className="animate-spin text-muted-foreground/50" />
      </div>
    );
  }

  if (!agentData) {
    return (
      <div className="space-y-6">
        <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft size={14} /> Back
        </Link>
        <p className="text-center text-muted-foreground">Agent not found</p>
      </div>
    );
  }

  const species = SPECIES_INFO[SPECIES_MAP[agentData.speciesType] as keyof typeof SPECIES_INFO];

  return (
    <div className="space-y-6">
      <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft size={14} /> Dashboard
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Identity Card */}
        <GlassCard className="p-6 lg:col-span-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-border-bright bg-surface">
                <SpeciesIcon species={SPECIES_MAP[agentData.speciesType] as any} size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">{agentData.name}</h1>
                <div className="mt-1 flex items-center gap-2">
                  <StatusBadge status={agentData.status} />
                  <span className="text-xs text-muted-foreground">Gen-{agentData.generation}</span>
                </div>
              </div>
            </div>
          </div>

          {species && (
            <p className="mt-4 text-sm text-muted-foreground">{species.description}</p>
          )}

          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-border bg-surface/50 p-3 text-center">
              <p className="label-uppercase text-muted-foreground">Fitness</p>
              <p className="mt-1 text-xl font-bold text-primary">{agentData.fitnessScore}%</p>
            </div>
            <div className="rounded-xl border border-border bg-surface/50 p-3 text-center">
              <p className="label-uppercase text-muted-foreground">Generation</p>
              <p className="mt-1 text-xl font-bold">{agentData.generation}</p>
            </div>
            <div className="rounded-xl border border-border bg-surface/50 p-3 text-center">
              <p className="label-uppercase text-muted-foreground">Stake</p>
              <p className="mt-1 text-xl font-bold">{agentData.stake} 0G</p>
            </div>
            <div className="rounded-xl border border-border bg-surface/50 p-3 text-center">
              <p className="label-uppercase text-muted-foreground">Status</p>
              <StatusBadge status={agentData.status} />
            </div>
          </div>
        </GlassCard>

        {/* Owner / Creator */}
        <GlassCard className="space-y-4 p-6">
          <div>
            <p className="label-uppercase text-muted-foreground">Owner</p>
            <ExplorerLinkWrapper value={agentData.owner} type="address" className="mt-1" />
            {isConnected && address?.toLowerCase() === agentData.owner.toLowerCase() && (
              <span className="ml-2 text-[10px] text-primary">(you)</span>
            )}
          </div>
          <div>
            <p className="label-uppercase text-muted-foreground">Creator</p>
            <ExplorerLinkWrapper value={agentData.creator} type="address" className="mt-1" />
          </div>
          {agentData.listing?.active && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
              <p className="label-uppercase text-primary">Listed for sale</p>
              <p className="mt-1 text-lg font-bold">{agentData.listing.price} 0G</p>
            </div>
          )}
          <div className="flex gap-2">
            <ExplorerLinkWrapper value={agentId} type="address" className="text-xs">
              View on 0G <ExternalLink size={10} className="inline" />
            </ExplorerLinkWrapper>
          </div>
        </GlassCard>
      </div>

      {/* On-Chain Data */}
      <GlassCard className="p-6">
        <h2 className="text-base font-medium">On-Chain Data</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-surface/40 p-3">
            <p className="label-uppercase text-muted-foreground">Agent ID</p>
            <p className="mt-1 font-mono text-xs">{agentId}</p>
          </div>
          <div className="rounded-xl border border-border bg-surface/40 p-3">
            <p className="label-uppercase text-muted-foreground">Storage Root</p>
            <ExplorerLinkWrapper value={agentData.storageRootHash || agentData.storageRootHash} type="storage" className="mt-1" />
          </div>
          <div className="rounded-xl border border-border bg-surface/40 p-3">
            <p className="label-uppercase text-muted-foreground">TEE Attestation</p>
            <p className="mt-1 font-mono text-xs text-muted-foreground">{agentData.teeAttestationHash?.slice(0, 42) ?? "—"}</p>
          </div>
          <div className="rounded-xl border border-border bg-surface/40 p-3">
            <p className="label-uppercase text-muted-foreground">Alignment Verdict</p>
            <p className="mt-1 font-mono text-xs text-muted-foreground">{agentData.alignmentVerdictHash?.slice(0, 42) ?? "—"}</p>
          </div>
        </div>
      </GlassCard>

      {/* Lineage */}
      <GlassCard className="p-6">
        <h2 className="text-base font-medium">Lineage</h2>
        <div className="mt-4 grid gap-6 sm:grid-cols-2">
          <div>
            <p className="label-uppercase text-muted-foreground">Ancestors ({agentData.lineage.length})</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {agentData.lineage.length === 0 ? (
                <span className="text-xs text-muted-foreground/60">Genesis agent (no ancestors)</span>
              ) : (
                agentData.lineage.map((a: number) => (
                  <Link key={a} href={`/dashboard/agents/${a}`}
                    className="rounded-full border border-border bg-surface/50 px-3 py-1 text-xs hover:border-accent-evolution/50"
                  >
                    #{a}
                  </Link>
                ))
              )}
            </div>
          </div>
          <div>
            <p className="label-uppercase text-muted-foreground">Children ({agentData.children.length})</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {agentData.children.length === 0 ? (
                <span className="text-xs text-muted-foreground/60">No children evolved yet</span>
              ) : (
                agentData.children.map((c: number) => (
                  <Link key={c} href={`/dashboard/agents/${c}`}
                    className="rounded-full border border-border bg-surface/50 px-3 py-1 text-xs hover:border-accent-evolution/50"
                  >
                    #{c}
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}