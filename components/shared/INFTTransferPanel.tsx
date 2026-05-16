"use client";

import { useState } from "react";
import { useSendTransaction, useWaitForTransactionReceipt } from "wagmi";
import { BaseError, isAddress, encodeFunctionData, type Address, type Hex } from "viem";
import { ArrowRight, Lock, Shield, AlertTriangle, CheckCircle2, Loader2, Users } from "lucide-react";
import { replicantAgentNftAbi, agentIdContractAddresses } from "@/lib/contracts/erc7857-agent-id";
import { publicEnv } from "@/lib/env";
import { TxStatusCard } from "@/components/shared/TxStatusCard";

interface INFTTransferPanelProps {
  tokenId: bigint;
  ownerAddress: Address;
  accentColor?: string;
}

/**
 * ERC-7857 iNFT transfer panel.
 *
 * In production, proofs come from the TEE oracle. Here we expose the
 * `iTransferFrom` call with empty proofs (valid for the SimpleVerifier
 * deployed on testnet) so the UI is fully wired and ready for real proofs.
 *
 * For authorize-usage (AI-as-a-Service), we call `authorizeUsage` directly.
 */
export function INFTTransferPanel({ tokenId, ownerAddress, accentColor = "#8B5CF6" }: INFTTransferPanelProps) {
  const nftAddr = agentIdContractAddresses[publicEnv.network] as Address | undefined;

  const [tab, setTab] = useState<"transfer" | "authorize">("transfer");
  const [recipient, setRecipient] = useState("");
  const [executor, setExecutor] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { data: txHash, isPending, sendTransactionAsync, reset } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: txHash });

  async function handleTransfer() {
    if (!nftAddr) return setError("Contract not configured");
    if (!isAddress(recipient)) return setError("Invalid recipient address");
    setError(null);
    reset();
    try {
      // Use safeTransferFrom (ERC-721) instead of iTransferFrom (ERC-7857)
      // because iTransferFrom requires real TEE oracle proofs for non-empty arrays
      // and the contract reverts with ERC7857EmptyProof if proofs is empty.
      // For testnet/hackathon, standard ERC-721 transfer is sufficient.
      const data = encodeFunctionData({
        abi: replicantAgentNftAbi,
        functionName: "safeTransferFrom",
        args: [ownerAddress, recipient as Address, tokenId],
      });
      await sendTransactionAsync({
        to: nftAddr,
        data: data as Hex,
      });
    } catch (err) {
      setError(err instanceof BaseError ? err.shortMessage : err instanceof Error ? err.message : "Transfer failed");
    }
  }

  async function handleAuthorize() {
    if (!nftAddr) return setError("Contract not configured");
    if (!isAddress(executor)) return setError("Invalid executor address");
    setError(null);
    reset();
    try {
      const data = encodeFunctionData({
        abi: replicantAgentNftAbi,
        functionName: "authorizeUsage",
        args: [tokenId, executor as Address],
      });
      await sendTransactionAsync({
        to: nftAddr,
        data: data as Hex,
      });
    } catch (err) {
      setError(err instanceof BaseError ? err.shortMessage : err instanceof Error ? err.message : "Authorization failed");
    }
  }

  const busy = isPending || isConfirming;

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.02)",
        border: `1px solid ${accentColor}20`,
        borderRadius: "16px",
        padding: "18px",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <Lock size={13} style={{ color: accentColor }} />
        <span
          style={{
            fontSize: "11px",
            color: "rgba(255,255,255,0.4)",
            textTransform: "uppercase",
            letterSpacing: "2px",
          }}
        >
          iNFT Actions
        </span>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: "4px",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "10px",
          padding: "3px",
        }}
      >
        {(["transfer", "authorize"] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setError(null); reset(); }}
            style={{
              flex: 1,
              padding: "6px 10px",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.2s",
              background: tab === t ? `${accentColor}20` : "transparent",
              color: tab === t ? accentColor : "rgba(255,255,255,0.4)",
              border: tab === t ? `1px solid ${accentColor}30` : "1px solid transparent",
            }}
          >
            {t === "transfer" ? (
              <span className="flex items-center justify-center gap-1.5">
                <ArrowRight size={11} /> Secure Transfer
              </span>
            ) : (
              <span className="flex items-center justify-center gap-1.5">
                <Users size={11} /> Authorize Use
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === "transfer" ? (
        <>
          {/* TEE notice */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "8px",
              background: "rgba(255,184,0,0.06)",
              border: "1px solid rgba(255,184,0,0.15)",
              borderRadius: "10px",
              padding: "10px 12px",
            }}
          >
            <AlertTriangle size={12} style={{ color: "#FFB800", flexShrink: 0, marginTop: "1px" }} />
            <p style={{ fontSize: "11px", color: "rgba(255,184,0,0.8)", lineHeight: 1.5 }}>
              ERC-7857 secure transfer requires TEE proofs. Using standard ERC-721 transfer for now — ownership transfers but encrypted genome data stays with current owner.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "1.5px" }}>
              Recipient Address
            </label>
            <input
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="0x..."
              style={{
                background: "#09090B",
                border: `1px solid ${recipient && !isAddress(recipient) ? "#ef4444" : "rgba(255,255,255,0.08)"}`,
                borderRadius: "10px",
                padding: "10px 14px",
                fontSize: "13px",
                color: "rgba(255,255,255,0.8)",
                fontFamily: "monospace",
                outline: "none",
                width: "100%",
              }}
            />
          </div>

          <button
            onClick={handleTransfer}
            disabled={busy || !recipient || !isAddress(recipient)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              background: busy ? `${accentColor}30` : accentColor,
              color: busy ? "rgba(255,255,255,0.5)" : "#000",
              borderRadius: "10px",
              padding: "10px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: busy || !recipient || !isAddress(recipient) ? "not-allowed" : "pointer",
              opacity: !recipient || !isAddress(recipient) ? 0.5 : 1,
              transition: "all 0.2s",
              border: "none",
            }}
          >
            {busy ? <Loader2 size={13} className="animate-spin" /> : <Shield size={13} />}
            {isPending ? "Confirm in wallet…" : isConfirming ? "Confirming…" : "Transfer iNFT"}
          </button>
        </>
      ) : (
        <>
          {/* Authorize usage note */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "8px",
              background: `${accentColor}08`,
              border: `1px solid ${accentColor}15`,
              borderRadius: "10px",
              padding: "10px 12px",
            }}
          >
            <Shield size={12} style={{ color: accentColor, flexShrink: 0, marginTop: "1px" }} />
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>
              Grant an executor access to run this agent without transferring ownership.
              Enables AI-as-a-Service models.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "1.5px" }}>
              Executor Address
            </label>
            <input
              value={executor}
              onChange={(e) => setExecutor(e.target.value)}
              placeholder="0x..."
              style={{
                background: "#09090B",
                border: `1px solid ${executor && !isAddress(executor) ? "#ef4444" : "rgba(255,255,255,0.08)"}`,
                borderRadius: "10px",
                padding: "10px 14px",
                fontSize: "13px",
                color: "rgba(255,255,255,0.8)",
                fontFamily: "monospace",
                outline: "none",
                width: "100%",
              }}
            />
          </div>

          <button
            onClick={handleAuthorize}
            disabled={busy || !executor || !isAddress(executor)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              background: busy ? `${accentColor}30` : accentColor,
              color: busy ? "rgba(255,255,255,0.5)" : "#000",
              borderRadius: "10px",
              padding: "10px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: busy || !executor || !isAddress(executor) ? "not-allowed" : "pointer",
              opacity: !executor || !isAddress(executor) ? 0.5 : 1,
              transition: "all 0.2s",
              border: "none",
            }}
          >
            {busy ? <Loader2 size={13} className="animate-spin" /> : <Users size={13} />}
            {isPending ? "Confirm in wallet…" : isConfirming ? "Confirming…" : "Authorize Executor"}
          </button>
        </>
      )}

      {/* Tx status */}
      {txHash && (
        <TxStatusCard
          status={isPending ? "signing" : isConfirming ? "pending" : isConfirmed ? "confirmed" : "failed"}
          hash={txHash}
          error={error ?? undefined}
        />
      )}

      {/* Error */}
      {error && !txHash && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.2)",
            borderRadius: "10px",
            padding: "10px 12px",
            fontSize: "12px",
            color: "#ef4444",
          }}
        >
          <AlertTriangle size={12} />
          {error}
        </div>
      )}

      {isConfirmed && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: "rgba(0,255,136,0.06)",
            border: "1px solid rgba(0,255,136,0.2)",
            borderRadius: "10px",
            padding: "10px 12px",
            fontSize: "12px",
            color: "#00FF88",
          }}
        >
          <CheckCircle2 size={12} />
          {tab === "transfer" ? "Ownership transferred!" : "Executor authorized successfully."}
        </div>
      )}
    </div>
  );
}
