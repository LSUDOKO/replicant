/**
 * Foundry Protocol integration.
 *
 * Replicant's pitch is decentralized, verifiable, owned AI — but species
 * inference currently runs through centralized OpenRouter (GPT-4o-mini).
 * Foundry closes that gap: route a species through a community-owned,
 * revenue-generating model (an "Ingot") served over 0G Compute, with an
 * on-chain inference + revenue receipt instead of a synthetic attestation.
 *
 * Wiring is opt-in and non-breaking. A species runs through Foundry only
 * when an Ingot id is resolved for it (per-request `config.foundryIngot`
 * or `FOUNDRY_INGOT_<SPECIES>` env). Otherwise the existing path is used.
 */

import { Foundry, getDeployment, type IngotId } from "@foundryprotocol/sdk";
import type { InferenceOutput, SpeciesId } from "@/lib/species/engine";

const ZERO32 =
  "0x0000000000000000000000000000000000000000000000000000000000000000" as const;

let _client: Foundry | null = null;

/** Lazily-built, read-only Foundry client pinned to 0G Aristotle mainnet. */
export function getFoundry(): Foundry {
  if (_client) return _client;
  _client = new Foundry({
    contracts: "aristotle",
    rpcUrl: process.env.FOUNDRY_RPC_URL ?? process.env.ZERO_G_MAINNET_RPC_URL,
    inferenceEndpoint: process.env.FOUNDRY_INFERENCE_ENDPOINT,
    inferenceApiKey: process.env.FOUNDRY_API_KEY,
  });
  return _client;
}

const ENV_KEY: Record<SpeciesId, string> = {
  "alpha-hunter": "FOUNDRY_INGOT_ALPHA_HUNTER",
  "code-weaver": "FOUNDRY_INGOT_CODE_WEAVER",
  "game-master": "FOUNDRY_INGOT_GAME_MASTER",
  "docu-mind": "FOUNDRY_INGOT_DOCU_MIND",
  "oracle-keeper": "FOUNDRY_INGOT_ORACLE_KEEPER",
  "social-synth": "FOUNDRY_INGOT_SOCIAL_SYNTH",
};

function normalizeIngot(raw: string): IngotId {
  const v = raw.trim();
  return (v.startsWith("ingot:") ? v : `ingot:${v}`) as IngotId;
}

/**
 * Resolve the Foundry Ingot backing a species, if any. Per-request config
 * (`config.foundryIngot`) wins over the species-level env binding.
 */
export function resolveFoundryIngot(
  species: SpeciesId,
  config: Record<string, unknown>,
): IngotId | null {
  const fromConfig = config?.foundryIngot;
  if (typeof fromConfig === "string" && fromConfig.trim()) {
    return normalizeIngot(fromConfig);
  }
  const fromEnv = process.env[ENV_KEY[species]];
  if (fromEnv && fromEnv.trim()) return normalizeIngot(fromEnv);
  return null;
}

/** True when at least one species is bound to a Foundry Ingot. */
export function isFoundryConfigured(): boolean {
  return Object.values(ENV_KEY).some((k) => !!process.env[k]?.trim());
}

const MODEL_VERSION: Record<SpeciesId, string> = {
  "alpha-hunter": "foundry-ingot/sentiment",
  "code-weaver": "foundry-ingot/audit",
  "game-master": "foundry-ingot/strategy",
  "docu-mind": "foundry-ingot/legal",
  "oracle-keeper": "foundry-ingot/oracle",
  "social-synth": "foundry-ingot/content",
};

/**
 * Run a species through a Foundry Ingot. Returns the same shape as the
 * built-in engine so callers and the UI are agnostic to the backend, but
 * `teeAttestation` is now a real on-chain inference tx hash and the
 * provenance receipt is attached under `result._foundry`.
 */
export async function runFoundryInference(args: {
  species: SpeciesId;
  ingotId: IngotId;
  systemPrompt: string;
  config: Record<string, unknown>;
  payload?: Record<string, unknown>;
}): Promise<InferenceOutput> {
  const { species, ingotId, systemPrompt, config, payload } = args;
  const foundry = getFoundry();
  const start = Date.now();

  const { output, receipt } = await foundry.inference.run(ingotId, {
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: JSON.stringify({ config, payload }) },
    ],
    temperature: 0.3,
    maxTokens: 1024,
  });

  let result: Record<string, unknown>;
  try {
    result = JSON.parse(output);
  } catch {
    result = { raw: output };
  }

  result._foundry = {
    ingotId,
    requestId: receipt.requestId,
    inferenceTxHash: receipt.inferenceTxHash ?? null,
    revenueTxHash: receipt.revenueTxHash ?? null,
    explorer: receipt.inferenceTxHash
      ? `https://chainscan.0g.ai/tx/${receipt.inferenceTxHash}`
      : null,
  };

  return {
    species,
    timestamp: start,
    result,
    confidence: 0.9,
    // A verifiable on-chain anchor — not a synthetic keccak of Date.now().
    teeAttestation: (receipt.inferenceTxHash ?? ZERO32) as `0x${string}`,
    metrics: {
      inferenceTimeMs: receipt.latencyMs || Date.now() - start,
      memoryUsedKb: 0,
      modelVersion: MODEL_VERSION[species],
    },
  };
}

export interface FoundryStatus {
  network: "aristotle";
  contracts: ReturnType<typeof getDeployment>;
  configuredSpecies: SpeciesId[];
}

/** Foundry deployment + which species are Ingot-backed. For the status API. */
export function foundryStatus(): FoundryStatus {
  const contracts = getDeployment("aristotle");
  const configuredSpecies = (Object.keys(ENV_KEY) as SpeciesId[]).filter(
    (s) => !!process.env[ENV_KEY[s]]?.trim(),
  );
  return { network: "aristotle", contracts, configuredSpecies };
}

/**
 * Lineage + revenue snapshot for a backing Ingot, so the UI can show
 * "this agent is backed by Foundry Ingot #N, revenue split on-chain".
 */
export async function ingotProvenance(tokenId: bigint) {
  const foundry = getFoundry();
  const [meta, lineage, totalRevenue, totalShares] = await Promise.all([
    foundry.ingot.meta(tokenId),
    foundry.lineage.get(tokenId),
    foundry.revenue.totalReceived(tokenId),
    foundry.ingot.sharesTotalIssued(tokenId),
  ]);
  return {
    tokenId: tokenId.toString(),
    weightsRoot: meta.weightsRoot,
    forge: meta.forge,
    hasLineageParent: lineage.parent !== ZERO32,
    lineageParent: lineage.parent,
    totalRevenueWei: totalRevenue.toString(),
    sharesTotalIssued: totalShares.toString(),
    agentId: foundry.ingot.agentId(tokenId),
  };
}
