"use client";

import * as React from "react";
import { AlertTriangle, ArrowRightLeft } from "lucide-react";
import { useAccount, useChainId, useSwitchChain } from "wagmi";

import { ActionButton } from "@/components/ui/action-button";
import { GlassCard } from "@/components/ui/glass-card";
import { publicEnv } from "@/lib/env";
import { zeroGGalileo, zeroGMainnet } from "@/lib/0g";

const TARGET_CHAIN = publicEnv.network === "mainnet" ? zeroGMainnet : zeroGGalileo;

export function NetworkGuard({ children }: { children: React.ReactNode }) {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending } = useSwitchChain();

  const isWrongNetwork = isConnected && chainId !== TARGET_CHAIN.id;

  if (!isWrongNetwork) return <>{children}</>;

  return (
    <div className="flex min-h-[40vh] items-center justify-center p-6">
      <GlassCard className="max-w-md p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-accent-alert/30 bg-accent-alert/10">
          <AlertTriangle size={22} className="text-accent-alert" />
        </div>
        <h2 className="text-lg font-semibold">Wrong Network</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          REPLICANT runs on{" "}
          <span className="font-medium text-foreground">{TARGET_CHAIN.name}</span>.
          Switch your wallet to continue.
        </p>
        <ActionButton
          className="mt-6 w-full"
          onClick={() => switchChain({ chainId: TARGET_CHAIN.id })}
          disabled={isPending}
        >
          <ArrowRightLeft size={15} className="mr-2" />
          {isPending ? "Switching" : `Switch to ${TARGET_CHAIN.name}`}
        </ActionButton>
      </GlassCard>
    </div>
  );
}
