import type { AgentSpecies, AgentStatus, SpeciesInfo } from "@/types";

export const SPECIES_INFO: Record<AgentSpecies, SpeciesInfo> = {
  "alpha-hunter": {
    id: "alpha-hunter",
    name: "AlphaHunter",
    domain: "DeFi/Trading",
    description:
      "Crypto sentiment analysis and trading signals. Scrapes social feeds, generates BUY/HOLD/SELL signals, and tracks accuracy.",
    evolutionTrigger: "Accuracy < 60% for 50 predictions",
    demoLine:
      "This agent predicted 8 of 10 pumps. When it started failing, it evolved a better model autonomously.",
  },
  "code-weaver": {
    id: "code-weaver",
    name: "CodeWeaver",
    domain: "Security",
    description:
      "Smart contract audit and vulnerability detection. Analyzes Solidity, flags risks, and compares to exploit databases.",
    evolutionTrigger: "False negative > 5%",
    demoLine:
      "We hid a reentrancy bug. Gen-1 missed it. Gen-2 caught it. The mutation was sealed.",
  },
  "game-master": {
    id: "game-master",
    name: "GameMaster",
    domain: "Gaming",
    description:
      "Evolving NPC for blockchain games. Plays against users, learns from losses, and adapts strategy autonomously.",
    evolutionTrigger: "Win rate < 40% for 100 games",
    demoLine:
      "Players beat Gen-1 in 3 days. Gen-5 is undefeated. Each generation is an NFT.",
  },
  "docu-mind": {
    id: "docu-mind",
    name: "DocuMind",
    domain: "Enterprise",
    description:
      "Legal contract analysis and clause extraction. Reads documents, extracts risky clauses, compares to standards.",
    evolutionTrigger: "Client reports missed clause",
    demoLine:
      "A firm missed a liability clause. Gen-3 caught it. The agent fixed itself overnight.",
  },
  "oracle-keeper": {
    id: "oracle-keeper",
    name: "OracleKeeper",
    domain: "Infrastructure",
    description:
      "Decentralized price feed and manipulation detection. Aggregates 10+ sources, detects anomalies, publishes on-chain.",
    evolutionTrigger: "Incorrect price during manipulation event",
    demoLine:
      "During a flash loan attack, Gen-1 published bad data. Gen-2 detected the pattern and refused.",
  },
  "social-synth": {
    id: "social-synth",
    name: "SocialSynth",
    domain: "SocialFi",
    description:
      "AI content creator with evolving style. Generates content, tracks engagement, and adapts tone and format.",
    evolutionTrigger: "Engagement rate < 2% for 20 posts",
    demoLine:
      "This agent started as a boring explainer. Gen-4 is a meme lord with 50K followers.",
  },
};

export const STATUS_COLORS: Record<AgentStatus, string> = {
  active: "text-success bg-success/10 border-success/20",
  archived: "text-muted-foreground bg-muted/50 border-muted-foreground/20",
  slashed: "text-destructive bg-destructive/10 border-destructive/20",
  evolving: "text-cyan bg-cyan/10 border-cyan/20",
};

export const STATUS_DOT_COLORS: Record<AgentStatus, string> = {
  active: "bg-success",
  archived: "bg-muted-foreground",
  slashed: "bg-destructive",
  evolving: "bg-cyan",
};

export const OG_COMPONENTS = [
  {
    name: "0G Compute (TEE)",
    description: "Intel TDX + NVIDIA H100 sealed enclaves for inference and evolution",
    feature: "Evolution Chamber",
  },
  {
    name: "0G Storage (Log)",
    description: "Permanent genome archive, immutable evolution logs",
    feature: "Memory & Lineage",
  },
  {
    name: "0G Storage (KV)",
    description: "Real-time agent working memory, millisecond queries",
    feature: "Live Metrics",
  },
  {
    name: "Agent ID (ERC-7857)",
    description: "iNFT standard for agent identity, ownership, and cloning",
    feature: "All Identity",
  },
  {
    name: "AI Alignment Nodes",
    description: "Real-time drift, bias, and anomaly monitoring with auto-slashing",
    feature: "Safety Layer",
  },
  {
    name: "0G Chain",
    description: "Sub-second finality for slashing, royalties, and subscriptions",
    feature: "Economic Layer",
  },
];
