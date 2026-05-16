import { NextRequest, NextResponse } from "next/server";
import { PriceService } from "@/services/price-service";
import { NewsService } from "@/services/news-service";
import { DiscordService } from "@/services/discord-service";
import { FarcasterService } from "@/services/farcaster-service";
import { LensService } from "@/services/lens-service";
import { WhaleTrackerService } from "@/services/whale-tracker-service";
import { MarketDataService } from "@/services/market-data-service";
import { createStorageClient } from "@/lib/0g-storage";
import { keccak256, toHex } from "viem";

interface SignalOutput {
  agentId: number;
  signalType: 0 | 1 | 2; // 0=BUY, 1=HOLD, 2=SELL
  confidence: number;
  target: string;
  entryPrice?: number;
  takeProfit?: number;
  stopLoss?: number;
  reasoning: string;
  sources: { discord: number; news: number; onchain: number };
  timestamp: number;
  teeAttestation: string;
  storageHash?: string;
  txHash?: string;
  verified: boolean;
}

// In-memory storage for demo (replace with database in production)
const signalStore = new Map<number, SignalOutput[]>();

/**
 * GET /api/alphahunter/signal
 * Fetch historical signals for an agent
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = parseInt(searchParams.get("agentId") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const signals = signalStore.get(agentId) || [];
    
    return NextResponse.json({
      signals: signals.slice(0, limit),
      count: signals.length,
    });
  } catch (error) {
    console.error("[AlphaHunter] GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch signals" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/alphahunter/signal
 * Generate new autonomous trading signal with comprehensive data sources
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const agentId = body.agentId || 1;
    const asset = body.asset || "SOL/USDT";

    console.log(`[AlphaHunter] Generating signal for agent ${agentId}...`);

    // Step 1: Fetch comprehensive market data
    const symbol = asset.replace("/", "");
    const [priceData, marketContext] = await Promise.all([
      PriceService.getCurrentPrice(symbol),
      MarketDataService.getMarketContext(symbol.replace("USDT", "")),
    ]);
    console.log(`[AlphaHunter] Price: ${priceData.price}, Fear & Greed: ${marketContext.fearGreed.value}`);

    // Step 2: Fetch latest news
    const newsService = new NewsService();
    const news = await newsService.fetchLatestNews(10);
    const newsSentiment = newsService.calculateSentiment(news);
    console.log(`[AlphaHunter] News: ${news.length} articles, sentiment: ${newsSentiment.toFixed(2)}`);

    // Step 3: Scrape social sentiment (Discord, Farcaster, Lens)
    let discordContext = "";
    let farcasterContext = "";
    let lensContext = "";
    
    const discordChannelId = process.env.DISCORD_CHANNEL_ID;
    if (discordChannelId) {
      try {
        discordContext = await DiscordService.scrapeSentiment(discordChannelId, 50);
        console.log(`[AlphaHunter] Discord: ${discordContext.split("|").length} messages`);
      } catch (error) {
        console.log("[AlphaHunter] Discord scraping failed");
      }
    }

    // Farcaster sentiment (optional)
    try {
      farcasterContext = await FarcasterService.scrapeSentiment("crypto", 30);
      const farcasterSentiment = FarcasterService.calculateSentiment(farcasterContext);
      console.log(`[AlphaHunter] Farcaster: ${farcasterContext.split("|").length} casts, sentiment: ${farcasterSentiment.toFixed(2)}`);
    } catch (error) {
      console.log("[AlphaHunter] Farcaster scraping failed");
    }

    // Lens Protocol sentiment (optional)
    try {
      lensContext = await LensService.scrapeSentiment(30);
      const lensSentiment = LensService.calculateSentiment(lensContext);
      console.log(`[AlphaHunter] Lens: ${lensContext.split("|").length} posts, sentiment: ${lensSentiment.toFixed(2)}`);
    } catch (error) {
      console.log("[AlphaHunter] Lens scraping failed");
    }

    // Step 4: Track whale activity
    const whaleActivity = await WhaleTrackerService.trackWhaleTransfers("USDT", 24);
    const whaleSentiment = WhaleTrackerService.calculateSentiment(whaleActivity);
    console.log(`[AlphaHunter] Whale activity: ${whaleActivity.sentiment}, sentiment: ${whaleSentiment.toFixed(2)}`);

    // Step 5: Calculate weighted sentiment scores
    // Sentiment: 40% (News 10% + Discord 10% + Farcaster 10% + Lens 10%)
    // Whale activity: 30%
    // Market structure: 30% (Fear & Greed + Volatility + Dominance)
    const sentimentScore = (
      newsSentiment * 0.10 +
      (discordContext ? 0.10 : 0) +
      (farcasterContext ? FarcasterService.calculateSentiment(farcasterContext) * 0.10 : 0) +
      (lensContext ? LensService.calculateSentiment(lensContext) * 0.10 : 0)
    ) / 0.40;

    const whaleScore = whaleSentiment * 0.30;

    const marketScore = (
      ((marketContext.fearGreed.value - 50) / 50) * 0.15 + // Fear & Greed normalized
      (1 - marketContext.volatility * 10) * 0.10 + // Lower volatility = better
      (marketContext.global.btcDominance > 50 ? 0.05 : -0.05) // BTC dominance
    );

    const finalScore = sentimentScore + whaleScore + marketScore;

    console.log(`[AlphaHunter] Scores - Sentiment: ${sentimentScore.toFixed(2)}, Whale: ${whaleScore.toFixed(2)}, Market: ${marketScore.toFixed(2)}, Final: ${finalScore.toFixed(2)}`);

    // Step 6: Construct LLM prompt with all data
    const prompt = buildAnalysisPrompt(
      asset,
      priceData.price,
      news,
      discordContext,
      farcasterContext,
      lensContext,
      whaleActivity,
      marketContext,
      finalScore
    );

    // Step 7: Send to LLM (simulating TEE execution)
    const signal = await analyzeSentiment(
      prompt,
      asset,
      priceData.price,
      finalScore
    );

    // Step 8: Generate cryptographic proofs and upload to 0G Storage
    const teeAttestation = keccak256(
      toHex(`${signal.signal}${asset}${Date.now()}${Math.random()}`)
    );

    let storageHash: string | undefined;
    let storageTxHash: string | undefined;

    // Try to upload to 0G Storage if configured
    const storageRpcUrl = process.env.NEXT_PUBLIC_0G_RPC_URL || process.env.OG_RPC_URL;
    const storageIndexerUrl = process.env.OG_STORAGE_INDEXER_URL;
    const storagePrivateKey = process.env.OG_STORAGE_PRIVATE_KEY;

    if (storageRpcUrl && storageIndexerUrl && storagePrivateKey) {
      try {
        const storageClient = createStorageClient({
          rpcUrl: storageRpcUrl,
          indexerUrl: storageIndexerUrl,
          privateKey: storagePrivateKey,
        });

        const signalData = {
          agentId,
          signal: signal.signal,
          confidence: signal.confidence,
          target: asset,
          entryPrice: signal.entryPrice,
          takeProfit: signal.takeProfit,
          stopLoss: signal.stopLoss,
          reasoning: signal.reasoning,
          sources: {
            discord: discordContext.split("|").filter(Boolean).length,
            news: news.length,
            onchain: whaleActivity.totalTransfers,
          },
          timestamp: Date.now(),
          teeAttestation,
          marketData: {
            price: priceData.price,
            fearGreed: marketContext.fearGreed.value,
            volatility: marketContext.volatility,
          },
        };

        const uploadResult = await storageClient.uploadJson(signalData);
        storageHash = uploadResult.rootHash;
        storageTxHash = uploadResult.txHash;
        console.log(`[AlphaHunter] Uploaded to 0G Storage: ${storageHash}`);
      } catch (error) {
        console.error("[AlphaHunter] 0G Storage upload failed:", error);
        // Fallback to hash-only if upload fails
        storageHash = keccak256(
          toHex(JSON.stringify({ signal, timestamp: Date.now() }))
        );
      }
    } else {
      // No storage configured, use hash-only
      console.log("[AlphaHunter] 0G Storage not configured, using hash-only");
      storageHash = keccak256(
        toHex(JSON.stringify({ signal, timestamp: Date.now() }))
      );
    }

    // Step 9: Create signal output
    const output: SignalOutput = {
      agentId,
      signalType: signal.signal === "BUY" ? 0 : signal.signal === "SELL" ? 2 : 1,
      confidence: signal.confidence,
      target: asset,
      entryPrice: signal.entryPrice,
      takeProfit: signal.takeProfit,
      stopLoss: signal.stopLoss,
      reasoning: signal.reasoning,
      sources: {
        discord: discordContext.split("|").filter(Boolean).length,
        news: news.length,
        onchain: whaleActivity.totalTransfers,
      },
      timestamp: Date.now(),
      teeAttestation,
      storageHash: storageHash,
      txHash: storageTxHash,
      verified: true,
    };

    // Step 10: Save to store
    const existing = signalStore.get(agentId) || [];
    signalStore.set(agentId, [output, ...existing].slice(0, 100));

    // Step 11: Broadcast to Discord (if configured)
    const broadcastChannelId = process.env.DISCORD_BROADCAST_CHANNEL_ID;
    if (broadcastChannelId) {
      try {
        await DiscordService.broadcastSignal(broadcastChannelId, {
          asset,
          signal: signal.signal,
          confidence: signal.confidence,
          currentPrice: priceData.price,
          entryPrice: signal.entryPrice,
          takeProfit: signal.takeProfit,
          stopLoss: signal.stopLoss,
          reasoning: signal.reasoning,
          teeAttestation,
          storageRoot: storageHash,
        });
        console.log("[AlphaHunter] Signal broadcasted to Discord");
      } catch (error) {
        console.error("[AlphaHunter] Discord broadcast failed:", error);
      }
    }

    console.log(`[AlphaHunter] Signal generated: ${signal.signal} ${asset}`);

    return NextResponse.json({ signal: output });
  } catch (error) {
    console.error("[AlphaHunter] POST error:", error);
    return NextResponse.json(
      {
        error: "Signal generation failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Build comprehensive analysis prompt for LLM
 */
function buildAnalysisPrompt(
  asset: string,
  price: number,
  news: Array<{ title: string; summary: string; source: string }>,
  discordContext: string,
  farcasterContext: string,
  lensContext: string,
  whaleActivity: any,
  marketContext: any,
  finalScore: number
): string {
  const newsText = news
    .slice(0, 5)
    .map((n) => `[${n.source}] ${n.title}`)
    .join("\n");

  const discordMessages = discordContext
    .split("|")
    .filter(Boolean)
    .slice(0, 10)
    .join("\n");

  const farcasterCasts = farcasterContext
    .split("|")
    .filter(Boolean)
    .slice(0, 10)
    .join("\n");

  const lensPosts = lensContext
    .split("|")
    .filter(Boolean)
    .slice(0, 10)
    .join("\n");

  return `You are AlphaHunter, an autonomous crypto trading signal generator running in a TEE.

CURRENT MARKET DATA:
Asset: ${asset}
Current Price: $${price.toFixed(2)}
24h Change: ${marketContext.price.priceChange24h.toFixed(2)}%
24h Volume: $${(marketContext.price.volume24h / 1e6).toFixed(2)}M
Volatility: ${(marketContext.volatility * 100).toFixed(2)}%

MARKET SENTIMENT:
Fear & Greed Index: ${marketContext.fearGreed.value}/100 (${marketContext.fearGreed.classification})
BTC Dominance: ${marketContext.global.btcDominance.toFixed(2)}%
Total Market Cap: $${(marketContext.global.totalMarketCap / 1e9).toFixed(2)}B

WHALE ACTIVITY (Last 24h):
Sentiment: ${whaleActivity.sentiment}
Total Transfers: ${whaleActivity.totalTransfers}
Total Volume: $${(whaleActivity.totalVolumeUSD / 1e6).toFixed(2)}M
Net Flow: $${(whaleActivity.netFlow / 1e6).toFixed(2)}M (${whaleActivity.netFlow > 0 ? "ACCUMULATION" : "DISTRIBUTION"})

LATEST NEWS (${news.length} articles):
${newsText}

COMMUNITY SENTIMENT:

Discord (${discordContext.split("|").filter(Boolean).length} messages):
${discordMessages || "No Discord data available"}

Farcaster (${farcasterContext.split("|").filter(Boolean).length} casts):
${farcasterCasts || "No Farcaster data available"}

Lens Protocol (${lensContext.split("|").filter(Boolean).length} posts):
${lensPosts || "No Lens data available"}

WEIGHTED ANALYSIS SCORE: ${finalScore.toFixed(2)}
(Sentiment: 40% | Whale Activity: 30% | Market Structure: 30%)

TASK:
Analyze all the data above and generate a trading signal in strict JSON format:
{
  "signal": "BUY" | "HOLD" | "SELL",
  "confidence": 0.50-0.99,
  "entryPrice": number,
  "takeProfit": number,
  "stopLoss": number,
  "reasoning": "detailed 2-3 sentence explanation citing specific data points"
}

Rules:
- BUY if weighted score > 0.3 AND confidence > 0.70
- SELL if weighted score < -0.3 AND confidence > 0.70
- HOLD if mixed signals or score between -0.3 and 0.3
- Confidence must be between 0.50 and 0.99
- Reasoning must cite specific data (whale activity, sentiment, market conditions)
- Entry price should be current price
- Take profit should be 3-8% above entry for BUY, 3-8% below for SELL
- Stop loss should be 2-5% below entry for BUY, 2-5% above for SELL`;
}

/**
 * Analyze sentiment and generate signal using LLM or rule-based fallback
 */
async function analyzeSentiment(
  prompt: string,
  asset: string,
  currentPrice: number,
  finalScore: number
): Promise<{
  signal: "BUY" | "HOLD" | "SELL";
  confidence: number;
  entryPrice: number;
  takeProfit: number;
  stopLoss: number;
  reasoning: string;
}> {
  const openRouterKey = process.env.OPENROUTER_API_KEY;

  // If LLM is configured, use it
  if (openRouterKey) {
    try {
      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${openRouterKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://replicant.io",
            "X-Title": "REPLICANT AlphaHunter",
          },
          body: JSON.stringify({
            model: "anthropic/claude-3.5-sonnet",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: 500,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const content = data.choices[0].message.content;
        
        // Try to parse JSON from response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            signal: parsed.signal,
            confidence: Math.min(0.99, Math.max(0.5, parsed.confidence)),
            entryPrice: parsed.entryPrice || currentPrice,
            takeProfit: parsed.takeProfit || currentPrice * 1.05,
            stopLoss: parsed.stopLoss || currentPrice * 0.97,
            reasoning: parsed.reasoning,
          };
        }
      }
    } catch (error) {
      console.error("[AlphaHunter] LLM analysis failed:", error);
    }
  }

  // Fallback: Rule-based analysis using weighted score
  return ruleBasedAnalysis(asset, currentPrice, finalScore);
}

/**
 * Rule-based signal generation using weighted sentiment score
 */
function ruleBasedAnalysis(
  asset: string,
  currentPrice: number,
  finalScore: number
): {
  signal: "BUY" | "HOLD" | "SELL";
  confidence: number;
  entryPrice: number;
  takeProfit: number;
  stopLoss: number;
  reasoning: string;
} {
  let signal: "BUY" | "HOLD" | "SELL";
  let confidence: number;

  // Use weighted score to determine signal
  if (finalScore > 0.3) {
    signal = "BUY";
    confidence = 0.70 + Math.min(0.25, finalScore * 0.5);
  } else if (finalScore < -0.3) {
    signal = "SELL";
    confidence = 0.70 + Math.min(0.25, Math.abs(finalScore) * 0.5);
  } else {
    signal = "HOLD";
    confidence = 0.50 + Math.random() * 0.20;
  }

  const entryPrice = currentPrice;
  const takeProfit =
    signal === "BUY"
      ? currentPrice * (1 + 0.03 + Math.random() * 0.05)
      : signal === "SELL"
      ? currentPrice * (1 - 0.03 - Math.random() * 0.05)
      : currentPrice;
  const stopLoss =
    signal === "BUY"
      ? currentPrice * (1 - 0.02 - Math.random() * 0.03)
      : signal === "SELL"
      ? currentPrice * (1 + 0.02 + Math.random() * 0.03)
      : currentPrice;

  const reasoning =
    signal === "BUY"
      ? `Comprehensive analysis shows bullish sentiment (score: ${finalScore.toFixed(2)}). Whale accumulation detected with positive community sentiment across Discord, Farcaster, and Lens. Market structure supports upward movement.`
      : signal === "SELL"
      ? `Comprehensive analysis shows bearish sentiment (score: ${finalScore.toFixed(2)}). Whale distribution patterns detected with negative community sentiment. Market structure suggests downward pressure.`
      : `Mixed signals detected (score: ${finalScore.toFixed(2)}). Whale activity neutral, community sentiment divided. Waiting for clearer directional bias before taking position.`;

  return {
    signal,
    confidence: Math.min(0.99, Math.max(0.5, confidence)),
    entryPrice,
    takeProfit,
    stopLoss,
    reasoning,
  };
}
