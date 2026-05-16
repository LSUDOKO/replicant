"use client";

import { useState } from "react";
import { useAccount as useWagmiAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, BaseError, type Address, parseEventLogs } from "viem";
import { CheckCircle2, Loader2, ShieldCheck, Calendar, Coins, User, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ActionButton } from "@/components/ui/action-button";
import { ExplorerLinkWrapper } from "@/components/shared/ExplorerLink";
import { replicantSubscriptionEscrowAbi, subscriptionEscrowContractAddresses } from "@/lib/contracts/subscription-escrow";
import { useDashboardData } from "@/lib/queries/use-dashboard-data";
import { publicEnv } from "@/lib/env";
import { SPECIES_INFO } from "@/lib/constants";

const TIERS = [
  { id: 1, name: "Basic", price: "0.01", duration: "1 day", seconds: 86400, features: ["Real-time agent outputs", "Cancel anytime", "No hidden fees"] },
  { id: 2, name: "Pro", price: "0.05", duration: "7 days", seconds: 604800, features: ["Real-time agent outputs", "Priority access", "Cancel anytime", "No hidden fees"] },
  { id: 3, name: "Enterprise", price: "0.2", duration: "30 days", seconds: 2592000, features: ["Real-time agent outputs", "Priority access", "Dedicated support", "Cancel anytime", "No hidden fees"] },
] as const;

export default function SubscriptionsPage() {
  const { address, isConnected } = useWagmiAccount();
  const { agents } = useDashboardData();
  const [agentId, setAgentId] = useState("");
  const [selectedTier, setSelectedTier] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionId, setSubscriptionId] = useState<bigint | null>(null);

  const escrowAddr = subscriptionEscrowContractAddresses[publicEnv.network] as Address | undefined;

  const { 
    data: hash, 
    isPending, 
    writeContract,
    error: writeError,
    reset: resetWrite
  } = useWriteContract();

  const { 
    isLoading: isConfirming, 
    isSuccess: isConfirmed,
    data: receipt
  } = useWaitForTransactionReceipt({ 
    hash,
  });

  const tier = TIERS.find((t) => t.id === selectedTier);
  const selectedAgent = agents.find(a => a.id === agentId);

  // Parse subscription ID from receipt
  if (isConfirmed && receipt && !subscriptionId) {
    try {
      const logs = parseEventLogs({
        abi: replicantSubscriptionEscrowAbi,
        eventName: "SubscriptionStarted",
        logs: receipt.logs,
      });

      if (logs.length > 0 && logs[0]?.args?.subscriptionId) {
        setSubscriptionId(logs[0].args.subscriptionId);
      }
    } catch (e) {
      console.error("Failed to parse subscription ID:", e);
    }
  }

  // Handle write errors
  if (writeError && !error) {
    if (writeError instanceof BaseError) {
      const msg = writeError.shortMessage ?? writeError.message ?? "";
      if (msg.includes("AgentNotFound")) {
        setError("Agent not found. Please select a valid agent.");
      } else if (msg.includes("InvalidPayment")) {
        setError("Payment amount is invalid. Make sure you have enough 0G tokens.");
      } else if (msg.includes("InvalidDuration")) {
        setError("Subscription duration is invalid.");
      } else if (msg.includes("User rejected") || msg.includes("User denied")) {
        setError("Transaction was rejected in your wallet.");
      } else if (msg.includes("insufficient funds")) {
        setError("Insufficient funds. You need " + (tier?.price ?? "0") + " 0G tokens plus gas fees.");
      } else {
        setError(msg || "Transaction failed. Please try again.");
      }
    } else if (writeError instanceof Error) {
      setError(writeError.message);
    } else {
      setError("Subscription failed. Check console for details.");
    }
  }

  function handleSubscribe() {
    if (!escrowAddr || !tier || !agentId || !address || !selectedAgent) return;
    
    setError(null);
    setSubscriptionId(null);
    resetWrite();

    try {
      // Get agent owner address (receiver of payment)
      const receiverAddress = selectedAgent.owner as Address;
      
      writeContract({
        address: escrowAddr,
        abi: replicantSubscriptionEscrowAbi,
        functionName: "startSubscription",
        args: [BigInt(agentId), receiverAddress, BigInt(tier.id), BigInt(tier.seconds)],
        value: parseEther(tier.price),
      });
    } catch (err) {
      console.error("Failed to initiate subscription:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to start subscription. Please try again.");
      }
    }
  }

  function reset() {
    setAgentId("");
    setSelectedTier(null);
    setError(null);
    setSubscriptionId(null);
    resetWrite();
  }

  const isBusy = isPending || isConfirming;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Subscriptions</h1>
        <p className="text-sm text-white/60">
          Pay-per-use access to agent outputs via 0G Chain escrow
        </p>
      </div>

      {/* Tier comparison */}
      <div className="grid gap-4 sm:grid-cols-3">
        {TIERS.map((t) => (
          <Card
            key={t.id}
            className={`cursor-pointer transition-all border ${
              selectedTier === t.id 
                ? "border-violet-500 bg-violet-500/10" 
                : "border-white/10 bg-black hover:border-white/20"
            }`}
            onClick={() => { if (!isBusy) setSelectedTier(t.id); }}
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-white">{t.name}</h3>
                {selectedTier === t.id && (
                  <CheckCircle2 size={18} className="text-violet-500" />
                )}
              </div>
              <p className="text-3xl font-bold tracking-tight text-violet-400">{t.price} 0G</p>
              <p className="mt-1 text-xs text-white/60">per {t.duration}</p>
              <ul className="mt-4 space-y-2 text-xs text-white/80">
                {t.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle2 size={12} className="text-violet-500 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Subscribe form */}
      <Card className="border-white/10 bg-black">
        <CardHeader className="border-b border-white/10">
          <CardTitle className="text-base font-medium text-white flex items-center gap-2">
            <ShieldCheck size={16} className="text-violet-500" />
            Start Subscription
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          {/* Agent Selection */}
          <div>
            <label className="text-xs uppercase tracking-wider text-white/60 block mb-2">
              Select Agent
            </label>
            <select
              value={agentId}
              onChange={(e) => setAgentId(e.target.value)}
              className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-violet-500"
              disabled={isBusy}
            >
              <option value="">Choose an agent...</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name} (#{agent.id}) - {SPECIES_INFO[agent.species]?.name ?? agent.species}
                </option>
              ))}
            </select>
          </div>

          {/* Selected Agent Info */}
          {selectedAgent && (
            <div className="rounded-lg border border-white/10 bg-black p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-black text-violet-500 font-bold text-sm">
                  {SPECIES_INFO[selectedAgent.species]?.name.slice(0, 2).toUpperCase() ?? "AG"}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{selectedAgent.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant="outline" className="text-[10px] border-white/20 text-white/80">
                      {SPECIES_INFO[selectedAgent.species]?.domain ?? "Unknown"}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] border-white/20 text-white/80">
                      Gen-{selectedAgent.generation}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Subscribe Button */}
          <div className="flex items-center gap-3">
            <ActionButton
              onClick={handleSubscribe}
              disabled={!isConnected || !selectedTier || !agentId || isBusy || !escrowAddr}
              className="flex-1 bg-violet-500 hover:bg-violet-600 text-white border-0"
            >
              {isPending ? (
                <><Loader2 size={14} className="mr-2 animate-spin" /> Approve in Wallet</>
              ) : isConfirming ? (
                <><Loader2 size={14} className="mr-2 animate-spin" /> Confirming...</>
              ) : (
                <><ShieldCheck size={14} className="mr-2" /> Subscribe Now</>
              )}
            </ActionButton>
          </div>

          <p className="text-xs text-white/60">
            {tier 
              ? `Selected: ${tier.name} — ${tier.price} 0G for ${tier.duration}` 
              : "Select a tier and agent to continue"}
          </p>

          {/* Transaction Status */}
          {isPending && (
            <div className="rounded-lg border border-white/10 bg-black p-3">
              <div className="flex items-center gap-2">
                <Loader2 size={16} className="animate-spin text-white/60" />
                <p className="text-sm font-medium text-white">Waiting for wallet confirmation...</p>
              </div>
            </div>
          )}

          {isConfirming && hash && (
            <div className="rounded-lg border border-amber/20 bg-amber/5 p-3">
              <div className="flex items-center gap-2">
                <Loader2 size={16} className="animate-spin text-amber" />
                <p className="text-sm font-medium text-white">Confirming transaction...</p>
              </div>
              <ExplorerLinkWrapper value={hash} type="tx" className="mt-2 block" />
            </div>
          )}

          {isConfirmed && hash && (
            <div className="rounded-lg border border-violet-500/20 bg-violet-500/5 p-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-violet-400" />
                <p className="text-sm font-medium text-white">Subscription Active!</p>
              </div>
              <p className="mt-1 text-xs text-white/60">
                {subscriptionId ? `Subscription #${subscriptionId.toString()} started — you now have access.` : "Subscription started."}
              </p>
              <ExplorerLinkWrapper value={hash} type="tx" className="mt-2 block" />
            </div>
          )}

          {/* Error Display */}
          {error && !isBusy && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3">
              <div className="flex items-start gap-2">
                <XCircle size={16} className="mt-0.5 shrink-0 text-destructive" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-destructive">Subscription Failed</p>
                  <p className="mt-1 text-xs text-white/60 break-all">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Reset after completion or error */}
          {(isConfirmed || error) && !isBusy && (
            <button
              onClick={reset}
              className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
            >
              Start a new subscription
            </button>
          )}

          {/* Contract not configured */}
          {!escrowAddr && (
            <p className="text-xs text-white/60 text-center">
              Subscription escrow contract not configured.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-black border-white/10">
          <CardContent className="pt-6">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-black border border-white/10">
              <Coins size={18} className="text-violet-500" />
            </div>
            <h3 className="mb-1 font-medium text-white">Escrow Protection</h3>
            <p className="text-xs text-white/60 leading-relaxed">
              Your subscription payment is held in a secure 0G Chain escrow contract until the service period ends.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-black border-white/10">
          <CardContent className="pt-6">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-black border border-white/10">
              <Calendar size={18} className="text-violet-500" />
            </div>
            <h3 className="mb-1 font-medium text-white">Flexible Duration</h3>
            <p className="text-xs text-white/60 leading-relaxed">
              Choose from daily, weekly, or monthly subscriptions based on your usage needs.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-black border-white/10">
          <CardContent className="pt-6">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-black border border-white/10">
              <User size={18} className="text-violet-500" />
            </div>
            <h3 className="mb-1 font-medium text-white">Cancel Anytime</h3>
            <p className="text-xs text-white/60 leading-relaxed">
              No long-term commitments. Cancel your subscription at any time with no penalties.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
