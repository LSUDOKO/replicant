/**
 * Whale Tracker Service
 * Monitors large crypto transfers using Etherscan API (FREE tier)
 * Get your API key at: https://etherscan.io/apis
 */

export interface WhaleTransfer {
  hash: string;
  from: string;
  to: string;
  value: string;
  valueUSD: number;
  token: string;
  timestamp: number;
  blockNumber: number;
}

export interface WhaleActivity {
  totalTransfers: number;
  totalVolumeUSD: number;
  largeInflows: number;
  largeOutflows: number;
  netFlow: number;
  sentiment: "ACCUMULATION" | "DISTRIBUTION" | "NEUTRAL";
}

export class WhaleTrackerService {
  private static readonly ETHERSCAN_API = "https://api.etherscan.io/api";
  private static readonly WHALE_THRESHOLD_USD = 100000; // $100k+ = whale

  // Common token addresses (Ethereum mainnet)
  private static readonly TOKEN_ADDRESSES = {
    USDT: "0xdac17f958d2ee523a2206206994597c13d831ec7",
    USDC: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    WETH: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    DAI: "0x6b175474e89094c44da98b954eedeac495271d0f",
  };

  /**
   * Track whale transfers for a specific token
   * @param tokenSymbol - Token symbol (USDT, USDC, WETH, DAI)
   * @param hours - Number of hours to look back
   */
  static async trackWhaleTransfers(
    tokenSymbol: string = "USDT",
    hours = 24
  ): Promise<WhaleActivity> {
    const apiKey = process.env.ETHERSCAN_API_KEY;
    
    if (!apiKey) {
      console.log("[WhaleTracker] ETHERSCAN_API_KEY not configured, using mock data");
      return this.getMockWhaleActivity();
    }

    const tokenAddress = this.TOKEN_ADDRESSES[tokenSymbol as keyof typeof this.TOKEN_ADDRESSES];
    
    if (!tokenAddress) {
      console.error(`[WhaleTracker] Unknown token: ${tokenSymbol}`);
      return this.getMockWhaleActivity();
    }

    try {
      // Get recent token transfers
      const response = await fetch(
        `${this.ETHERSCAN_API}?module=account&action=tokentx&contractaddress=${tokenAddress}&page=1&offset=100&sort=desc&apikey=${apiKey}`,
        { next: { revalidate: 600 } } // Cache for 10 minutes
      );

      if (!response.ok) {
        console.error(`[WhaleTracker] API error: ${response.status}`);
        return this.getMockWhaleActivity();
      }

      const data = await response.json();

      if (data.status !== "1" || !data.result) {
        console.error("[WhaleTracker] Invalid API response");
        return this.getMockWhaleActivity();
      }

      const transfers: WhaleTransfer[] = [];
      const cutoffTime = Date.now() - hours * 3600 * 1000;

      // Parse transfers
      for (const tx of data.result) {
        const timestamp = parseInt(tx.timeStamp) * 1000;
        
        if (timestamp < cutoffTime) continue;

        const value = parseInt(tx.value) / Math.pow(10, parseInt(tx.tokenDecimal));
        const valueUSD = value; // Simplified: assume stablecoin = $1

        // Only track whale transfers
        if (valueUSD >= this.WHALE_THRESHOLD_USD) {
          transfers.push({
            hash: tx.hash,
            from: tx.from,
            to: tx.to,
            value: value.toFixed(2),
            valueUSD,
            token: tx.tokenSymbol,
            timestamp,
            blockNumber: parseInt(tx.blockNumber),
          });
        }
      }

      console.log(`[WhaleTracker] Found ${transfers.length} whale transfers for ${tokenSymbol}`);

      return this.analyzeWhaleActivity(transfers);
    } catch (error) {
      console.error("[WhaleTracker] Failed to track transfers:", error);
      return this.getMockWhaleActivity();
    }
  }

  /**
   * Track whale activity across multiple tokens
   */
  static async trackMultipleTokens(
    tokens: string[] = ["USDT", "USDC"],
    hours = 24
  ): Promise<{ token: string; activity: WhaleActivity }[]> {
    const results = await Promise.all(
      tokens.map(async (token) => {
        const activity = await this.trackWhaleTransfers(token, hours);
        return { token, activity };
      })
    );

    return results;
  }

  /**
   * Analyze whale activity to determine sentiment
   */
  private static analyzeWhaleActivity(transfers: WhaleTransfer[]): WhaleActivity {
    let totalVolumeUSD = 0;
    let largeInflows = 0;
    let largeOutflows = 0;

    // Known exchange addresses (simplified)
    const exchangeAddresses = new Set([
      "0x28c6c06298d514db089934071355e5743bf21d60", // Binance
      "0x21a31ee1afc51d94c2efccaa2092ad1028285549", // Binance 2
      "0xdfd5293d8e347dfe59e90efd55b2956a1343963d", // Binance 3
      "0x56eddb7aa87536c09ccc2793473599fd21a8b17f", // Binance 4
      "0x9696f59e4d72e237be84ffd425dcad154bf96976", // Binance 5
      "0x4e9ce36e442e55ecd9025b9a6e0d88485d628a67", // Binance 6
      "0xbe0eb53f46cd790cd13851d5eff43d12404d33e8", // Binance 7
      "0xf977814e90da44bfa03b6295a0616a897441acec", // Binance 8
    ]);

    for (const transfer of transfers) {
      totalVolumeUSD += transfer.valueUSD;

      // Inflow = transfer TO exchange
      if (exchangeAddresses.has(transfer.to.toLowerCase())) {
        largeOutflows += transfer.valueUSD;
      }
      // Outflow = transfer FROM exchange
      else if (exchangeAddresses.has(transfer.from.toLowerCase())) {
        largeInflows += transfer.valueUSD;
      }
    }

    const netFlow = largeInflows - largeOutflows;
    const netFlowRatio = totalVolumeUSD > 0 ? netFlow / totalVolumeUSD : 0;

    let sentiment: "ACCUMULATION" | "DISTRIBUTION" | "NEUTRAL";
    
    if (netFlowRatio > 0.2) {
      sentiment = "ACCUMULATION"; // More outflows from exchanges = buying
    } else if (netFlowRatio < -0.2) {
      sentiment = "DISTRIBUTION"; // More inflows to exchanges = selling
    } else {
      sentiment = "NEUTRAL";
    }

    return {
      totalTransfers: transfers.length,
      totalVolumeUSD,
      largeInflows,
      largeOutflows,
      netFlow,
      sentiment,
    };
  }

  /**
   * Get mock whale activity (fallback when API key not configured)
   */
  private static getMockWhaleActivity(): WhaleActivity {
    const random = Math.random();
    
    return {
      totalTransfers: Math.floor(10 + random * 20),
      totalVolumeUSD: 5000000 + random * 10000000,
      largeInflows: 3000000 + random * 5000000,
      largeOutflows: 2000000 + random * 5000000,
      netFlow: (random - 0.5) * 2000000,
      sentiment: random > 0.6 ? "ACCUMULATION" : random < 0.4 ? "DISTRIBUTION" : "NEUTRAL",
    };
  }

  /**
   * Calculate whale sentiment score
   * Returns value between -1 (distribution) and 1 (accumulation)
   */
  static calculateSentiment(activity: WhaleActivity): number {
    if (activity.totalVolumeUSD === 0) return 0;
    
    const netFlowRatio = activity.netFlow / activity.totalVolumeUSD;
    return Math.max(-1, Math.min(1, netFlowRatio * 2));
  }
}
