"use client";

import { useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, type Address } from "viem";
import { Loader2, Tag } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { ActionButton } from "@/components/ui/action-button";
import { Input } from "@/components/ui/input";
import { ExplorerLinkWrapper } from "@/components/shared/ExplorerLink";
import { replicantMarketplaceAbi, marketplaceContractAddresses } from "@/lib/contracts/marketplace";
import { replicantAgentNftAbi, agentIdContractAddresses } from "@/lib/contracts/erc7857-agent-id";
import { publicEnv } from "@/lib/env";

export function ListingForm({ onListed }: { onListed?: () => void }) {
  const { isConnected } = useAccount();
  const [tokenId, setTokenId] = useState("");
  const [price, setPrice] = useState("");
  const [approveTx, setApproveTx] = useState<`0x${string}` | null>(null);

  const marketAddr = marketplaceContractAddresses[publicEnv.network] as Address | undefined;
  const nftAddr = agentIdContractAddresses[publicEnv.network] as Address | undefined;

  const { data: listTx, isPending: listPending, writeContractAsync: writeList } = useWriteContract();
  const { data: approveHash, isPending: approvePending, writeContractAsync: writeApprove } = useWriteContract();
  const { isLoading: listConfirming, isSuccess: listConfirmed } = useWaitForTransactionReceipt({ hash: listTx });

  async function handleList() {
    if (!marketAddr || !nftAddr || !tokenId || !price) return;

    await writeApprove({
      address: nftAddr,
      abi: replicantAgentNftAbi,
      functionName: "approve",
      args: [marketAddr, BigInt(tokenId)],
    });

    await writeList({
      address: marketAddr,
      abi: replicantMarketplaceAbi,
      functionName: "list",
      args: [BigInt(tokenId), parseEther(price)],
    });
    onListed?.();
  }

  return (
    <GlassCard className="p-5">
      <div className="flex items-center gap-2">
        <Tag size={16} className="text-primary" />
        <h2 className="text-base font-medium">List Agent for Sale</h2>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3 sm:items-end">
        <div>
          <label className="label-uppercase text-muted-foreground">Token ID</label>
          <Input value={tokenId} onChange={(e) => setTokenId(e.target.value)} placeholder="e.g. 1" className="mt-1 bg-surface" />
        </div>
        <div>
          <label className="label-uppercase text-muted-foreground">Price (0G)</label>
          <Input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. 1.5" className="mt-1 bg-surface" />
        </div>
        <ActionButton
          onClick={handleList}
          disabled={!isConnected || !tokenId || !price || !marketAddr || listPending || listConfirming}
        >
          {listPending || listConfirming ? <><Loader2 size={14} className="mr-1 animate-spin" /> Listing</> : "List for Sale"}
        </ActionButton>
      </div>
      {listTx && (
        <div className="mt-3 rounded-xl border border-success/20 bg-success/5 p-3 text-sm">
          {listConfirmed ? "Listed successfully!" : "Confirming..."}
          <ExplorerLinkWrapper value={listTx} className="mt-1 block" />
        </div>
      )}
    </GlassCard>
  );
}