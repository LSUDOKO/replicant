"use client";

import { Activity, Database, Gauge } from "lucide-react";

import { ExplorerLinkWrapper } from "@/components/shared/ExplorerLink";
import { useReplicantStore } from "@/lib/store";

export function ChainStatus() {
  const zeroGChain = useReplicantStore((state) => state.zeroGChain);

  return (
    <div className="hidden items-center gap-3 rounded-full border border-border bg-surface/70 px-3 py-1.5 text-xs text-muted-foreground md:flex">
      <span className="inline-flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-accent-success shadow-[0_0_12px_rgba(34,197,94,0.45)]" />
        {zeroGChain.networkName}
      </span>
      <span className="inline-flex items-center gap-1.5 font-mono">
        <Activity size={13} className="text-accent-evolution" />
        {zeroGChain.latestBlock.toLocaleString()}
      </span>
      <span className="inline-flex items-center gap-1.5 font-mono">
        <Gauge size={13} className="text-accent-success" />
        {zeroGChain.finalityMs}ms
      </span>
      {zeroGChain.computeAttestation ? (
        <ExplorerLinkWrapper
          value={zeroGChain.computeAttestation}
          type="attestation"
          className="text-muted-foreground hover:text-accent-evolution"
        >
          <Database size={13} />
          TEE
        </ExplorerLinkWrapper>
      ) : null}
    </div>
  );
}
