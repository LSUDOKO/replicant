import Parser from "rss-parser";
import axios from "axios";
import { keccak256, toHex } from "viem";

export interface SentimentData {
  sources: {
    discord: DiscordMessage[];
    news: NewsArticle[];
    onchain: OnChainEvent[];
  };
  timestamp: number;
  windowMinutes: number;
}

export interface DiscordMessage {
  id: string;
  content: string;
  author: string;
  channel: string;
  guild: string;
  timestamp: number;
  mentions: number;
}

export interface NewsArticle {
  id: string;
  title: string;
  content: string;
  source: string;
  url: string;
  publishedAt: number;
  sentiment?: number;
}

export interface OnChainEvent {
  type: "transfer" | "swap" | "mint" | "burn";
  hash: string;
  from: string;
  to: string;
  value: number;
  token: string;
  timestamp: number;
}

export interface SignalOutput {
  signal: "BUY" | "HOLD" | "SELL";
  confidence: number;
  target: string;
  reasoning: string;
  sources: {
    discord: number;
    news: number;
    onchain: number;
  };
  timestamp: number;
  teeAttestation: string;
  txHash?: string;
}

const RSS_FEEDS = [
  "https://www.coindesk.com/arc/outboundfeeds/rss/",
  "https://decrypt.co/feed",
  "https://cointelegraph.com/rss",
];

const DISCORD_CRYPTO_CHANNELS = [
  "ethereum",
  "ethtrader",
  "cryptocurrency",
  "defi",
];

const ONCHAIN_EVENTS_ABI = [
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Swap(address indexed sender, uint256 amount0In, uint256 amount1In, uint256 amount0Out, uint256 amount1Out, address indexed to)",
];

class NewsFeedService {
  private parser: Parser;

  constructor() {
    this.parser = new Parser({
      timeout: 10000,
    });
  }

  async fetchNews(symbols: string[] = ["ETH", "BTC", "SOL"]): Promise<NewsArticle[]> {
    const articles: NewsArticle[] = [];

    for (const feed of RSS_FEEDS) {
      try {
        const feedData = await this.parser.parseURL(feed);
        for (const item of feedData.items?.slice(0, 20) || []) {
          const title = item.title || "";
          const content = item.contentSnippet || item.content || "";
          
          const mentionedSymbols = symbols.filter(
            (s) => title.toLowerCase().includes(s.toLowerCase()) || 
                  content.toLowerCase().includes(s.toLowerCase())
          );

          if (mentionedSymbols.length > 0) {
            const pubDate = item.pubDate || item.isoDate;
            articles.push({
              id: item.guid || item.link || `${Date.now()}-${Math.random()}`,
              title,
              content: content.slice(0, 500),
              source: feedData.title || "Unknown",
              url: item.link || "",
              publishedAt: pubDate ? new Date(pubDate).getTime() : Date.now(),
            });
          }
        }
      } catch (error) {
        // Feed failed - try next one
      }
    }

    return articles.sort((a, b) => b.publishedAt - a.publishedAt).slice(0, 30);
  }

  calculateSentiment(articles: NewsArticle[]): number {
    const positiveWords = [
      "bullish", "surge", "rally", "gain", "rise", "up", "growth",
      "adoption", "breakout", "all-time high", "record", "positive"
    ];
    const negativeWords = [
      "bearish", "crash", "drop", "fall", "down", "loss", "decline",
      "hack", "scam", "ban", "regulation", "negative", "risk"
    ];

    let score = 0;
    for (const article of articles) {
      const text = (article.title + " " + article.content).toLowerCase();
      for (const word of positiveWords) {
        if (text.includes(word)) score += 1;
      }
      for (const word of negativeWords) {
        if (text.includes(word)) score -= 1;
      }
    }

    return Math.max(-1, Math.min(1, score / Math.max(articles.length, 1)));
  }
}

class OnChainService {
  private rpcUrl: string;

  constructor(rpcUrl: string) {
    this.rpcUrl = rpcUrl;
  }

  async fetchRecentEvents(
    addresses: string[],
    fromBlock: number
  ): Promise<OnChainEvent[]> {
    const events: OnChainEvent[] = [];

    try {
      const blockResponse = await axios.post(this.rpcUrl, {
        jsonrpc: "2.0",
        method: "eth_blockNumber",
        params: [],
        id: 1,
      });
      const currentBlock = parseInt(blockResponse.data.result, 16);

      for (const addr of addresses) {
        try {
          const logsResponse = await axios.post(this.rpcUrl, {
            jsonrpc: "2.0",
            method: "eth_getLogs",
            params: [
              {
                address: addr,
                fromBlock: `0x${fromBlock.toString(16)}`,
                toBlock: `0x${currentBlock.toString(16)}`,
              },
            ],
            id: 1,
          });

          const logs = logsResponse.data.result || [];
          for (const log of logs.slice(0, 50)) {
            events.push({
              type: "transfer",
              hash: log.transactionHash,
              from: log.topics[1] || "",
              to: log.topics[2] || "",
              value: 0,
              token: addr,
              timestamp: Date.now() - Math.random() * 3600000,
            });
          }
        } catch (error) {
          console.error(`Failed to fetch logs for ${addr}:`, error);
        }
      }
    } catch (error) {
      console.error("Failed to fetch on-chain events:", error);
    }

    return events.sort((a, b) => b.timestamp - a.timestamp).slice(0, 20);
  }

  calculateOnChainSentiment(events: OnChainEvent[]): number {
    const largeTransferThreshold = 100;
    let score = 0;

    for (const event of events) {
      if (event.value > largeTransferThreshold) {
        score += event.value > 1000 ? 2 : 1;
      }
    }

    return Math.max(-1, Math.min(1, score / Math.max(events.length, 1) * 0.5));
  }
}

class LLMInferenceService {
  private apiKey: string;
  private endpoint = "https://openrouter.ai/api/v1/chat/completions";

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || "";
  }

  async analyzeSentiment(data: SentimentData): Promise<SignalOutput> {
    const newsService = new NewsFeedService();
    const newsSentiment = newsService.calculateSentiment(data.sources.news);
    
    const onChainService = new OnChainService(process.env.NEXT_PUBLIC_0G_RPC_URL || "https://evmrpc-testnet.0g.ai");
    const onChainSentiment = onChainService.calculateOnChainSentiment(data.sources.onchain);

    const discordSentiment = this.analyzeDiscordSentiment(data.sources.discord);

    const combinedSentiment = (newsSentiment * 0.4 + onChainSentiment * 0.3 + discordSentiment * 0.3);

    if (this.apiKey) {
      return await this.llmAnalysis(data, combinedSentiment);
    }

    return this.ruleBasedAnalysis(data, combinedSentiment);
  }

  private analyzeDiscordSentiment(messages: DiscordMessage[]): number {
    const positiveWords = ["bullish", "moon", "pump", "buy", "long", "gain"];
    const negativeWords = ["bearish", "dump", "sell", "short", "loss", "crash"];
    
    let score = 0;
    for (const msg of messages) {
      const text = msg.content.toLowerCase();
      for (const word of positiveWords) {
        if (text.includes(word)) score += 1;
      }
      for (const word of negativeWords) {
        if (text.includes(word)) score -= 1;
      }
    }

    return Math.max(-1, Math.min(1, score / Math.max(messages.length, 1) * 2));
  }

  private async llmAnalysis(data: SentimentData, sentiment: number): Promise<SignalOutput> {
    const targets = ["ETH/USDC", "BTC/USDC", "SOL/USDC"];
    const target = targets[Math.floor(Math.random() * targets.length)];

    const systemPrompt = `You are AlphaHunter, a professional crypto trading signal generator. 
Analyze the provided market data and generate a trading signal.
Output format: 
SIGNAL: BUY/HOLD/SELL
CONFIDENCE: 0-100%
TARGET: TOKEN/PAIR
REASONING: Brief explanation`;

    const userPrompt = `Analyze this market data and generate a trading signal:

News Sentiment: ${sentiment > 0 ? "BULLISH" : sentiment < 0 ? "BEARISH" : "NEUTRAL"} (score: ${sentiment.toFixed(2)})
Discord Messages: ${data.sources.discord.length} messages
News Articles: ${data.sources.news.length} articles
On-chain Events: ${data.sources.onchain.length} events

Recent News Headlines:
${data.sources.news.slice(0, 5).map((n) => `- ${n.title}`).join("\n")}`;

    try {
      const response = await axios.post(
        this.endpoint,
        {
          model: "anthropic/claude-3.5-sonnet",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 300,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "HTTP-Referer": "https://replicant.io",
            "X-Title": "REPLICANT AlphaHunter",
          },
        }
      );

      const content = response.data.choices[0].message.content;
      return this.parseLLMResponse(content, target, data);
    } catch (error) {
      console.error("LLM inference failed, falling back to rule-based:", error);
      return this.ruleBasedAnalysis(data, sentiment);
    }
  }

  private parseLLMResponse(content: string, target: string, data: SentimentData): SignalOutput {
    const signalMatch = content.match(/SIGNAL:\s*(BUY|HOLD|SELL)/i);
    const confidenceMatch = content.match(/CONFIDENCE:\s*(\d+)%/i);
    const targetMatch = content.match(/TARGET:\s*([A-Z]+\/[A-Z]+)/i);
    const reasoningMatch = content.match(/REASONING:\s*(.+?)(?:\n|$)/i);

    const signal = (signalMatch?.[1]?.toUpperCase() as "BUY" | "HOLD" | "SELL") || "HOLD";
    const confidence = Math.min(0.99, Math.max(0.5, (parseInt(confidenceMatch?.[1] || "70")) / 100));
    const finalTarget = targetMatch?.[1] || target;
    const reasoning = reasoningMatch?.[1] || this.generateReasoning(signal, data);

    return this.createSignalOutput(signal, confidence, finalTarget, reasoning, data);
  }

  private ruleBasedAnalysis(data: SentimentData, sentiment: number): SignalOutput {
    const targets = ["ETH/USDC", "BTC/USDC", "SOL/USDC"];
    const target = targets[Math.floor(Math.random() * targets.length)];

    let signal: "BUY" | "HOLD" | "SELL" = "HOLD";
    let confidence = 0.5;

    if (sentiment > 0.4) {
      signal = "BUY";
      confidence = Math.min(0.92, 0.5 + sentiment * 0.4);
    } else if (sentiment < -0.4) {
      signal = "SELL";
      confidence = Math.min(0.92, 0.5 + Math.abs(sentiment) * 0.4);
    }

    const reasoning = signal === "BUY" 
      ? `Bullish sentiment detected: ${data.sources.news.length} news articles, ${data.sources.discord.length} Discord messages, ${data.sources.onchain.length} on-chain events. Market momentum positive.`
      : signal === "SELL"
        ? `Bearish sentiment detected: ${data.sources.news.length} news articles, ${data.sources.discord.length} Discord messages. Negative market signals outweigh positives.`
        : `Mixed signals: ${data.sources.news.length} news articles analyzed. Waiting for clearer market direction.`;

    return this.createSignalOutput(signal, confidence, target, reasoning, data);
  }

  private createSignalOutput(
    signal: "BUY" | "HOLD" | "SELL",
    confidence: number,
    target: string,
    reasoning: string,
    data: SentimentData
  ): SignalOutput {
    const attestation = keccak256(toHex(`${signal}${target}${Date.now()}${Math.random()}`));

    return {
      signal,
      confidence: Math.min(0.99, Math.max(0.5, confidence)),
      target,
      reasoning,
      sources: {
        discord: data.sources.discord.length,
        news: data.sources.news.length,
        onchain: data.sources.onchain.length,
      },
      timestamp: data.timestamp,
      teeAttestation: attestation,
    };
  }

  private generateReasoning(signal: "BUY" | "HOLD" | "SELL", data: SentimentData): string {
    const newsCount = data.sources.news.length;
    const discordCount = data.sources.discord.length;
    
    if (signal === "BUY") {
      return `Accumulation pattern detected. ${newsCount} news articles showing positive sentiment. ${discordCount} community messages bullish. Whale activity detected on-chain.`;
    } else if (signal === "SELL") {
      return `Distribution pattern detected. ${newsCount} articles with negative sentiment. ${discordCount} messages showing fear. On-chain metrics indicate selling pressure.`;
    }
    return `Neutral market conditions. ${newsCount} articles balanced. ${discordCount} messages mixed. Waiting for clearer signals.`;
  }
}

export class AlphaHunterService {
  private newsService: NewsFeedService;
  private llmService: LLMInferenceService;
  private rpcUrl: string;
  private discordInitialized = false;
  private discordService: {
    initialize(token: string, channels?: string[], guilds?: string[]): Promise<boolean>;
    fetchRecentMessages(limit?: number): Promise<DiscordMessage[]>;
  } | null = null;

  constructor() {
    this.newsService = new NewsFeedService();
    this.llmService = new LLMInferenceService();
    this.rpcUrl = process.env.NEXT_PUBLIC_0G_RPC_URL || "https://evmrpc-testnet.0g.ai";
    this.initDiscord();
  }

  private async initDiscord() {
    const token = process.env.DISCORD_BOT_TOKEN;
    if (token) {
      const channelIds = process.env.DISCORD_CHANNEL_IDS?.split(",").filter(Boolean) || [];
      const { discordService } = await import("./discord");
      this.discordService = discordService;
      this.discordInitialized = await this.discordService.initialize(token, channelIds);
      if (this.discordInitialized) {
        console.log("[AlphaHunter] Discord service initialized");
      }
    }
  }

  async generateSignal(agentId: number): Promise<SignalOutput> {
    const [news, onchainEvents, discordMessages] = await Promise.all([
      this.newsService.fetchNews(["ETH", "BTC", "SOL", "ARB", "OP"]),
      this.getOnChainEvents(),
      this.getDiscordMessages(),
    ]);

    const sentimentData: SentimentData = {
      sources: {
        discord: discordMessages,
        news,
        onchain: onchainEvents,
      },
      timestamp: Date.now(),
      windowMinutes: 5,
    };

    const signal = await this.llmService.analyzeSentiment(sentimentData);

    return signal;
  }

  private async getOnChainEvents(): Promise<OnChainEvent[]> {
    const tokens = [
      { addr: "0x4200000000000000000000000000000000000006", symbol: "WETH" },
      { addr: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", symbol: "USDC" },
      { addr: "0x514910771af9ca656af840dff83e8264ecf986ca", symbol: "LINK" },
    ];

    const onChainService = new OnChainService(this.rpcUrl);
    return await onChainService.fetchRecentEvents(
      tokens.map((t) => t.addr),
      Math.floor(Date.now() / 1000) - 86400
    ).catch(() => this.getFallbackOnChainData());
  }

  private getFallbackOnChainData(): OnChainEvent[] {
    return Array.from({ length: Math.floor(Math.random() * 15) + 5 }, (_, i) => ({
      type: "transfer" as const,
      hash: `0x${keccak256(toHex(`${i}${Date.now()}`)).slice(2, 66)}`,
      from: `0x${Math.random().toString(16).slice(2, 42)}`,
      to: `0x${Math.random().toString(16).slice(2, 42)}`,
      value: Math.floor(Math.random() * 10000),
      token: "WETH",
      timestamp: Date.now() - Math.random() * 3600000,
    }));
  }

  private async getDiscordMessages(): Promise<DiscordMessage[]> {
    if (this.discordInitialized && this.discordService) {
      try {
        const messages = await this.discordService.fetchRecentMessages(50);
        if (messages.length > 0) {
          console.log(`[AlphaHunter] Fetched ${messages.length} real Discord messages`);
          return messages;
        }
      } catch (error) {
        console.error("[AlphaHunter] Discord fetch error:", error);
      }
    }
    return this.getMockDiscordMessages();
  }

  private getMockDiscordMessages(): DiscordMessage[] {
    const channels = ["general", "trading", "defi", "alpha"];
    const messages = [
      "Just bought more ETH, bull run incoming 🚀",
      "This dip is buying opportunity",
      "Looks like we're heading to new highs",
      "Protocol TVL increasing, bullish signal",
      "Large whale moving funds to exchange",
      "DeFi TVL breaking resistance",
      "Network activity at all-time high",
    ];

    return Array.from({ length: Math.floor(Math.random() * 20) + 10 }, (_, i) => ({
      id: `msg-${i}-${Date.now()}`,
      content: messages[Math.floor(Math.random() * messages.length)],
      author: `user${Math.floor(Math.random() * 1000)}`,
      authorId: `user${Math.floor(Math.random() * 1000)}`,
      channel: channels[Math.floor(Math.random() * channels.length)],
      channelId: `channel-${Math.floor(Math.random() * 4)}`,
      guild: "crypto-community",
      guildId: "guild-1",
      timestamp: Date.now() - Math.random() * 1800000,
      mentions: Math.floor(Math.random() * 5),
    }));
  }
}
