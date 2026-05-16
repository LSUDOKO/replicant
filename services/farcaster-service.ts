/**
 * Farcaster Sentiment Scraping Service
 * Uses Neynar API (FREE tier) to scrape Warpcast channels
 * Get your API key at: https://neynar.com
 */

export interface FarcasterCast {
  hash: string;
  text: string;
  author: string;
  timestamp: number;
  reactions: number;
  recasts: number;
}

export class FarcasterService {
  private static readonly NEYNAR_API = "https://api.neynar.com/v2";
  
  /**
   * Scrape recent casts from Farcaster channels
   * @param channelId - Farcaster channel ID (e.g., "crypto", "ethereum")
   * @param limit - Number of casts to fetch
   */
  static async scrapeSentiment(
    channelId: string = "crypto",
    limit = 50
  ): Promise<string> {
    const apiKey = process.env.NEYNAR_API_KEY;
    
    if (!apiKey) {
      console.log("[FarcasterService] NEYNAR_API_KEY not configured, skipping");
      return "";
    }

    try {
      const response = await fetch(
        `${this.NEYNAR_API}/farcaster/feed/channels?channel_ids=${channelId}&with_recasts=false&limit=${limit}`,
        {
          headers: {
            "accept": "application/json",
            "api_key": apiKey,
          },
          next: { revalidate: 300 }, // Cache for 5 minutes
        }
      );

      if (!response.ok) {
        console.error(`[FarcasterService] API error: ${response.status}`);
        return "";
      }

      const data = await response.json();
      const casts: FarcasterCast[] = [];

      // Parse casts from response
      if (data.casts && Array.isArray(data.casts)) {
        for (const cast of data.casts) {
          if (cast.text && cast.text.length > 10) {
            casts.push({
              hash: cast.hash,
              text: this.cleanText(cast.text),
              author: cast.author?.username || "unknown",
              timestamp: new Date(cast.timestamp).getTime(),
              reactions: cast.reactions?.likes_count || 0,
              recasts: cast.reactions?.recasts_count || 0,
            });
          }
        }
      }

      console.log(`[FarcasterService] Fetched ${casts.length} casts from /${channelId}`);

      // Return concatenated text for sentiment analysis
      return casts.map(c => c.text).join(" | ");
    } catch (error) {
      console.error("[FarcasterService] Failed to scrape:", error);
      return "";
    }
  }

  /**
   * Get sentiment from multiple Farcaster channels
   */
  static async scrapeMultipleChannels(
    channels: string[] = ["crypto", "ethereum", "solana"],
    limit = 25
  ): Promise<{ channel: string; text: string; count: number }[]> {
    const results = await Promise.all(
      channels.map(async (channel) => {
        const text = await this.scrapeSentiment(channel, limit);
        const count = text.split("|").filter(Boolean).length;
        return { channel, text, count };
      })
    );

    return results.filter(r => r.count > 0);
  }

  /**
   * Calculate sentiment score from Farcaster casts
   * Returns value between -1 (bearish) and 1 (bullish)
   */
  static calculateSentiment(text: string): number {
    const bullishWords = [
      "bullish", "moon", "pump", "buy", "long", "up", "gain",
      "breakout", "rally", "surge", "ath", "gm", "wagmi", "lfg"
    ];
    
    const bearishWords = [
      "bearish", "dump", "sell", "short", "down", "loss", "crash",
      "rug", "scam", "rekt", "ngmi", "fud", "bear"
    ];

    const lowerText = text.toLowerCase();
    let score = 0;

    for (const word of bullishWords) {
      const matches = (lowerText.match(new RegExp(word, "g")) || []).length;
      score += matches;
    }

    for (const word of bearishWords) {
      const matches = (lowerText.match(new RegExp(word, "g")) || []).length;
      score -= matches;
    }

    // Normalize to -1 to 1 range
    const maxScore = Math.max(Math.abs(score), 10);
    return Math.max(-1, Math.min(1, score / maxScore));
  }

  /**
   * Clean cast text
   */
  private static cleanText(text: string): string {
    return text
      .replace(/https?:\/\/\S+/g, "") // Remove URLs
      .replace(/@[\w]+/g, "") // Remove mentions
      .replace(/\s+/g, " ") // Normalize whitespace
      .trim()
      .slice(0, 500); // Limit length
  }
}
