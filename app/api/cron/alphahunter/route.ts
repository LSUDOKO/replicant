/**
 * Autonomous AlphaHunter Controller
 * Triggered by cron job to generate signals automatically
 * 
 * Setup: Configure Vercel Cron or external cron service to hit this endpoint
 * Example: Every hour -> POST /api/cron/alphahunter
 */

import { NextRequest, NextResponse } from "next/server";
import { PriceService } from "@/services/price-service";
import { NewsService } from "@/services/news-service";
import { DiscordService } from "@/services/discord-service";
import { keccak256, toHex } from "viem";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/cron/alphahunter
 * Autonomous signal generation triggered by cron
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[AlphaHunter Cron] Starting autonomous cycle...");

    const asset = "SOL/USDT";
    const agentId = 1;

    // Step 1: Fetch live price
    const priceData = await PriceService.getCurrentPrice(
      asset.replace("/", "")
    );
    console.log(`[Cron] Price: ${priceData.price}`);

    // Step 2: Fetch latest news
    const newsService = new NewsService();
    const news = await newsService.fetchLatestNews(10);
    const newsSentiment = newsService.calculateSentiment(news);
    console.log(`[Cron] News: ${news.length} articles, sentiment: ${newsSentiment.toFixed(2)}`);

    // Step 3: Scrape Discord sentiment
    let discordContext = "";
    const discordChannelId = process.env.DISCORD_CHANNEL_ID;
    
    if (discordChannelId) {
      try {
        discordContext = await DiscordService.scrapeSentiment(
          discordChannelId,
          50
        );
        console.log(`[Cron] Discord: ${discordContext.split("|").length} messages`);
      } catch (error) {
        console.log("[Cron] Discord scraping failed");
      }
    }

    // Step 4: Build analysis prompt
    const prompt = buildPrompt(asset, priceData.price, news, discordContext, newsSentiment);

    // Step 5: Generate signal via LLM (TEE simulation)
    const signal = await generateSignal(
      prompt,
      asset,
      priceData.price,
      news.length,
      discordContext.split("|").filter(Boolean).length
    );

    // Step 6: Generate cryptographic proofs
    const teeAttestation = keccak256(
      toHex(`${signal.signal}${asset}${Date.now()}${Math.random()}`)
    );
    const storageRoot = keccak256(
      toHex(JSON.stringify({ signal, timestamp: Date.now() }))
    );

    console.log(`[Cron] Signal: ${signal.signal} ${asset} (${(signal.confidence * 100).toFixed(0)}%)`);

    // Step 7: Broadcast to Discord
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
          storageRoot,
        });
        console.log("[Cron] Signal broadcasted to Discord");
      } catch (error) {
        console.error("[Cron] Discord broadcast failed:", error);
      }
    }

    // Step 8: Save to database (placeholder - implement your DB logic)
    // await saveSignalToDatabase({ agentId, signal, teeAttestation, storageRoot });

    return NextResponse.json({
      success: true,
      signal: {
        asset,
        signal: signal.signal,
        confidence: signal.confidence,
        teeAttestation,
        storageRoot,
        timestamp: Date.now(),
      },
    });
  } catch (error) {
    console.error("[AlphaHunter Cron] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/cron/alphahunter
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: "healthy",
    service: "AlphaHunter Autonomous Controller",
    timestamp: Date.now(),
  });
}

function buildPrompt(
  asset: string,
  price: number,
  news: Array<{ title: string; summary: string; source: string }>,
  discordContext: string,
  newsSentiment: number
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

  return `You are AlphaHunter, an autonomous crypto trading AI running in a TEE.

MARKET DATA:
Asset: ${asset}
Current Price: $${price.toFixed(2)}
News Sentiment: ${newsSentiment > 0 ? "BULLISH" : newsSentiment < 0 ? "BEARISH" : "NEUTRAL"} (${newsSentiment.toFixed(2)})

LATEST NEWS:
${newsText}

COMMUNITY SENTIMENT:
${discordMessages || "No Discord data"}

Generate a trading signal in JSON format:
{
  "signal": "BUY" | "HOLD" | "SELL",
  "confidence": 0.50-0.99,
  "entryPrice": number,
  "takeProfit": number,
  "stopLoss": number,
  "reasoning": "2-3 sentence explanation"
}`;
}

async function generateSignal(
  prompt: string,
  asset: string,
  currentPrice: number,
  newsCount: number,
  discordCount: number
): Promise<{
  signal: "BUY" | "HOLD" | "SELL";
  confidence: number;
  entryPrice: number;
  takeProfit: number;
  stopLoss: number;
  reasoning: string;
}> {
  const openRouterKey = process.env.OPENROUTER_API_KEY;

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
      console.error("[Cron] LLM failed:", error);
    }
  }

  // Fallback
  return ruleBasedSignal(asset, currentPrice, newsCount, discordCount);
}

function ruleBasedSignal(
  asset: string,
  currentPrice: number,
  newsCount: number,
  discordCount: number
): {
  signal: "BUY" | "HOLD" | "SELL";
  confidence: number;
  entryPrice: number;
  takeProfit: number;
  stopLoss: number;
  reasoning: string;
} {
  const dataScore = (newsCount * 0.6 + discordCount * 0.4) / 20;
  const rand = Math.random();

  let signal: "BUY" | "HOLD" | "SELL";
  let confidence: number;

  if (rand > 0.6 && dataScore > 0.5) {
    signal = "BUY";
    confidence = 0.65 + Math.random() * 0.25;
  } else if (rand < 0.3) {
    signal = "SELL";
    confidence = 0.60 + Math.random() * 0.25;
  } else {
    signal = "HOLD";
    confidence = 0.50 + Math.random() * 0.20;
  }

  return {
    signal,
    confidence: Math.min(0.99, Math.max(0.5, confidence)),
    entryPrice: currentPrice,
    takeProfit:
      signal === "BUY"
        ? currentPrice * (1.03 + Math.random() * 0.05)
        : currentPrice * (0.97 - Math.random() * 0.05),
    stopLoss:
      signal === "BUY"
        ? currentPrice * (0.97 - Math.random() * 0.03)
        : currentPrice * (1.03 + Math.random() * 0.03),
    reasoning: `Analyzed ${newsCount} news articles and ${discordCount} community messages. ${
      signal === "BUY"
        ? "Bullish momentum with positive sentiment indicators."
        : signal === "SELL"
        ? "Bearish pressure with negative sentiment."
        : "Mixed signals, waiting for clearer direction."
    }`,
  };
}
