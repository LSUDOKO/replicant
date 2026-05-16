export type Platform = "twitter" | "farcaster" | "lens" | "discord";
export type ContentFormat = "thread" | "single" | "meme" | "reply" | "poll" | "long_form";
export type Tone = "hype" | "educational" | "humorous" | "controversial" | "inspirational" | "cautionary" | "technical" | "neutral";
export type Strategy = "viral" | "educational" | "engagement" | "authority" | "community";
export type ContentStatus = "generated" | "published" | "tracking";
export type Sentiment = "positive" | "neutral" | "negative";

export interface ContentPiece {
  id: string;
  platform: Platform;
  format: ContentFormat;
  content: string | string[];
  hook: string;
  hashtags: string[];
  tone: Tone;
  strategy: Strategy;
  predictedEngagement: number;
  teeAttestation: string;
  timestamp: number;
  status: ContentStatus;
}

export interface PerformanceMetrics {
  contentId: string;
  impressions: number;
  likes: number;
  retweets: number;
  replies: number;
  engagementRate: number;
  viralScore: number;
  sentiment: Sentiment;
}

export interface ToneProfile {
  name: Tone;
  label: string;
  characteristics: string[];
  vocabulary: string[];
  emojiUsage: "heavy" | "moderate" | "minimal";
  formality: number;
  color: string;
}

export const TONE_PROFILES: ToneProfile[] = [
  { name: "hype", label: "Hype", characteristics: ["energetic", "urgent", "fomo-inducing"], vocabulary: ["moon", "rocket", "gem", "alpha", "wagmi", "lfg", "based"], emojiUsage: "heavy", formality: 2, color: "#C026D3" },
  { name: "educational", label: "Educational", characteristics: ["informative", "structured", "data-driven"], vocabulary: ["breakdown", "analysis", "research", "thread", "how it works"], emojiUsage: "minimal", formality: 7, color: "#8B5CF6" },
  { name: "humorous", label: "Humorous", characteristics: ["witty", "self-deprecating", "relatable"], vocabulary: ["meme", "joke", "funny", "rekt", "plot twist"], emojiUsage: "moderate", formality: 3, color: "#D946EF" },
  { name: "controversial", label: "Controversial", characteristics: ["provocative", "opinionated", "polarizing"], vocabulary: ["hot take", "unpopular opinion", "actually", "heresy"], emojiUsage: "minimal", formality: 5, color: "#F43F5E" },
  { name: "inspirational", label: "Inspirational", characteristics: ["motivational", "visionary", "community-focused"], vocabulary: ["journey", "build", "future", "believe", "impact", "together"], emojiUsage: "moderate", formality: 6, color: "#A855F7" },
  { name: "cautionary", label: "Cautionary", characteristics: ["warning", "protective", "risk-aware"], vocabulary: ["be careful", "red flag", "risk", "dyor", "nfa"], emojiUsage: "minimal", formality: 7, color: "#FB923C" },
  { name: "technical", label: "Technical", characteristics: ["precise", "code-focused", "developer-oriented"], vocabulary: ["solidity", "gas optimization", "MEV", "zero-knowledge", "architecture"], emojiUsage: "minimal", formality: 8, color: "#6366F1" },
  { name: "neutral", label: "Neutral", characteristics: ["balanced", "objective"], vocabulary: ["interesting", "notable", "observed"], emojiUsage: "minimal", formality: 5, color: "#A78BFA" },
];

export interface AgentStats {
  totalGenerations: number;
  totalPublications: number;
  avgEngagement: number;
  currentStreak: number;
  bestStreak: number;
  dominantTone: Tone;
  dominantFormat: ContentFormat;
}

export interface GenerateRequest {
  topic: string;
  platform: Platform;
  tone: Tone;
  strategy: Strategy;
  format?: ContentFormat;
}

export const PLATFORMS: { id: Platform; name: string; color: string }[] = [
  { id: "twitter", name: "Twitter/X", color: "#8B5CF6" },
  { id: "farcaster", name: "Farcaster", color: "#D946EF" },
  { id: "lens", name: "Lens", color: "#A855F7" },
  { id: "discord", name: "Discord", color: "#A78BFA" },
];

export const STRATEGIES: { id: Strategy; name: string; desc: string }[] = [
  { id: "viral", name: "Viral", desc: "Maximize reach and shares" },
  { id: "educational", name: "Educational", desc: "Build authority with threads" },
  { id: "engagement", name: "Engagement", desc: "Drive replies and discussion" },
  { id: "authority", name: "Authority", desc: "Establish thought leadership" },
  { id: "community", name: "Community", desc: "Foster community interaction" },
];

export const FORMATS: { id: ContentFormat; name: string; desc: string }[] = [
  { id: "thread", name: "Thread", desc: "Multi-part narrative" },
  { id: "single", name: "Single Post", desc: "Quick take" },
  { id: "meme", name: "Meme", desc: "Humorous image text" },
  { id: "reply", name: "Reply", desc: "Engagement reply" },
  { id: "poll", name: "Poll", desc: "Audience question" },
];
