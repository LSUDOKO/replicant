"use client";

import * as React from "react";
import { CheckCircle2, Database, FileKey2, Lock, Rocket, ShieldAlert } from "lucide-react";
import { BaseError, keccak256, parseEther, toHex, type Address, type Hash } from "viem";
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";

import { ExplorerLinkWrapper } from "@/components/shared/ExplorerLink";
import { ActionButton } from "@/components/ui/action-button";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
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

  const contractAddress = agentIdContractAddresses[publicEnv.network] as
    | Address
    | undefined;
  const { data: hash, isPending, writeContractAsync } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

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

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <div className="space-y-4">
        <GlassCard className="p-5">
          <p className="label-uppercase text-accent-evolution">Species</p>
          <div className="mt-4 grid gap-3">
            {speciesOrder.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => handleSpeciesChange(key)}
                data-active={species === key}
                className="rounded-2xl border border-border bg-surface/40 p-4 text-left transition-all duration-300 hover:border-accent-evolution/40 data-[active=true]:border-primary/40 data-[active=true]:bg-primary/10"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-heading text-sm text-foreground">
                      {SPECIES_INFO[key].name}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {SPECIES_INFO[key].domain}
                    </p>
                  </div>
                  <span className="font-mono text-xs text-accent-evolution">
                    Type {GENOME_TEMPLATES[key].speciesType}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <p className="label-uppercase text-accent-success">Mint Settings</p>
          <label className="mt-4 block space-y-2">
            <span className="text-sm text-muted-foreground">Stake in 0G</span>
            <Input
              value={stake}
              onChange={(event) => setStake(event.target.value)}
              inputMode="decimal"
              className="bg-surface"
            />
          </label>
          <div className="mt-4 rounded-xl border border-border bg-surface/40 p-3 text-xs text-muted-foreground">
            Contract:{" "}
            {contractAddress ? (
              <ExplorerLinkWrapper value={contractAddress} type="address" />
            ) : (
              <span className="text-accent-alert">not configured</span>
            )}
          </div>
        </GlassCard>
      </div>

      <div className="space-y-4">
        <GlassCard className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="label-uppercase text-accent-evolution">Encrypted Genome</p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight">
                Genesis Configuration
              </h2>
            </div>
            <FileKey2 className="text-accent-evolution" size={22} />
          </div>
          <textarea
            value={genomeJson}
            onChange={(event) => setGenomeJson(event.target.value)}
            spellCheck={false}
            className="mt-5 min-h-[360px] w-full rounded-2xl border border-border bg-background/70 p-4 font-mono text-xs leading-relaxed text-foreground outline-none transition-colors focus:border-accent-evolution/60"
          />
        </GlassCard>

        <GlassCard className="p-5">
          <div className="grid gap-3 sm:grid-cols-4">
            {[
              ["validate", "Validate", ShieldAlert],
              ["encrypt", "Encrypt", Lock],
              ["upload", "0G Upload", Database],
              ["mint", "Mint", Rocket],
            ].map(([key, label, Icon]) => (
              <div
                key={key as string}
                className="rounded-xl border border-border bg-surface/40 p-3"
              >
                <Icon
                  size={16}
                  className={
                    steps[key as string] === "done"
                      ? "text-primary"
                      : steps[key as string] === "error"
                        ? "text-accent-alert"
                        : steps[key as string] === "active"
                          ? "text-accent-evolution"
                          : "text-muted-foreground"
                  }
                />
                <p className="mt-2 text-sm">{label as string}</p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  {steps[key as string]}
                </p>
              </div>
            ))}
          </div>

          {upload ? (
            <div className="mt-5 rounded-xl border border-border bg-surface/40 p-4">
              <p className="label-uppercase text-muted-foreground">0G Storage Root</p>
              <ExplorerLinkWrapper
                value={upload.rootHash}
                type="storage"
                className="mt-2 text-accent-evolution"
              />
            </div>
          ) : null}

          {hash ? (
            <div className="mt-5 rounded-xl border border-primary/20 bg-primary/10 p-4">
              <p className="inline-flex items-center gap-2 text-sm text-primary">
                <CheckCircle2 size={16} />
                {isConfirmed ? "Genesis Agent ID confirmed" : "Genesis mint submitted"}
              </p>
              <ExplorerLinkWrapper value={hash} className="mt-2 text-primary" />
            </div>
          ) : null}

          {error ? (
            <div className="mt-5 rounded-xl border border-accent-alert/30 bg-accent-alert/10 p-4 text-sm text-accent-alert">
              {error}
            </div>
          ) : null}

          <ActionButton
            type="button"
            onClick={handleMint}
            disabled={busy || !isConnected}
            className="mt-5 w-full"
          >
            {busy ? "Processing Genesis Mint" : "Encrypt, Upload & Mint Genesis"}
          </ActionButton>
        </GlassCard>
      </div>
    </div>
  );
}
