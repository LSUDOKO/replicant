"use client";

import * as React from "react";
import { CheckCircle2, Database, ExternalLink, FileKey2, FlaskConical, Lock, Rocket, ShieldAlert, Upload, XCircle } from "lucide-react";
import { BaseError, keccak256, parseEther, toHex, type Address, type Hash } from "viem";
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import Link from "next/link";

import { ExplorerLinkWrapper } from "@/components/shared/ExplorerLink";
import { ActionButton } from "@/components/ui/action-button";
import { SpeciesCard } from "@/components/species/SpeciesCard";
import { SpeciesTestModal } from "@/components/species/SpeciesTestModal";
import { SPECIES_INFO } from "@/lib/constants";
import { agentIdContractAddresses, erc7857AgentIdAbi } from "@/lib/contracts";
import { GENOME_TEMPLATES } from "@/lib/genesis-templates";
import { publicEnv } from "@/lib/env";
import type { AgentSpecies } from "@/types";

type StepStatus = "idle" | "active" | "done" | "error";

interface UploadResponse {
  rootHash: Hash;
  txHash: string;
  indexer: string;
  error?: string;
}

const speciesOrder = Object.keys(GENOME_TEMPLATES) as AgentSpecies[];

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function formatError(error: unknown) {
  if (error instanceof BaseError) return error.shortMessage;
  if (error instanceof Error) return error.message;
  return "Unexpected error";
}

async function encryptGenome(genomeJson: string, species: AgentSpecies) {
  const encoded = new TextEncoder().encode(genomeJson);
  const key = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoded)
  );
  const rawKey = new Uint8Array(await crypto.subtle.exportKey("raw", key));

  return {
    version: 1,
    species,
    algorithm: "AES-GCM-256",
    iv: bytesToBase64(iv),
    ciphertext: bytesToBase64(ciphertext),
    plaintextDigest: keccak256(toHex(encoded)),
    encryptionKeyPreview: `${bytesToBase64(rawKey).slice(0, 12)}...${bytesToBase64(rawKey).slice(-8)}`,
    createdAt: new Date().toISOString(),
  };
}

export function GenesisMintForm() {
  const { address, isConnected } = useAccount();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [species, setSpecies] = React.useState<AgentSpecies>("code-weaver");
  const [genomeJson, setGenomeJson] = React.useState(() =>
    JSON.stringify(GENOME_TEMPLATES["code-weaver"].config, null, 2)
  );
  const [stake, setStake] = React.useState("0.01");
  const [upload, setUpload] = React.useState<UploadResponse | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [steps, setSteps] = React.useState<Record<string, StepStatus>>({
    validate: "idle",
    encrypt: "idle",
    upload: "idle",
    mint: "idle",
  });
  const [testModalOpen, setTestModalOpen] = React.useState(false);
  const [mintedAgentId, setMintedAgentId] = React.useState<string | null>(null);

  const contractAddress = agentIdContractAddresses[publicEnv.network] as
    | Address
    | undefined;
  const { data: hash, isPending, writeContractAsync } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed, data: receipt } =
    useWaitForTransactionReceipt({ hash });

  React.useEffect(() => {
    if (!receipt || !contractAddress) return;

    const eventSignature = keccak256(toHex("GenesisMinted(uint256,address,bytes32,uint8)"));

    for (const log of receipt.logs) {
      if (log.address.toLowerCase() === contractAddress.toLowerCase() && log.topics[0] === eventSignature) {
        const topic1 = log.topics[1];
        if (topic1) {
          const agentId = BigInt(topic1).toString();
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setMintedAgentId(agentId);
          console.log(`[Mint] Agent minted with ID: ${agentId}`);
        }
        break;
      }
    }
  }, [receipt, contractAddress]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        // Validate it is valid JSON
        JSON.parse(content);
        setGenomeJson(content);
        setError(null);
      } catch {
        setError("Invalid JSON file");
      }
    };
    reader.readAsText(file);
    // Reset input so the same file can be uploaded again if needed
    event.target.value = "";
  };

  function updateStep(step: string, status: StepStatus) {
    setSteps((current) => ({ ...current, [step]: status }));
  }

  function handleSpeciesChange(nextSpecies: AgentSpecies) {
    setSpecies(nextSpecies);
    setGenomeJson(JSON.stringify(GENOME_TEMPLATES[nextSpecies].config, null, 2));
    setUpload(null);
    setError(null);
  }

  async function handleMint() {
    setError(null);
    setUpload(null);
    setSteps({ validate: "active", encrypt: "idle", upload: "idle", mint: "idle" });

    try {
      if (!isConnected || !address) {
        throw new Error("Connect a wallet before minting a Genesis Agent ID.");
      }
      if (!contractAddress) {
        throw new Error("Missing NEXT_PUBLIC_AGENT_ID_CONTRACT. Deploy contracts and set .env.local first.");
      }
      JSON.parse(genomeJson);
      updateStep("validate", "done");

      updateStep("encrypt", "active");
      const encryptedPayload = await encryptGenome(genomeJson, species);
      updateStep("encrypt", "done");

      updateStep("upload", "active");
      const response = await fetch("/api/storage/upload-genome", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ encryptedPayload }),
      });
      const uploadResponse = (await response.json()) as UploadResponse;
      if (!response.ok || uploadResponse.error) {
        throw new Error(uploadResponse.error ?? "0G Storage upload failed");
      }
      setUpload(uploadResponse);
      updateStep("upload", "done");

      updateStep("mint", "active");
      await writeContractAsync({
        address: contractAddress,
        abi: erc7857AgentIdAbi,
        functionName: "mintGenesis",
        args: [uploadResponse.rootHash, GENOME_TEMPLATES[species].speciesType],
        value: parseEther(stake || "0"),
      });
      updateStep("mint", "done");
    } catch (caught) {
      const message = formatError(caught);
      setError(message);
      setSteps((current) => {
        const next = { ...current };
        const active = Object.entries(next).find(([, status]) => status === "active");
        if (active) next[active[0]] = "error";
        return next;
      });
    }
  }

  const busy = isPending || isConfirming || Object.values(steps).includes("active");

  const stepIcons: Record<string, React.ReactNode> = {
    validate: <ShieldAlert size={16} />,
    encrypt: <Lock size={16} />,
    upload: <Database size={16} />,
    mint: <Rocket size={16} />,
  };

  const stepLabels: Record<string, string> = {
    validate: "Validate",
    encrypt: "Encrypt",
    upload: "Upload",
    mint: "Mint",
  };

  const stepStatusColor = (key: string): string => {
    const s = steps[key];
    if (s === "done") return "rgba(139,92,246,0.7)";
    if (s === "error") return "#ef4444";
    if (s === "active") return "#8B5CF6";
    return "rgba(255,255,255,0.25)";
  };

  const stepBgColor = (key: string): string => {
    const s = steps[key];
    if (s === "done") return "rgba(139,92,246,0.12)";
    if (s === "error") return "rgba(239,68,68,0.12)";
    if (s === "active") return "rgba(139,92,246,0.08)";
    return "rgba(255,255,255,0.02)";
  };

  const stepBorderColor = (key: string): string => {
    const s = steps[key];
    if (s === "done") return "rgba(139,92,246,0.5)";
    if (s === "error") return "rgba(239,68,68,0.5)";
    if (s === "active") return "rgba(139,92,246,0.5)";
    return "rgba(255,255,255,0.06)";
  };

  const isValidJson = (() => {
    try { JSON.parse(genomeJson); return true; }
    catch { return false; }
  })();

  return (
    <>
      <div
        className="grid gap-6"
        style={{
          gridTemplateColumns: "1fr 1fr",
          alignItems: "stretch",
        }}
      >
        {/* LEFT COLUMN — Species Selection */}
        <div className="flex flex-col gap-4">
          <div
            className="flex-1 overflow-y-auto"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            {speciesOrder.map((key) => (
              <SpeciesCard
                key={key}
                species={key}
                selected={species === key}
                onClick={() => handleSpeciesChange(key)}
              />
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN — Mission Control Config Panel */}
        <div
          className="flex flex-col gap-6"
          style={{
            background: "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
            borderRadius: "28px",
            border: "1px solid rgba(255,255,255,0.08)",
            padding: "28px",
          }}
        >
          {/* Panel Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <p className="text-[11px] font-medium tracking-[2px] uppercase text-[rgba(255,255,255,0.4)]">
                  Mission Control
                </p>
                <span
                  style={{
                    fontSize: "9px",
                    color: "#8B5CF6",
                    background: "rgba(139,92,246,0.12)",
                    border: "1px solid rgba(139,92,246,0.25)",
                    borderRadius: "4px",
                    padding: "1px 6px",
                    fontFamily: "monospace",
                    letterSpacing: "1px",
                    fontWeight: 700,
                  }}
                >
                  ERC-7857 iNFT
                </span>
              </div>
              <h2 className="text-[22px] font-semibold tracking-[-0.5px] text-white">
                Genome Configuration
              </h2>
              <p className="mt-1 text-[13px] text-[#A1A1AA]">
                {SPECIES_INFO[species].name} &middot; {SPECIES_INFO[species].domain}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <FileKey2 size={22} style={{ color: "rgba(139,92,246,0.6)" }} />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-[8px] border border-[rgba(139,92,246,0.2)] bg-[rgba(139,92,246,0.05)] px-2.5 py-1 text-[11px] font-medium text-[#8B5CF6] hover:bg-[rgba(139,92,246,0.1)] transition-all duration-200"
              >
                <Upload size={12} />
                Upload JSON
              </button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".json,application/json"
                onChange={handleFileUpload}
              />
            </div>
          </div>

          {/* INFT info strip */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "8px",
            }}
          >
            {[
              { label: "AES-256-GCM", sub: "Encrypted genome" },
              { label: "TEE Oracle", sub: "Secure re-encryption" },
              { label: "0G Storage", sub: "Permanent metadata" },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  background: "rgba(139,92,246,0.05)",
                  border: "1px solid rgba(139,92,246,0.12)",
                  borderRadius: "12px",
                  padding: "10px 12px",
                  textAlign: "center",
                }}
              >
                <p style={{ fontSize: "11px", color: "rgba(139,92,246,0.8)", fontWeight: 600 }}>{item.label}</p>
                <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", marginTop: "2px" }}>{item.sub}</p>
              </div>
            ))}
          </div>

          {/* Test button + validation */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setTestModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-[10px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-3.5 py-2 text-[13px] text-[#A1A1AA] hover:text-white hover:bg-[rgba(255,255,255,0.06)] transition-all duration-200"
            >
              <FlaskConical size={14} />
              Test Configuration
            </button>
            <span
              className={`inline-flex items-center gap-1 text-[11px] ${
                isValidJson ? "text-[rgba(139,92,246,0.7)]" : "text-[#ef4444]"
              }`}
            >
              {isValidJson ? (
                <><CheckCircle2 size={12} /> Valid JSON</>
              ) : (
                <><XCircle size={12} /> Invalid JSON</>
              )}
            </span>
          </div>

          {/* Genome Editor */}
          <textarea
            value={genomeJson}
            onChange={(event) => setGenomeJson(event.target.value)}
            spellCheck={false}
            style={{
              width: "100%",
              minHeight: "220px",
              flex: 1,
              background: "#09090B",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "20px",
              padding: "20px",
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: "14px",
              lineHeight: "1.7",
              color: "rgba(255,255,255,0.88)",
              outline: "none",
              resize: "vertical",
            }}
            className="transition-all duration-200 focus:border-[rgba(139,92,246,0.4)]"
          />

          {/* Status Steps Grid */}
          <div
            className="grid gap-3"
            style={{
              gridTemplateColumns: "repeat(4, 1fr)",
            }}
          >
            {["validate", "encrypt", "upload", "mint"].map((key) => (
              <div
                key={key}
                style={{
                  background: stepBgColor(key),
                  border: `1px solid ${stepBorderColor(key)}`,
                  borderRadius: "18px",
                  padding: "18px",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                <div style={{ color: stepStatusColor(key) }}>
                  {stepIcons[key]}
                </div>
                <p className="mt-2 text-sm text-[rgba(255,255,255,0.8)] font-medium">{stepLabels[key]}</p>
                <p
                  className="mt-1 text-[10px] font-mono uppercase tracking-[0.16em]"
                  style={{ color: stepStatusColor(key) }}
                >
                  {steps[key]}
                </p>
              </div>
            ))}
          </div>

          {/* Upload info */}
          {upload ? (
            <div
              className="rounded-2xl p-4"
              style={{
                background: "rgba(139,92,246,0.06)",
                border: "1px solid rgba(139,92,246,0.15)",
              }}
            >
              <p className="text-[11px] font-medium tracking-[2px] uppercase text-[rgba(139,92,246,0.5)] mb-2">
                0G Storage Root
              </p>
              <ExplorerLinkWrapper
                value={upload.rootHash}
                type="storage"
              />
            </div>
          ) : null}

          {/* Encryption info */}
          {steps.encrypt === "done" && !upload && (
            <div
              className="rounded-2xl p-4 space-y-1"
              style={{
                background: "rgba(139,92,246,0.06)",
                border: "1px solid rgba(139,92,246,0.15)",
              }}
            >
              <p className="flex items-center gap-1.5 text-sm text-[rgba(139,92,246,0.8)]">
                <Lock size={12} /> AES-256-GCM Encryption
              </p>
              <p className="text-[13px] text-[#A1A1AA]">Key wrapped for TEE-only decryption</p>
            </div>
          )}

          {/* Mint Confirmation */}
          {hash ? (
            <div
              className="rounded-2xl p-5 space-y-3"
              style={{
                background: "rgba(139,92,246,0.08)",
                border: "1px solid rgba(139,92,246,0.2)",
              }}
            >
              <p className="inline-flex items-center gap-2 text-sm text-[#8B5CF6]">
                <CheckCircle2 size={16} />
                {isConfirmed ? "Genesis Agent ID confirmed" : "Genesis mint submitted"}
              </p>
              <ExplorerLinkWrapper value={hash} />
              {mintedAgentId && (
                <div className="pt-3 border-t border-[rgba(139,92,246,0.15)] space-y-3">
                  <p className="text-[13px] text-[#A1A1AA]">Agent ID: #{mintedAgentId}</p>
                  <Link
                    href={`/dashboard/agents/${mintedAgentId}`}
                    className="inline-flex items-center gap-1.5 rounded-[12px] bg-[#8B5CF6] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#7C3AED] transition-all duration-200"
                  >
                    <ExternalLink size={14} />
                    View Agent Dashboard
                  </Link>
                </div>
              )}
            </div>
          ) : null}

          {/* Error */}
          {error ? (
            <div
              className="rounded-2xl p-4 text-sm"
              style={{
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.2)",
                color: "#ef4444",
              }}
            >
              {error}
            </div>
          ) : null}

          {/* CTA Button */}
          <ActionButton
            type="button"
            onClick={handleMint}
            disabled={busy || !isConnected}
            className="w-full"
          >
            {busy ? "Processing Genesis Mint" : "Encrypt, Upload & Mint Genesis"}
          </ActionButton>
        </div>
      </div>

      <SpeciesTestModal
        species={species}
        config={GENOME_TEMPLATES[species].config}
        open={testModalOpen}
        onOpenChange={setTestModalOpen}
      />
    </>
  );
}
