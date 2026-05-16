"use client";

import { useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract, useSwitchChain } from "wagmi";
import { keccak256, toHex, BaseError, type Address } from "viem";
import { Loader2, Zap, ShieldAlert, AlertTriangle, CheckCircle2, XCircle, RefreshCw, UserCheck } from "lucide-react";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { AlignmentGauge } from "@/components/dashboard/AlignmentGauge";
import { GlassCard } from "@/components/ui/glass-card";
import { ActionButton } from "@/components/ui/action-button";
import { Input } from "@/components/ui/input";
import { ExplorerLinkWrapper } from "@/components/shared/ExplorerLink";
import { Badge } from "@/components/ui/badge";
import { replicantAgentNftAbi, agentIdContractAddresses } from "@/lib/contracts/erc7857-agent-id";
import { publicEnv } from "@/lib/env";
import { zeroGGalileo } from "@/lib/0g";

const ZERO_G_GALILEO_ID = zeroGGalileo.id;

export default function SafetyPage() {
  const { address, isConnected, chainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const [agentId, setAgentId] = useState("");
  const [violationHash, setViolationHash] = useState("");
  const [error, setError] = useState<string | null>(null);

  const nftAddr = agentIdContractAddresses[publicEnv.network] as Address | undefined;

  const { data: slashTx, isPending, writeContractAsync, reset: resetWrite } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: slashTx });

  const { data: writeSetTx, isPending: isSetPending, writeContractAsync: writeSetAlignment } = useWriteContract();
  const { isLoading: isSetConfirming, isSuccess: isSetConfirmed } = useWaitForTransactionReceipt({ hash: writeSetTx });

  const isCorrectChain = chainId === ZERO_G_GALILEO_ID;

  const { data: alignmentNodeAddr } = useReadContract({
    address: nftAddr,
    abi: [
      ...replicantAgentNftAbi,
      {
        type: "function",
        name: "alignmentNode",
        stateMutability: "view",
        inputs: [],
        outputs: [{ type: "address" }],
      },
      {
        type: "function",
        name: "admin",
        stateMutability: "view",
        inputs: [],
        outputs: [{ type: "address" }],
      },
      {
        type: "function",
        name: "setAlignmentNode",
        stateMutability: "nonpayable",
        inputs: [{ name: "node", type: "address" }],
        outputs: [],
      },
    ],
    functionName: "alignmentNode",
    query: { enabled: !!nftAddr },
  });

  const { data: adminAddr } = useReadContract({
    address: nftAddr,
    abi: [
      {
        type: "function",
        name: "admin",
        stateMutability: "view",
        inputs: [],
        outputs: [{ type: "address" }],
      },
    ],
    functionName: "admin",
    query: { enabled: !!nftAddr },
  });

  const isAlignmentNode = alignmentNodeAddr?.toString().toLowerCase() === address?.toLowerCase();
  const isAdmin = adminAddr?.toString().toLowerCase() === address?.toLowerCase();
  const isBusy = isPending || isConfirming || isSetPending || isSetConfirming;
  const canSlash = isConnected && !!nftAddr && !!agentId && isAlignmentNode && !isBusy && isCorrectChain;

  async function handleSlash() {
    if (!nftAddr || !agentId) return;
    setError(null);

    if (!isCorrectChain) {
      try {
        await switchChainAsync({ chainId: ZERO_G_GALILEO_ID });
      } catch {
        setError("Please switch to 0G Galileo Testnet to continue.");
        return;
      }
    }

    try {
      const vHash = violationHash
        ? (violationHash as `0x${string}`)
        : keccak256(toHex("demo-alignment-violation"));

      await writeContractAsync({
        address: nftAddr,
        abi: replicantAgentNftAbi,
        functionName: "slash",
        args: [BigInt(agentId), vHash],
      });
    } catch (err) {
      console.error("Slash failed:", err);
      if (err instanceof BaseError) {
        const msg = err.shortMessage ?? err.message ?? "";
        if (msg.includes("NotAlignmentNode")) {
          setError(
            `Wallet ${address?.slice(0, 6)}...${address?.slice(-4)} is not authorized. ` +
            (alignmentNodeAddr
              ? `Only the Alignment Node (${alignmentNodeAddr.slice(0, 6)}...${alignmentNodeAddr.slice(-4)}) can slash.`
              : "No Alignment Node is set on the contract.")
          );
        } else if (msg.includes("AgentAlreadySlashed")) {
          setError(`Agent #${agentId} has already been slashed.`);
        } else if (msg.includes("AgentBlocked")) {
          setError(`Agent #${agentId} is currently blocked and cannot be slashed.`);
        } else {
          setError(msg);
        }
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Transaction failed. Check console for details.");
      }
    }
  }

  async function handleBecomeAlignmentNode() {
    if (!nftAddr || !address) return;
    setError(null);

    try {
      await writeSetAlignment({
        address: nftAddr,
        abi: [{
          type: "function",
          name: "setAlignmentNode",
          stateMutability: "nonpayable",
          inputs: [{ name: "node", type: "address" }],
          outputs: [],
        }],
        functionName: "setAlignmentNode",
        args: [address],
      });
    } catch (err) {
      console.error("setAlignmentNode failed:", err);
      if (err instanceof BaseError) {
        setError(err.shortMessage ?? err.message ?? "Failed to set alignment node");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Transaction failed");
      }
    }
  }

  function reset() {
    setAgentId("");
    setViolationHash("");
    setError(null);
    resetWrite();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Safety</h1>
          <p className="text-sm text-muted-foreground">
            Alignment monitoring, violation attestations, and slashing readiness for autonomous evolution.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-cyan/30 text-cyan text-[10px]">
            {publicEnv.network}
          </Badge>
          {!isCorrectChain && isConnected && (
            <Badge variant="outline" className="border-destructive/30 text-destructive text-[10px]">
              Wrong Network
            </Badge>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <AlignmentGauge />
        <div className="lg:col-span-2">
          <GlassCard className="p-5">
            <p className="label-uppercase text-accent-evolution">0G Alignment Layer</p>
            <h2 className="mt-3 text-xl font-semibold tracking-tight">TEE Attestation Watch</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Alignment nodes monitor drift, bias, anomaly, and goal divergence before a child Agent ID can be promoted.
            </p>
            {alignmentNodeAddr ? (
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-cyan/20 bg-cyan/5 px-3 py-2 text-xs">
                <ShieldAlert size={14} className="shrink-0 text-cyan" />
                <span className="text-muted-foreground">
                  Alignment Node:{" "}
                  <span className="font-mono text-cyan">
                    {alignmentNodeAddr.slice(0, 6)}...{alignmentNodeAddr.slice(-4)}
                  </span>
                  {isAlignmentNode && (
                    <span className="ml-2 text-[10px] uppercase tracking-wider text-cyan">(Connected)</span>
                  )}
                  {!isAlignmentNode && address && (
                    <span className="ml-2 text-[10px] text-muted-foreground">
                      (Connected: {address.slice(0, 6)}...{address.slice(-4)})
                    </span>
                  )}
                </span>
              </div>
            ) : nftAddr && (
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                <AlertTriangle size={14} />
                No Alignment Node configured on the contract. Slashing is disabled.
              </div>
            )}
          </GlassCard>
        </div>
      </div>

      {/* Slashing Console */}
      <GlassCard className="border-destructive/20 p-5">
        <div className="flex items-center gap-2 text-destructive">
          <Zap size={18} />
          <h2 className="text-base font-medium">Slashing Console</h2>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Trigger a slashing event. This will burn the agent&apos;s stake and block all descendants.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-4 sm:items-end">
          <div className="sm:col-span-2">
            <label className="label-uppercase text-muted-foreground">Agent ID</label>
            <Input
              value={agentId}
              onChange={(e) => setAgentId(e.target.value)}
              placeholder="e.g. 1"
              disabled={isBusy}
              className="mt-1 border-destructive/30 bg-surface"
            />
          </div>
          <div className="sm:col-span-1">
            <label className="label-uppercase text-muted-foreground">Violation Hash (optional)</label>
            <Input
              value={violationHash}
              onChange={(e) => setViolationHash(e.target.value)}
              placeholder="Defaults to demo violation"
              disabled={isBusy}
              className="mt-1 border-destructive/30 bg-surface"
            />
          </div>
          <ActionButton
            variant="destructive"
            onClick={handleSlash}
            disabled={!canSlash}
            title={
              !isConnected ? "Connect wallet first"
              : !isCorrectChain ? "Switch to 0G Galileo Testnet"
              : !nftAddr ? "Agent ID contract not configured"
              : !agentId ? "Enter Agent ID"
              : !isAlignmentNode ? "Only the configured Alignment Node can slash"
              : undefined
            }
          >
            {isPending ? (
              <><Loader2 size={14} className="mr-1 animate-spin" /> Approve in Wallet</>
            ) : isConfirming ? (
              <><Loader2 size={14} className="mr-1 animate-spin" /> Confirming...</>
            ) : (
              <><AlertTriangle size={14} className="mr-1" /> Slash Agent</>
            )}
          </ActionButton>
        </div>

        {/* Transaction Status */}
        {isPending && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-amber/30 bg-amber/10 p-3 text-sm text-amber">
            <Loader2 size={16} className="animate-spin" />
            Confirm the slashing transaction in your wallet...
          </div>
        )}

        {isConfirming && slashTx && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-amber/30 bg-amber/10 p-3 text-sm text-amber">
            <Loader2 size={16} className="animate-spin" />
            Slashing transaction submitted — waiting for confirmation...
            <ExplorerLinkWrapper value={slashTx} className="ml-auto" />
          </div>
        )}

        {isConfirmed && slashTx && (
          <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 p-3">
            <div className="flex items-center gap-2 text-sm text-destructive">
              <CheckCircle2 size={16} />
              <span className="font-medium">Agent #{agentId} slashed — stake burned!</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              All descendants of this agent have been permanently blocked.
            </p>
            <ExplorerLinkWrapper value={slashTx} className="mt-2 block" />
          </div>
        )}

        {/* Error Display */}
        {error && !isBusy && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            <XCircle size={16} className="mt-0.5 shrink-0" />
            <div className="min-w-0">
              <p className="font-medium">Slashing Failed</p>
              <p className="mt-1 text-xs text-muted-foreground break-all">{error}</p>
            </div>
          </div>
        )}

        {/* Reset button after completion or error */}
        {(isConfirmed || error) && !isBusy && (
          <div className="mt-4">
            <ActionButton
              variant="outline"
              onClick={reset}
              className="border-border text-muted-foreground hover:text-foreground"
            >
              <RefreshCw size={14} className="mr-1" />
              Reset
            </ActionButton>
          </div>
        )}

        {/* Network mismatch notice */}
        {!isCorrectChain && isConnected && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertTriangle size={16} />
            Wrong network. Please switch to 0G Galileo Testnet.
          </div>
        )}

        {/* Not alignment node notice + admin can self-assign */}
        {!isAlignmentNode && isConnected && alignmentNodeAddr && (
          <div className="mt-4 rounded-xl border border-amber/20 bg-amber/5 p-3 text-sm">
            <div className="flex items-center gap-2 text-amber">
              <ShieldAlert size={16} />
              <span className="font-medium">Not Authorized</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Only the configured Alignment Node can slash agents.
              {isAdmin
                ? " As the contract admin, you can set your wallet as the Alignment Node below."
                : ` The current Alignment Node is ${alignmentNodeAddr.slice(0, 6)}...${alignmentNodeAddr.slice(-4)}.`
              }
            </p>
            {isAdmin && (
              <ActionButton
                onClick={handleBecomeAlignmentNode}
                disabled={isSetPending || isSetConfirming}
                className="mt-3 border-amber/30 text-amber hover:bg-amber/10"
                variant="outline"
              >
                {isSetPending || isSetConfirming ? (
                  <><Loader2 size={14} className="mr-1 animate-spin" /> Setting...</>
                ) : (
                  <><UserCheck size={14} className="mr-1" /> Set My Wallet as Alignment Node</>
                )}
              </ActionButton>
            )}
            {isSetConfirmed && writeSetTx && (
              <div className="mt-3 rounded-lg border border-cyan/20 bg-cyan/5 p-2 text-xs text-cyan">
                Alignment Node updated to your wallet! You can now slash agents.
                <ExplorerLinkWrapper value={writeSetTx} className="mt-1 block" />
              </div>
            )}
          </div>
        )}
      </GlassCard>

      <ActivityFeed />
    </div>
  );
}
