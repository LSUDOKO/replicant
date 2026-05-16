"use client";

import { use, useState, useMemo } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { BaseError, formatEther, parseEther, type Address } from "viem";
import { 
  ArrowLeft, ExternalLink, ShoppingCart, Shield, Copy, Check, 
  Activity, TrendingUp, Zap, Database, Lock, Users, Clock
} from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { SpeciesIcon } from "@/components/shared/SpeciesIcon";
import { ExplorerLinkWrapper } from "@/components/shared/ExplorerLink";
import { TxStatusCard } from "@/components/shared/TxStatusCard";
import { INFTBadge } from "@/components/shared/INFTBadge";
import { INFTTransferPanel } from "@/components/shared/INFTTransferPanel";
import { SpeciesFeed } from "@/components/species/SpeciesFeed";
import { AlphaHunterFeed } from "@/components/alphahunter/AlphaHunterFeed";
import { CodeWeaverDashboard } from "@/components/codeweaver/CodeWeaverDashboard";
import { GameArena } from "@/components/gamemaster/GameArena";
import { AuditPanel } from "@/components/documind/AuditPanel";
import { OracleKeeperFeed } from "@/components/oraclekeeper/PriceFeed";
import { CreatorDashboard } from "@/components/socialsynth/CreatorDashboard";
import { SPECIES_INFO } from "@/lib/constants";
import { getSpeciesMetadata, SPECIES_IMAGES } from "@/lib/species/engine";
import { replicantAgentNftAbi, agentIdContractAddresses } from "@/lib/contracts/erc7857-agent-id";
import { replicantMarketplaceAbi, marketplaceContractAddresses } from "@/lib/contracts/marketplace";
import { publicEnv } from "@/lib/env";
import type { AgentSpecies } from "@/types";

const SPECIES_MAP: AgentSpecies[] = ["alpha-hunter", "code-weaver", "game-master", "docu-mind", "oracle-keeper", "social-synth"];
const STATUS_MAP = ["active", "archived", "slashed", "evolving"] as const;
const ACCENT: Record<string, string> = {
  "alpha-hunter": "#00D4FF", "code-weaver": "#8B5CF6", "game-master": "#D946EF",
  "docu-mind": "#F59E0B", "oracle-keeper": "#10B981", "social-synth": "#F97316",
};

function truncHash(h: string, pre = 6, suf = 4) {
  if (!h || h === "0x" + "0".repeat(64)) return null;
  return `${h.slice(0, pre + 2)}…${h.slice(-suf)}`;
}

function CopyHash({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const empty = !value || value === "0x" + "0".repeat(64);
  return (
    <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "14px 16px" }}>
      <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "6px" }}>{label}</p>
      <div className="flex items-center justify-between gap-2">
        <span style={{ fontFamily: "monospace", fontSize: "12px", color: empty ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.7)" }}>
          {empty ? "Not set" : truncHash(value)}
        </span>
        {!empty && (
          <button onClick={() => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
            style={{ color: "rgba(255,255,255,0.3)", cursor: "pointer" }}>
            {copied ? <Check size={12} style={{ color: "#00FF88" }} /> : <Copy size={12} />}
          </button>
        )}
      </div>
    </div>
  );
}

export default function AgentDetailPage({ params }: { params: Promise<{ agentId: string }> }) {
  const { agentId } = use(params);
  const id = BigInt(agentId);
  const { address, isConnected } = useAccount();

  const nftAddr = agentIdContractAddresses[publicEnv.network] as Address | undefined;
  const marketAddr = marketplaceContractAddresses[publicEnv.network] as Address | undefined;

  const [buyError, setBuyError] = useState<string | null>(null);
  const { data: buyHash, isPending: isBuyPending, writeContractAsync: buyWrite, reset: buyReset } = useWriteContract();
  const { isLoading: isBuyConfirming, isSuccess: isBuyConfirmed } = useWaitForTransactionReceipt({ hash: buyHash });

  const buyTxStatus = isBuyPending ? "signing" : isBuyConfirming ? "pending" : isBuyConfirmed ? "confirmed" : buyError ? "failed" : null;

  async function handleBuy() {
    if (!marketAddr || !agentData?.listing?.price) return;
    setBuyError(null);
    buyReset();
    try {
      await buyWrite({
        address: marketAddr,
        abi: replicantMarketplaceAbi,
        functionName: "buy",
        args: [id],
        value: parseEther(agentData.listing.price),
      });
    } catch (err) {
      setBuyError(err instanceof BaseError ? err.shortMessage : err instanceof Error ? err.message : "Buy failed");
    }
  }

  const meta = useReadContract({ address: nftAddr, abi: replicantAgentNftAbi, functionName: "getAgentMetadata", args: [id], query: { enabled: !!nftAddr } });
  const ownerQuery = useReadContract({ address: nftAddr, abi: replicantAgentNftAbi, functionName: "ownerOf", args: [id], query: { enabled: !!nftAddr } });
  const creatorQuery = useReadContract({ address: nftAddr, abi: replicantAgentNftAbi, functionName: "creatorOf", args: [id], query: { enabled: !!nftAddr } });
  const lineageQuery = useReadContract({ address: nftAddr, abi: replicantAgentNftAbi, functionName: "getLineage", args: [id], query: { enabled: !!nftAddr } });
  const childrenQuery = useReadContract({ address: nftAddr, abi: replicantAgentNftAbi, functionName: "getChildren", args: [id], query: { enabled: !!nftAddr } });
  const listingQuery = useReadContract({ address: marketAddr, abi: replicantMarketplaceAbi, functionName: "listings", args: [id], query: { enabled: !!marketAddr } });

  const agentData = useMemo(() => {
    const m = meta.data as [number, number, number, bigint, bigint, bigint, string, string, string] | undefined;
    const owner = ownerQuery.data as Address | undefined;
    if (!m || !owner) return null;
    const l = listingQuery.data as readonly [Address, bigint, boolean] | undefined;
    return {
      speciesType: Number(m[0]),
      generation: Number(m[1]),
      status: STATUS_MAP[Number(m[2])] ?? "active",
      fitnessScore: Number(m[4]),
      stake: formatEther(m[5] as bigint),
      storageRootHash: m[6] as string,
      teeAttestationHash: m[7] as string,
      alignmentVerdictHash: m[8] as string,
      owner,
      creator: (creatorQuery.data ?? owner) as Address,
      lineage: ((lineageQuery.data as bigint[]) ?? []).map(Number),
      children: ((childrenQuery.data as bigint[]) ?? []).map(Number),
      listing: l && l[2] ? { seller: l[0], price: formatEther(l[1]), active: l[2] } : null,
    };
  }, [meta.data, ownerQuery.data, creatorQuery.data, lineageQuery.data, childrenQuery.data, listingQuery.data]);

  const isLoading = !!(nftAddr && (meta.isLoading || ownerQuery.isLoading));
  const isError = meta.isError || ownerQuery.isError;
  const speciesKey = SPECIES_MAP[agentData?.speciesType ?? 0] ?? "alpha-hunter";
  const accent = ACCENT[speciesKey] ?? "#8B5CF6";
  const speciesInfo = SPECIES_INFO[speciesKey as keyof typeof SPECIES_INFO];
  const isOwner = isConnected && address?.toLowerCase() === agentData?.owner?.toLowerCase();
  const speciesLabel = speciesKey.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");

  if (isLoading || (!agentData && !isError)) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "50vh" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "50%", border: "2px solid rgba(139,92,246,0.3)", borderTopColor: "#8B5CF6", animation: "spin 1s linear infinite", margin: "0 auto 12px" }} />
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>Loading agent…</p>
        </div>
      </div>
    );
  }

  if (isError || !agentData) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "50vh", gap: "12px" }}>
        <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)" }}>Could not load agent — RPC unreachable or token does not exist.</p>
        <Link href="/dashboard" style={{ fontSize: "13px", color: "#8B5CF6" }}>← Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <Link href="/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>
        <ArrowLeft size={14} /> Dashboard
      </Link>

      <div style={{ display: "grid", gridTemplateColumns: "35% 1fr", gap: "20px", alignItems: "start" }}>

        {/* LEFT: Identity & Heritage */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* Agent header with species image */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${accent}30`, borderRadius: "20px", overflow: "hidden", position: "relative" }}>
            {/* Species image header */}
            <div style={{ position: "relative", height: "180px", overflow: "hidden" }}>
              <img 
                src={SPECIES_IMAGES[speciesKey as AgentSpecies]} 
                alt={speciesLabel}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              {/* Gradient overlay for text readability */}
              <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.9) 100%)` }} />
              
              {/* Status badge overlay */}
              <div style={{ position: "absolute", top: "12px", right: "12px", display: "flex", gap: "8px" }}>
                <StatusBadge status={agentData.status as "active" | "archived" | "slashed" | "evolving"} />
                <span style={{ fontSize: "11px", color: accent, background: `${accent}15`, backdropFilter: "blur(8px)", border: `1px solid ${accent}30`, borderRadius: "6px", padding: "4px 10px", fontFamily: "monospace", fontWeight: 600 }}>GEN-{agentData.generation}</span>
              </div>
              
              {/* Agent info overlay at bottom */}
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "16px 20px", backdropFilter: "blur(8px)" }}>
                <h1 style={{ fontSize: "22px", fontWeight: 700, color: "white", marginBottom: "4px", textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
                  {speciesLabel} #{agentId}
                </h1>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)", textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>
                  {speciesInfo?.domain}
                </p>
              </div>
            </div>
            
            {/* Description section */}
            <div style={{ padding: "20px" }}>
              {speciesInfo && <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>{(speciesInfo as { description?: string }).description}</p>}
            </div>
          </div>

          {/* Vitals grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            {([
              { label: "Fitness", value: `${agentData.fitnessScore}%`, color: accent },
              { label: "Generation", value: String(agentData.generation), color: "white" },
              { label: "Stake", value: `${parseFloat(agentData.stake).toFixed(3)} 0G`, color: "white" },
              { label: "Status", value: agentData.status.toUpperCase(), color: agentData.status === "active" ? "#00FF88" : agentData.status === "slashed" ? "#FF3366" : "#FFB800" },
            ] as { label: string; value: string; color: string }[]).map(({ label, value, color }) => (
              <div key={label} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "14px", textAlign: "center" }}>
                <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "6px" }}>{label}</p>
                <p style={{ fontSize: "18px", fontWeight: 700, color, fontFamily: "monospace" }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Owner / Creator */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", padding: "18px", display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "6px" }}>Owner</p>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <ExplorerLinkWrapper value={agentData.owner} type="address" />
                {isOwner && <span style={{ fontSize: "10px", color: accent, background: `${accent}15`, padding: "1px 6px", borderRadius: "4px" }}>you</span>}
              </div>
            </div>
            <div>
              <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "6px" }}>Creator</p>
              <ExplorerLinkWrapper value={agentData.creator} type="address" />
            </div>
            <a href={`https://chainscan-galileo.0g.ai/token/${nftAddr}?a=${agentId}`} target="_blank" rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "12px", color: accent }}>
              <ExternalLink size={12} /> View on 0G Chain
            </a>
          </div>

          {/* Buy panel */}
          {agentData.listing?.active && (
            <div style={{ background: `${accent}08`, border: `1px solid ${accent}25`, borderRadius: "16px", padding: "18px" }}>
              <p style={{ fontSize: "10px", color: accent, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "8px" }}>Listed for Sale</p>
              <p style={{ fontSize: "22px", fontWeight: 700, color: "white", marginBottom: "12px" }}>{agentData.listing.price} 0G</p>
              <button onClick={handleBuy} disabled={!isConnected || !marketAddr || isBuyPending || isBuyConfirming || isBuyConfirmed}
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", background: accent, color: "#000", borderRadius: "10px", padding: "10px", fontSize: "13px", fontWeight: 600, cursor: "pointer", opacity: (!isConnected || isBuyPending || isBuyConfirming) ? 0.6 : 1 }}>
                <ShoppingCart size={14} />
                {isBuyConfirmed ? "Purchased" : isBuyPending || isBuyConfirming ? "Processing…" : "Buy Now"}
              </button>
              {buyHash && <div style={{ marginTop: "8px" }}><TxStatusCard status={isBuyPending ? "signing" : isBuyConfirming ? "pending" : isBuyConfirmed ? "confirmed" : "failed"} hash={buyHash} error={buyError ?? undefined} /></div>}
            </div>
          )}

          {/* Cryptographic proofs */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", padding: "18px" }}>
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
              <Shield size={12} /> Cryptographic Proofs
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <CopyHash value={agentData.storageRootHash} label="Storage Root" />
              <CopyHash value={agentData.teeAttestationHash} label="TEE Attestation" />
              <CopyHash value={agentData.alignmentVerdictHash} label="Alignment Verdict" />
            </div>
          </div>

          {/* Lineage */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", padding: "18px" }}>
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "14px" }}>Lineage</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", marginBottom: "6px" }}>Ancestors ({agentData.lineage.length})</p>
                {agentData.lineage.length === 0
                  ? <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)" }}>Genesis agent (no ancestors)</span>
                  : <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>{agentData.lineage.map((a) => <Link key={a} href={`/dashboard/agents/${a}`} style={{ fontSize: "11px", color: accent, background: `${accent}12`, border: `1px solid ${accent}25`, borderRadius: "6px", padding: "2px 8px" }}>#{a}</Link>)}</div>}
              </div>
              <div>
                <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", marginBottom: "6px" }}>Children ({agentData.children.length})</p>
                {agentData.children.length === 0
                  ? <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)" }}>No children evolved yet</span>
                  : <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>{agentData.children.map((c) => <Link key={c} href={`/dashboard/agents/${c}`} style={{ fontSize: "11px", color: accent, background: `${accent}12`, border: `1px solid ${accent}25`, borderRadius: "6px", padding: "2px 8px" }}>#{c}</Link>)}</div>}
              </div>
            </div>
          </div>

          {/* ERC-7857 iNFT intelligence data */}
          <INFTBadge tokenId={id} accentColor={accent} />

          {/* iNFT transfer / authorize (owner only) */}
          {isOwner && (
            <INFTTransferPanel
              tokenId={id}
              ownerAddress={agentData.owner}
              accentColor={accent}
            />
          )}
        </div>

        {/* RIGHT: Engine & Outputs */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "4px" }}>Live Inference Engine</p>
              <p style={{ fontSize: "15px", fontWeight: 600, color: "white" }}>{speciesLabel} Intelligence Terminal</p>
            </div>
          </div>

          {speciesKey === "alpha-hunter" ? <AlphaHunterFeed agentId={Number(agentId)} />
            : speciesKey === "code-weaver" ? <CodeWeaverDashboard agentId={agentId} />
            : speciesKey === "game-master" ? <GameArena agentId={agentId} />
            : speciesKey === "docu-mind" ? <AuditPanel agentId={agentId} />
            : speciesKey === "oracle-keeper" ? <OracleKeeperFeed agentId={agentId} />
            : speciesKey === "social-synth" ? <CreatorDashboard agentId={agentId} />
            : <SpeciesFeed species={speciesKey as AgentSpecies} title={`${speciesLabel} Inference`} accentColor={getSpeciesMetadata(speciesKey as AgentSpecies).accent} />}
        </div>
      </div>
    </div>
  );
}