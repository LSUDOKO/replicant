"use client";

import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { AlignmentGauge } from "@/components/dashboard/AlignmentGauge";
import { GlassCard } from "@/components/ui/glass-card";
import { ExplorerLinkWrapper } from "@/components/shared/ExplorerLink";
import { useReplicantStore } from "@/lib/store";

function SafetyAttestationPanel() {
  const attestation = useReplicantStore(
    (state) => state.zeroGChain.computeAttestation
  );

  return (
    <GlassCard className="p-5">
      <p className="label-uppercase text-accent-evolution">
        0G Alignment Layer
      </p>
      <h2 className="mt-3 text-xl font-semibold tracking-tight">
        TEE Attestation Watch
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Alignment nodes monitor drift, bias, anomaly, and goal divergence before
        a child Agent ID can be promoted.
      </p>
      {attestation ? (
        <div className="mt-5 rounded-xl border border-border bg-surface/50 p-4">
          <p className="label-uppercase text-muted-foreground">
            Latest attestation
          </p>
          <ExplorerLinkWrapper
            value={attestation}
            type="attestation"
            className="mt-2 text-accent-evolution"
          />
        </div>
      ) : null}
    </GlassCard>
  );
}

export default function SafetyPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Safety</h1>
        <p className="text-sm text-muted-foreground">
          Alignment monitoring, violation attestations, and slashing readiness
          for autonomous evolution.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <AlignmentGauge />
        <div className="lg:col-span-2">
          <SafetyAttestationPanel />
        </div>
      </div>

      <ActivityFeed />
    </div>
  );
}
