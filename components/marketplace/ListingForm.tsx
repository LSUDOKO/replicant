"use client";

import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, BaseError, type Address } from "viem";
import { Loader2, Tag, CheckCircle2, AlertCircle } from "lucide-react";
import { TxStatusCard } from "@/components/shared/TxStatusCard";
import { replicantMarketplaceAbi, marketplaceContractAddresses } from "@/lib/contracts/marketplace";
import { replicantAgentNftAbi, agentIdContractAddresses } from "@/lib/contracts/erc7857-agent-id";
import { publicEnv } from "@/lib/env";

export function ListingForm({ onListed }: { onListed?: () => void }) {
  const { isConnected } = useAccount();
  const [tokenId, setTokenId] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"input" | "approving" | "listing" | "success">("input");

  const marketAddr = marketplaceContractAddresses[publicEnv.network] as Address | undefined;
  const nftAddr = agentIdContractAddresses[publicEnv.network] as Address | undefined;

  const { data: approveHash, isPending: approvePending, writeContractAsync: writeApprove, reset: resetApprove } = useWriteContract();
  const { data: listHash, isPending: listPending, writeContractAsync: writeList, reset: resetList } = useWriteContract();
  
  const { isLoading: approveConfirming, isSuccess: approveConfirmed } = useWaitForTransactionReceipt({ hash: approveHash });
  const { isLoading: listConfirming, isSuccess: listConfirmed } = useWaitForTransactionReceipt({ hash: listHash });

  // Auto-proceed to listing after approval is confirmed
  useEffect(() => {
    if (approveConfirmed && step === "approving") {
      handleListAfterApproval();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [approveConfirmed, step]);

  async function handleListAfterApproval() {
    if (!marketAddr || !price || !tokenId) return;
    
    try {
      setStep("listing");
      await writeList({
        address: marketAddr,
        abi: replicantMarketplaceAbi,
        functionName: "list",
        args: [BigInt(tokenId), parseEther(price)],
      });

      setStep("success");
      if (onListed) {
        setTimeout(onListed, 2000);
      }
    } catch (err) {
      setError(
        err instanceof BaseError 
          ? err.shortMessage 
          : err instanceof Error 
            ? err.message 
            : "Transaction failed"
      );
      setStep("input");
    }
  }

  async function handleList() {
    if (!marketAddr || !nftAddr || !tokenId || !price) return;

    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue <= 0) {
      setError("Invalid price");
      return;
    }

    setError(null);
    resetApprove();
    resetList();

    try {
      // Step 1: Approve marketplace
      setStep("approving");
      await writeApprove({
        address: nftAddr,
        abi: replicantAgentNftAbi,
        functionName: "approve",
        args: [marketAddr, BigInt(tokenId)],
      });
      // Step 2 will be triggered by useEffect when approval confirms
    } catch (err) {
      setError(
        err instanceof BaseError 
          ? err.shortMessage 
          : err instanceof Error 
            ? err.message 
            : "Transaction failed"
      );
      setStep("input");
    }
  }

  function handleReset() {
    setTokenId("");
    setPrice("");
    setError(null);
    setStep("input");
    resetApprove();
    resetList();
  }

  const isProcessing = approvePending || approveConfirming || listPending || listConfirming;
  const isComplete = listConfirmed && step === "success";

  return (
    <div className="bg-black border border-white/10 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Tag size={16} className="text-[#8b5cf6]" />
        <h2 className="text-base font-medium text-white">List Agent for Sale</h2>
      </div>

      {!isComplete ? (
        <>
          <div className="grid gap-3 sm:grid-cols-3 sm:items-end">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-white/40 block mb-1">
                Token ID
              </label>
              <input
                value={tokenId} 
                onChange={(e) => setTokenId(e.target.value)} 
                placeholder="e.g. 1" 
                className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:border-[#8b5cf6] text-sm"
                disabled={isProcessing}
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-white/40 block mb-1">
                Price (0G)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={price} 
                onChange={(e) => setPrice(e.target.value)} 
                placeholder="e.g. 5.0" 
                className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:border-[#8b5cf6] text-sm font-mono"
                disabled={isProcessing}
              />
            </div>
            <button
              onClick={handleList}
              disabled={!isConnected || !tokenId || !price || !marketAddr || isProcessing}
              className="h-10 px-4 rounded-lg bg-[#8b5cf6] text-white font-medium hover:bg-[#8b5cf6]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <><Loader2 size={14} className="animate-spin" /> 
                  {step === "approving" ? "Approving..." : "Listing..."}
                </>
              ) : (
                <><Tag size={14} /> List for Sale</>
              )}
            </button>
          </div>

          <p className="text-[10px] text-white/40 mt-2">
            Platform fee: 10% • Creator royalty: 5%
          </p>

          {error && (
            <div className="mt-3 rounded-lg border border-white/20 bg-white/5 p-3 text-sm text-white flex items-start gap-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {approveHash && (
            <div className="mt-3">
              <TxStatusCard 
                status={approvePending ? "signing" : approveConfirming ? "pending" : "confirmed"} 
                hash={approveHash}
              />
            </div>
          )}

          {listHash && (
            <div className="mt-3">
              <TxStatusCard 
                status={listPending ? "signing" : listConfirming ? "pending" : listConfirmed ? "confirmed" : "failed"} 
                hash={listHash}
                error={error ?? undefined}
              />
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-6">
          <CheckCircle2 size={48} className="text-[#8b5cf6] mx-auto mb-3" />
          <p className="text-lg font-semibold text-white mb-1">Agent Listed Successfully!</p>
          <p className="text-sm text-white/60 mb-4">
            Token #{tokenId} is now available for {price} 0G
          </p>
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-lg border border-white/10 bg-black text-white hover:bg-white/5 transition-colors"
          >
            List Another Agent
          </button>
        </div>
      )}
    </div>
  );
}
