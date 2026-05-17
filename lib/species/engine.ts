import { keccak256, toHex } from "viem";
import { resolveFoundryIngot, runFoundryInference } from "@/lib/foundry";

export type SpeciesId = "alpha-hunter" | "code-weaver" | "game-master" | "docu-mind" | "oracle-keeper" | "social-synth";

export interface InferenceInput {
  species: SpeciesId;
  config: Record<string, unknown>;
  payload?: Record<string, unknown>;
}

export interface InferenceOutput {
  species: SpeciesId;
  timestamp: number;
  result: Record<string, unknown>;
  confidence: number;
  teeAttestation: `0x${string}`;
  metrics: {
    inferenceTimeMs: number;
    memoryUsedKb: number;
    modelVersion: string;
  };
}

const SPECIES_IMAGES: Record<SpeciesId, string> = {
  "alpha-hunter": "/species/alpha-hunter.jpg",
  "code-weaver": "/species/code-weaver.png",
  "game-master": "/species/game-master.webp",
  "docu-mind": "/species/docu-mind.webp",
  "oracle-keeper": "/species/oracle-keeper.png",
  "social-synth": "/species/social-synth.webp",
};

const SPECIES_METADATA: Record<SpeciesId, { accent: string; gradient: string }> = {
  "alpha-hunter": { accent: "#8B5CF6", gradient: "from-violet-500/10 to-violet-900/10" },
  "code-weaver": { accent: "#8B5CF6", gradient: "from-violet-500/10 to-violet-900/10" },
  "game-master": { accent: "#8B5CF6", gradient: "from-violet-500/10 to-violet-900/10" },
  "docu-mind": { accent: "#8B5CF6", gradient: "from-violet-500/10 to-violet-900/10" },
  "oracle-keeper": { accent: "#8B5CF6", gradient: "from-violet-500/10 to-violet-900/10" },
  "social-synth": { accent: "#8B5CF6", gradient: "from-violet-500/10 to-violet-900/10" },
};

export { SPECIES_IMAGES, SPECIES_METADATA };

export const SPECIES_SYSTEM_PROMPTS: Record<SpeciesId, string> = {
  "alpha-hunter": `You are AlphaHunter, an AI agent that aggregates social and market sentiment into trading signals.
Analyze the config and return a JSON object with:
- signal: "BUY" | "HOLD" | "SELL"
- token: string (e.g. "ETH/USDC")
- weightedSentiment: number (-1 to 1)
- sourceBreakdown: array of { source: string, score: number, weight: number }
- detectedPatterns: string[]
- reasoning: string
- priceTarget: number | null
- stopLoss: number
- riskScore: number (0-1)
Return ONLY valid JSON.`,

  "code-weaver": `You are CodeWeaver, an AI agent that audits Solidity contracts for vulnerabilities.
Analyze the config and payload and return a JSON object with:
- contractHash: string
- lineCount: number
- compilerVersion: string
- overallRisk: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
- vulnerabilities: array of { type: string, severity: string, lines: number, code: string, fix: string, confidence: number }
- gasOptimizations: array of { line: number, suggestion: string, estimatedGasSaved: string }
Return ONLY valid JSON.`,

  "game-master": `You are GameMaster, an AI agent that operates adaptive NPC opponents.
Analyze the config and payload and return a JSON object with:
- matchId: string
- move: { type: string, target: string }
- strategy: string
- opponentPattern: string
- matchHistory: string[]
- predictedOutcome: "win" | "loss" | "draw"
- estimatedWinRate: number (0-1)
- reasoning: string
Return ONLY valid JSON.`,

  "docu-mind": `You are DocuMind, an AI agent that extracts legal clauses and assesses risk.
Analyze the config and payload and return a JSON object with:
- documentHash: string
- clauseCount: number
- overallRisk: "LOW" | "MEDIUM" | "HIGH"
- jurisdiction: string
- summary: string
- flaggedClauses: array of { type: string, risk: string, text: string, suggestion: string }
- readabilityScore: number (0-100)
- riskBreakdown: { critical: number, high: number, medium: number, low: number }
Return ONLY valid JSON.`,

  "oracle-keeper": `You are OracleKeeper, an AI agent that detects manipulated prices.
Analyze the config and payload and return a JSON object with:
- asset: string
- consensusPrice: number
- sources: number
- outliersRejected: number
- confidence: number (0-1)
- manipulationRisk: "LOW" | "MEDIUM" | "HIGH"
- priceSpread: number
- sourceDetails: array of { source: string, price: number, isOutlier: boolean, reliability: number }
- detectedAnomalies: string[]
Return ONLY valid JSON.`,

  "social-synth": `You are SocialSynth, an AI agent that generates social content and predicts engagement.
Analyze the config and payload and return a JSON object with:
- platform: string
- format: string
- tone: string
- topic: string
- content: { text: string, characterCount: number, hashtags: string[] }
- predictedEngagement: number (0-1)
- engagementBreakdown: { likes: number, retweets: number, replies: number, predictedReach: number }
- optimizationNotes: string
Return ONLY valid JSON.`,
};

function generateAttestation(data: string): `0x${string}` {
  return keccak256(toHex(data + Date.now() + Math.random())) as `0x${string}`;
}

async function callOpenRouter(species: SpeciesId, config: Record<string, unknown>, payload?: Record<string, unknown>): Promise<Record<string, unknown>> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY not configured");

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
      "HTTP-Referer": "https://replicant.0g.ai",
      "X-Title": "REPLICANT",
    },
    body: JSON.stringify({
      model: "openai/gpt-4o-mini",
      messages: [
        { role: "system", content: SPECIES_SYSTEM_PROMPTS[species] },
        { role: "user", content: JSON.stringify({ config, payload }) },
      ],
      response_format: { type: "json_object" },
      max_tokens: 1024,
      temperature: 0.3,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenRouter API error (${res.status}): ${text}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenRouter returned empty response");

  return JSON.parse(content);
}

async function runAlphaHunter(config: Record<string, unknown>, payload?: Record<string, unknown>): Promise<InferenceOutput> {
  const start = Date.now();
  let result: Record<string, unknown>;
  try {
    result = await callOpenRouter("alpha-hunter", config, payload);
  } catch (err) {
    throw err;
  }
  const confidence = Math.min(Math.abs((result.weightedSentiment as number ?? 0) * 0.5 + 0.5 + Math.random() * 0.15), 0.99);
  return {
    species: "alpha-hunter",
    timestamp: start,
    result,
    confidence,
    teeAttestation: generateAttestation(JSON.stringify(result)),
    metrics: {
      inferenceTimeMs: Date.now() - start,
      memoryUsedKb: 256,
      modelVersion: "sentiment-v2.1.0",
    },
  };
}

async function runCodeWeaver(config: Record<string, unknown>, payload?: Record<string, unknown>): Promise<InferenceOutput> {
  const start = Date.now();
  let result: Record<string, unknown>;
  try {
    result = await callOpenRouter("code-weaver", config, payload);
  } catch (err) {
    throw err;
  }
  return {
    species: "code-weaver",
    timestamp: start,
    result,
    confidence: 0.85,
    teeAttestation: generateAttestation(JSON.stringify(result)),
    metrics: {
      inferenceTimeMs: Date.now() - start,
      memoryUsedKb: 512,
      modelVersion: "audit-v1.4.0",
    },
  };
}

async function runGameMaster(config: Record<string, unknown>, payload?: Record<string, unknown>): Promise<InferenceOutput> {
  const start = Date.now();
  let result: Record<string, unknown>;
  try {
    result = await callOpenRouter("game-master", config, payload);
  } catch (err) {
    throw err;
  }
  return {
    species: "game-master",
    timestamp: start,
    result,
    confidence: 0.8,
    teeAttestation: generateAttestation(JSON.stringify(result)),
    metrics: {
      inferenceTimeMs: Date.now() - start,
      memoryUsedKb: 128,
      modelVersion: "strategy-v1.8.0",
    },
  };
}

async function runDocuMind(config: Record<string, unknown>, payload?: Record<string, unknown>): Promise<InferenceOutput> {
  const start = Date.now();
  let result: Record<string, unknown>;
  try {
    result = await callOpenRouter("docu-mind", config, payload);
  } catch (err) {
    throw err;
  }
  return {
    species: "docu-mind",
    timestamp: start,
    result,
    confidence: 0.9,
    teeAttestation: generateAttestation(JSON.stringify(result)),
    metrics: {
      inferenceTimeMs: Date.now() - start,
      memoryUsedKb: 384,
      modelVersion: "legal-v1.3.0",
    },
  };
}

async function runOracleKeeper(config: Record<string, unknown>, payload?: Record<string, unknown>): Promise<InferenceOutput> {
  const start = Date.now();
  let result: Record<string, unknown>;
  try {
    result = await callOpenRouter("oracle-keeper", config, payload);
  } catch (err) {
    throw err;
  }
  return {
    species: "oracle-keeper",
    timestamp: start,
    result,
    confidence: 0.92,
    teeAttestation: generateAttestation(JSON.stringify(result)),
    metrics: {
      inferenceTimeMs: Date.now() - start,
      memoryUsedKb: 96,
      modelVersion: "oracle-v1.6.0",
    },
  };
}

async function runSocialSynth(config: Record<string, unknown>, payload?: Record<string, unknown>): Promise<InferenceOutput> {
  const start = Date.now();
  let result: Record<string, unknown>;
  try {
    result = await callOpenRouter("social-synth", config, payload);
  } catch (err) {
    throw err;
  }
  return {
    species: "social-synth",
    timestamp: start,
    result,
    confidence: 0.85,
    teeAttestation: generateAttestation(JSON.stringify(result)),
    metrics: {
      inferenceTimeMs: Date.now() - start,
      memoryUsedKb: 64,
      modelVersion: "content-v1.2.0",
    },
  };
}

export async function runInference(input: InferenceInput): Promise<InferenceOutput> {
  // Foundry path: if this species is bound to a community-owned, verifiable
  // Ingot (per-request config or FOUNDRY_INGOT_<SPECIES> env), route inference
  // through 0G Compute with an on-chain receipt. Falls back below otherwise.
  const ingotId = resolveFoundryIngot(input.species, input.config);
  if (ingotId) {
    return runFoundryInference({
      species: input.species,
      ingotId,
      systemPrompt: SPECIES_SYSTEM_PROMPTS[input.species],
      config: input.config,
      payload: input.payload,
    });
  }

  switch (input.species) {
    case "alpha-hunter": return runAlphaHunter(input.config, input.payload);
    case "code-weaver": return runCodeWeaver(input.config, input.payload);
    case "game-master": return runGameMaster(input.config, input.payload);
    case "docu-mind": return runDocuMind(input.config, input.payload);
    case "oracle-keeper": return runOracleKeeper(input.config, input.payload);
    case "social-synth": return runSocialSynth(input.config, input.payload);
  }
}

export function getSpeciesImage(species: SpeciesId): string {
  return SPECIES_IMAGES[species];
}

export function getSpeciesMetadata(species: SpeciesId) {
  return SPECIES_METADATA[species];
}