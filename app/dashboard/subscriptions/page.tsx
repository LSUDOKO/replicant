"use client";

import { useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, type Address } from "viem";
import { CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { ActionButton } from "@/components/ui/action-button";
import { Input } from "@/components/ui/input";
import { ExplorerLinkWrapper } from "@/components/shared/ExplorerLink";
import { replicantSubscriptionEscrowAbi, subscriptionEscrowContractAddresses } from "@/lib/contracts/subscription-escrow";
import { publicEnv } from "@/lib/env";

const TIERS = [
  { id: 1, name: "Basic", price: "0.01", duration: "1 day", seconds: 86400 },
  { id: 2, name: "Pro", price: "0.05", duration: "7 days", seconds: 604800 },
  { id: 3, name: "Enterprise", price: "0.2", duration: "30 days", seconds: 2592000 },
] as const;

export default function SubscriptionsPage() {
  const { address, isConnected } = useAccount();
  const [agentId, setAgentId] = useState("");
  const [selectedTier, setSelectedTier] = useState<number | null>(null);
  const [subId, setSubId] = useState<bigint | null>(null);

  const escrowAddr = subscriptionEscrowContractAddresses[publicEnv.network] as Address | undefined;

  const { data: txHash, isPending, writeContractAsync } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: txHash });

  const tier = TIERS.find((t) => t.id === selectedTier);

  async function handleSubscribe() {
    if (!escrowAddr || !tier || !agentId) return;
    const sub = await writeContractAsync({
      address: escrowAddr,
      abi: replicantSubscriptionEscrowAbi,
      functionName: "startSubscription",
      args: [BigInt(agentId), address!, BigInt(tier.id), BigInt(tier.seconds)],
      value: parseEther(tier.price),
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Subscriptions</h1>
        <p className="text-sm text-muted-foreground">
          Pay-per-use access to agent outputs via 0G Chain escrow
        </p>
      </div>

      {/* Tier comparison */}
      <div className="grid gap-4 sm:grid-cols-3">
        {TIERS.map((t) => (
          <GlassCard
            key={t.id}
            className={`cursor-pointer p-5 transition-all ${
              selectedTier === t.id ? "border-primary/40 bg-primary/5" : ""
            }`}
            onClick={() => setSelectedTier(t.id)}
          >
            <h3 className="text-lg font-semibold">{t.name}</h3>
            <p className="mt-3 text-3xl font-bold tracking-tight text-primary">{t.price} 0G</p>
            <p className="mt-1 text-xs text-muted-foreground">per {t.duration}</p>
            <ul className="mt-4 space-y-2 text-xs text-muted-foreground">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 size={12} className="text-success" />
                Real-time agent outputs
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 size={12} className="text-success" />
                Cancel anytime
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 size={12} className="text-success" />
                No hidden fees
              </li>
            </ul>
          </GlassCard>
        ))}
      </div>

      {/* Subscribe form */}
      <GlassCard className="p-5">
        <h2 className="text-base font-medium">Start Subscription</h2>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="label-uppercase text-muted-foreground">Agent ID</label>
            <Input
              value={agentId}
              onChange={(e) => setAgentId(e.target.value)}
              placeholder="e.g. 1"
              className="mt-1 bg-surface"
            />
          </div>
          <ActionButton
            onClick={handleSubscribe}
            disabled={!isConnected || !selectedTier || !agentId || isPending || isConfirming}
          >
            {isPending || isConfirming ? (
              <><Loader2 size={14} className="mr-1 animate-spin" /> Subscribing</>
            ) : (
              <><ShieldCheck size={14} className="mr-1" /> Subscribe</>
            )}
          </ActionButton>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Selected: {tier ? `${tier.name} — ${tier.price} 0G for ${tier.duration}` : "None"}
        </p>
        {txHash && (
          <div className="mt-4 rounded-xl border border-success/20 bg-success/5 p-3 text-sm">
            {isConfirmed ? "Subscription active!" : "Confirming..."}
            <ExplorerLinkWrapper value={txHash} className="mt-1 block" />
          </div>
        )}
      </GlassCard>
    </div>
  );
}