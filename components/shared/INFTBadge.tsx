"use client";

import { Shield, Lock, Key, Users, Database, Cpu } from "lucide-react";
import { useReadContract } from "wagmi";
import type { Address } from "viem";
import { replicantAgentNftAbi, agentIdContractAddresses } from "@/lib/contracts/erc7857-agent-id";
import { publicEnv } from "@/lib/env";

interface INFTBadgeProps {
  tokenId: bigint;
  accentColor?: string;
}

export function INFTBadge({ tokenId, accentColor = "#8B5CF6" }: INFTBadgeProps) {
  const nftAddr = agentIdContractAddresses[publicEnv.network] as Address | undefined;

  const intelligentDatas = useReadContract({
    address: nftAddr,
    abi: replicantAgentNftAbi,
    functionName: "intelligentDatasOf",
    args: [tokenId],
    query: { enabled: !!nftAddr },
  });

  const authorizedUsers = useReadContract({
    address: nftAddr,
    abi: replicantAgentNftAbi,
    functionName: "authorizedUsersOf",
    args: [tokenId],
    query: { enabled: !!nftAddr },
  });

  const datas = (intelligentDatas.data as Array<{ dataDescription: string; dataHash: string }>) ?? [];
  const users = (authorizedUsers.data as Address[]) ?? [];

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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield size={13} style={{ color: accentColor }} />
          <span
            style={{
              fontSize: "11px",
              color: "rgba(255,255,255,0.4)",
              textTransform: "uppercase",
              letterSpacing: "2px",
            }}
          >
            ERC-7857 iNFT
          </span>
        </div>
        <span
          style={{
            fontSize: "9px",
            color: accentColor,
            background: `${accentColor}15`,
            border: `1px solid ${accentColor}30`,
            borderRadius: "4px",
            padding: "2px 7px",
            fontFamily: "monospace",
            letterSpacing: "1px",
          }}
        >
          INTELLIGENCE NFT
        </span>
      </div>

      {/* Encrypted genome entries */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <p
          style={{
            fontSize: "10px",
            color: "rgba(255,255,255,0.3)",
            textTransform: "uppercase",
            letterSpacing: "1.5px",
            display: "flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          <Lock size={10} /> Encrypted Intelligence Data ({datas.length})
        </p>
        {intelligentDatas.isLoading ? (
          <div style={{ height: "32px", background: "rgba(255,255,255,0.03)", borderRadius: "8px", animation: "pulse 2s infinite" }} />
        ) : datas.length === 0 ? (
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)" }}>No intelligence data stored</p>
        ) : (
          datas.map((d, i) => (
            <div
              key={i}
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: "10px",
                padding: "10px 12px",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}
            >
              <div className="flex items-center gap-2">
                <Database size={10} style={{ color: accentColor, flexShrink: 0 }} />
                <span
                  style={{
                    fontSize: "11px",
                    color: "rgba(255,255,255,0.6)",
                    fontFamily: "monospace",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {d.dataDescription || "genome://encrypted"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Key size={10} style={{ color: "rgba(255,255,255,0.2)", flexShrink: 0 }} />
                <span
                  style={{
                    fontSize: "10px",
                    color: "rgba(255,255,255,0.25)",
                    fontFamily: "monospace",
                  }}
                >
                  {d.dataHash
                    ? `${d.dataHash.slice(0, 10)}…${d.dataHash.slice(-6)}`
                    : "hash pending"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Authorized users */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <p
          style={{
            fontSize: "10px",
            color: "rgba(255,255,255,0.3)",
            textTransform: "uppercase",
            letterSpacing: "1.5px",
            display: "flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          <Users size={10} /> Authorized Executors ({users.length})
        </p>
        {authorizedUsers.isLoading ? (
          <div style={{ height: "28px", background: "rgba(255,255,255,0.03)", borderRadius: "8px", animation: "pulse 2s infinite" }} />
        ) : users.length === 0 ? (
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)" }}>No authorized executors</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {users.slice(0, 3).map((u) => (
              <span
                key={u}
                style={{
                  fontSize: "11px",
                  color: "rgba(255,255,255,0.4)",
                  fontFamily: "monospace",
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.05)",
                  borderRadius: "6px",
                  padding: "4px 8px",
                }}
              >
                {u.slice(0, 8)}…{u.slice(-6)}
              </span>
            ))}
            {users.length > 3 && (
              <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)" }}>
                +{users.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* TEE inference note */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          background: `${accentColor}08`,
          border: `1px solid ${accentColor}15`,
          borderRadius: "10px",
          padding: "8px 12px",
        }}
      >
        <Cpu size={11} style={{ color: accentColor, flexShrink: 0 }} />
        <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>
          Intelligence runs inside a TEE enclave. Genome is never exposed in plaintext.
        </p>
      </div>
    </div>
  );
}
