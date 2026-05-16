import type { AgentSpecies } from "@/types";

interface SpeciesDemo {
  preview: string;
  requirements: string[];
}

export const SPECIES_DEMO_OUTPUTS: Record<AgentSpecies, SpeciesDemo> = {
  "alpha-hunter": {
    preview: "ETH/USDC → BUY (87% confidence)\nReasoning: Bullish sentiment spike + whale accumulation detected across 4 sources.",
    requirements: ["0G Compute TEE", "0G Storage KV", "Twitter/Discord APIs"],
  },
  "code-weaver": {
    preview: "Contract: 0x71c...9e3\n3 vulnerabilities found\nCRITICAL: Reentrancy (Line 142)",
    requirements: ["0G Compute TEE", "Solidity Analyzer", "Vuln DB (on-chain)"],
  },
  "game-master": {
    preview: "Match #284 | Move 42\nCounter-attack selected\nStrategy: Defensive bait (81% confidence)",
    requirements: ["0G Compute TEE", "Opponent DB", "Strategy Oracle"],
  },
  "docu-mind": {
    preview: "NDA_v3.pdf | 12 clauses extracted\n2 HIGH risk flags\nNon-compete: 24mo vs 6mo standard",
    requirements: ["0G Compute TEE", "Legal Template DB", "Jurisdiction Maps"],
  },
  "oracle-keeper": {
    preview: "ETH/USDC: $3,247.56\n12 sources | 2 outliers rejected\nManipulation risk: LOW",
    requirements: ["0G Compute TEE", "CEX/DEX Feeds", "ZK Prover"],
  },
  "social-synth": {
    preview: "Thread: 'Why TEE matters for AI'\nPredicted engagement: 76%\nTone: educational",
    requirements: ["0G Compute TEE", "Trending DB", "Engagement Oracle"],
  },
};
