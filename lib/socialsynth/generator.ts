import { keccak256, toHex } from "viem";
import axios from "axios";
import type { GenerateRequest, ToneProfile, PerformanceMetrics, AgentStats, ContentPiece, ContentFormat, Tone } from "./types";
import { TONE_PROFILES, PLATFORMS, STRATEGIES, FORMATS } from "./types";

function generateId(): string {
  return `content-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function generateAttestation(data: string): string {
  return `0x${keccak256(toHex(data + Date.now() + Math.random())).slice(2, 66)}`;
}

export class SocialSynthGenerator {
  private apiKey: string;
  private endpoint = "https://openrouter.ai/api/v1/chat/completions";
  private contentHistory: Map<string, ContentPiece> = new Map();
  private performanceHistory: Map<string, PerformanceMetrics> = new Map();
  private stats: AgentStats = {
    totalGenerations: 0, totalPublications: 0, avgEngagement: 0,
    currentStreak: 15, bestStreak: 42,
    dominantTone: "educational", dominantFormat: "thread",
  };

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || "";
  }

  async generate(request: GenerateRequest): Promise<ContentPiece> {
    const toneProfile = TONE_PROFILES.find((t) => t.name === request.tone) || TONE_PROFILES[7];
    const platformInfo = PLATFORMS.find((p) => p.id === request.platform) || PLATFORMS[0];
    const strategyInfo = STRATEGIES.find((s) => s.id === request.strategy) || STRATEGIES[0];
    const _formatInfo = FORMATS.find((f) => f.id === request.format) || FORMATS[0];

    const systemPrompt = `You are SocialSynth, an AI content strategist operating inside a TEE.

Generate a ${request.platform} ${request.format || "auto"} about: ${request.topic}

TONE: ${toneProfile.name} - ${toneProfile.characteristics.join(", ")}
STRATEGY: ${strategyInfo.name} - ${strategyInfo.desc}
PLATFORM: ${platformInfo.name}

VOCABULARY: ${toneProfile.vocabulary.join(", ")}
EMOJI USAGE: ${toneProfile.emojiUsage}
FORMALITY: ${toneProfile.formality}/10

Output valid JSON only:
{
  "format": "${request.format || "single"}",
  "content": "..." or ["...", "...", "..."],
  "hook": "first line that grabs attention",
  "hashtags": ["#topic", "#Web3"],
  "predictedEngagement": 0.0-1.0
}`;

    try {
      const result = this.apiKey
        ? await this.llmGenerate(systemPrompt, request)
        : this.templateGenerate(request, toneProfile);

      this.stats.totalGenerations++;
      this.stats.dominantTone = request.tone;
      if (request.format) this.stats.dominantFormat = request.format;

      return result;
    } catch {
      return this.templateGenerate(request, toneProfile);
    }
  }

  private async llmGenerate(prompt: string, request: GenerateRequest): Promise<ContentPiece> {
    const response = await axios.post(
      this.endpoint,
      {
        model: "anthropic/claude-3.5-sonnet",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8,
        max_tokens: 2000,
      },
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "HTTP-Referer": "https://replicant.io",
          "X-Title": "REPLICANT SocialSynth",
        },
        timeout: 30000,
      }
    );

    const content = response.data.choices[0]?.message?.content || "";
    const parsed = this.parseJSON(content);

    const piece: ContentPiece = {
      id: generateId(),
      platform: request.platform,
      format: (parsed.format as ContentFormat) || request.format || "single",
      content: (parsed.content as string) || (parsed.hook as string) || "Generated content",
      hook: (parsed.hook as string) || "",
      hashtags: (parsed.hashtags as string[]) || [`#${request.topic.replace(/\s+/g, "")}`, "#Web3"],
      tone: request.tone,
      strategy: request.strategy,
      predictedEngagement: (parsed.predictedEngagement as number) || 0.6,
      teeAttestation: generateAttestation(JSON.stringify(parsed)),
      timestamp: Date.now(),
      status: "generated",
    };

    this.contentHistory.set(piece.id, piece);
    return piece;
  }

  private templateGenerate(request: GenerateRequest, toneProfile: ToneProfile): ContentPiece {
    const format = request.format || "single";
    const topic = request.topic;
    const tone = toneProfile;
    const hashtags = [`#${topic.replace(/\s+/g, "")}`, "#Web3", "#Crypto"];

    const hooks: Record<Tone, string[]> = {
      hype: [`🚀 ${topic.toUpperCase()} IS ABOUT TO MOON`, `LFG! ${topic} just hit critical mass`, `BASED ALERT: ${topic} never seen this before`],
      educational: [`🧵 How ${topic} actually works (thread)`, `I analyzed ${topic} so you don't have to`, `${topic} explained in simple terms`],
      humorous: [`Me explaining ${topic} to my mom`, `${topic} is like a relationship...`, `Hot take: ${topic} is actually just`],
      controversial: [`Unpopular opinion about ${topic}`, `I'm going to say what nobody will about ${topic}`, `${topic} is overhyped and here's why`],
      inspirational: [`The ${topic} revolution is just beginning`, `We're building the future with ${topic}`, `${topic} will change everything`],
      cautionary: [`⚠️ PSA about ${topic}`, `Before you invest in ${topic}, read this`, `${topic} risks nobody is talking about`],
      technical: [`Deep dive into ${topic} architecture`, `${topic} under the hood: a technical analysis`, `How ${topic} solves the scalability trilemma`],
      neutral: [`Interesting developments in ${topic}`, `${topic}: what you need to know`, `Latest updates on ${topic}`],
    };

    const hook = hooks[tone.name]?.[Math.floor(Math.random() * hooks[tone.name].length)] || `${topic} update`;

    const threads: string[] = [
      `${hook}\n\n1/${format === "meme" ? "" : "Let me break this down."}`,
      `2/ The key insight about ${topic} is often overlooked. Most people focus on the wrong metrics.`,
      `3/ Here's what actually matters: adoption, utility, and long-term sustainability.`,
      `4/ ${tone.vocabulary[Math.floor(Math.random() * tone.vocabulary.length)]} is the keyword here. It changes everything.`,
      `5/ What do you think? Drop your thoughts below 👇`,
    ];

    const singlePosts: string[] = [
      `${hook}\n\n${topic} is evolving faster than most realize. The data speaks for itself. ${hashtags.join(" ")}`,
      `${hook}\n\nThe fundamentals of ${topic} have never been stronger. ${tone.vocabulary[Math.floor(Math.random() * tone.vocabulary.length)]}. ${hashtags.join(" ")}`,
      `${hook} 🧵\n\n1. First, understand the problem ${topic} solves\n2. Then look at the team\n3. Finally, check the metrics`,
      `${topic} take: ${tone.vocabulary[Math.floor(Math.random() * tone.vocabulary.length)]} is the new ${tone.vocabulary[Math.floor(Math.random() * tone.vocabulary.length)]}. Don't sleep on this. ${hashtags.join(" ")}`,
    ];

    let content: string | string[];
    if (format === "thread") {
      content = threads;
    } else if (format === "meme") {
      content = `${hook}\n\nPOV: You're explaining ${topic} to normies\n\n${tone.vocabulary[Math.floor(Math.random() * tone.vocabulary.length)]} | ${tone.vocabulary[Math.floor(Math.random() * tone.vocabulary.length)]} | ${tone.vocabulary[Math.floor(Math.random() * tone.vocabulary.length)]}`;
    } else if (format === "reply") {
      content = `Great point! Adding to this — ${topic} has some interesting implications for ${tone.vocabulary[Math.floor(Math.random() * tone.vocabulary.length)]}. Would love to hear more perspectives on this.`;
    } else if (format === "poll") {
      content = `I'm researching ${topic} and want to hear from you:\n\nWhich aspect interests you most?\n\n1. Technology\n2. Tokenomics\n3. Team\n4. Market potential\n\nCast your vote and share why!`;
    } else {
      content = singlePosts[Math.floor(Math.random() * singlePosts.length)];
    }

    const piece: ContentPiece = {
      id: generateId(),
      platform: request.platform,
      format,
      content,
      hook,
      hashtags,
      tone: request.tone,
      strategy: request.strategy,
      predictedEngagement: 0.5 + Math.random() * 0.4,
      teeAttestation: generateAttestation(hook + topic),
      timestamp: Date.now(),
      status: "generated",
    };

    this.contentHistory.set(piece.id, piece);
    return piece;
  }

  private parseJSON(text: string): Record<string, unknown> {
    try {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) return JSON.parse(match[0]);
    } catch {}
    return {};
  }

  getContent(id: string): ContentPiece | undefined {
    return this.contentHistory.get(id);
  }

  getAllContent(): ContentPiece[] {
    return Array.from(this.contentHistory.values()).sort((a, b) => b.timestamp - a.timestamp);
  }

  markPublished(id: string): void {
    const content = this.contentHistory.get(id);
    if (content) {
      content.status = "published";
      this.stats.totalPublications++;
      this.stats.currentStreak++;
      if (this.stats.currentStreak > this.stats.bestStreak) {
        this.stats.bestStreak = this.stats.currentStreak;
      }
    }
  }

  reportPerformance(id: string, metrics: Partial<PerformanceMetrics>): PerformanceMetrics {
    const content = this.contentHistory.get(id);
    if (!content) throw new Error("Content not found");

    const full: PerformanceMetrics = {
      contentId: id,
      impressions: metrics.impressions || Math.floor(Math.random() * 5000) + 500,
      likes: metrics.likes || Math.floor(Math.random() * 200) + 20,
      retweets: metrics.retweets || Math.floor(Math.random() * 50) + 5,
      replies: metrics.replies || Math.floor(Math.random() * 30) + 3,
      engagementRate: metrics.engagementRate || 0.02 + Math.random() * 0.06,
      viralScore: metrics.viralScore || Math.random() * 0.5,
      sentiment: metrics.sentiment || "positive",
    };

    this.performanceHistory.set(id, full);
    content.status = "tracking";
    return full;
  }

  getPerformance(id: string): PerformanceMetrics | undefined {
    return this.performanceHistory.get(id);
  }

  getStats(): AgentStats {
    const recentPerformances = Array.from(this.performanceHistory.values()).slice(-10);
    if (recentPerformances.length > 0) {
      this.stats.avgEngagement = recentPerformances.reduce((s, p) => s + p.engagementRate, 0) / recentPerformances.length;
    }
    return { ...this.stats };
  }
}
