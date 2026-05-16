/**
 * Market Data Service - Real-time market intelligence
 * Uses FREE APIs: Binance, CoinGecko, Fear & Greed Index
 */

export interface MarketData {
  price: number;
  volume24h: number;
  priceChange24h: number;
  high24h: number;
  low24h: number;
  marketCap?: number;
  timestamp: number;
}

export interface FearGreedData {
  value: number; // 0-100
  classification: string; // "Extreme Fear" | "Fear" | "Neutral" | "Greed" | "Extreme Greed"
  timestamp: number;
}

export interface GlobalMarketData {
  totalMarketCap: number;
  btcDominance: number;
  ethDominance: number;
  defiMarketCap: number;
  timestamp: number;
}

export class MarketDataService {
  private static readonly BINANCE_API = "https://api.binance.com/api/v3";
  private static readonly COINGECKO_API = "https://api.coingecko.com/api/v3";
  private static readonly FEAR_GREED_API = "https://api.alternative.me/fng/";

  /**
   * Fetch real-time price and 24h stats from Binance
   */
  static async getMarketData(symbol: string): Promise<MarketData> {
    try {
      const response = await fetch(
        `${this.BINANCE_API}/ticker/24hr?symbol=${symbol.toUpperCase()}`,
        { next: { revalidate: 60 } }
      );

      if (!response.ok) {
        throw new Error(`Binance API error: ${response.status}`);
      }

      const data = await response.json();

      return {
        price: parseFloat(data.lastPrice),
        volume24h: parseFloat(data.volume) * parseFloat(data.lastPrice),
        priceChange24h: parseFloat(data.priceChangePercent),
        high24h: parseFloat(data.highPrice),
        low24h: parseFloat(data.lowPrice),
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error("[MarketData] Failed to fetch from Binance:", error);
      throw error;
    }
  }

  /**
   * Fetch Fear & Greed Index (0-100)
   * Source: alternative.me (FREE)
   */
  static async getFearGreedIndex(): Promise<FearGreedData> {
    try {
      const response = await fetch(this.FEAR_GREED_API, {
        next: { revalidate: 3600 }, // Cache for 1 hour
      });

      if (!response.ok) {
        throw new Error(`Fear & Greed API error: ${response.status}`);
      }

      const data = await response.json();
      const latest = data.data[0];

      return {
        value: parseInt(latest.value),
        classification: latest.value_classification,
        timestamp: parseInt(latest.timestamp) * 1000,
      };
    } catch (error) {
      console.error("[MarketData] Failed to fetch Fear & Greed:", error);
      // Return neutral on error
      return {
        value: 50,
        classification: "Neutral",
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Fetch global market data from CoinGecko
   */
  static async getGlobalMarketData(): Promise<GlobalMarketData> {
    try {
      const response = await fetch(`${this.COINGECKO_API}/global`, {
        next: { revalidate: 300 }, // Cache for 5 minutes
      });

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const data = await response.json();
      const global = data.data;

      return {
        totalMarketCap: global.total_market_cap.usd,
        btcDominance: global.market_cap_percentage.btc,
        ethDominance: global.market_cap_percentage.eth,
        defiMarketCap: global.defi_market_cap || 0,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error("[MarketData] Failed to fetch global data:", error);
      throw error;
    }
  }

  /**
   * Calculate volatility from recent price action
   */
  static async calculateVolatility(symbol: string): Promise<number> {
    try {
      // Fetch 24h klines (1h intervals)
      const response = await fetch(
        `${this.BINANCE_API}/klines?symbol=${symbol.toUpperCase()}&interval=1h&limit=24`,
        { next: { revalidate: 3600 } }
      );

      if (!response.ok) {
        return 0.05; // Default 5% volatility
      }

      const klines = await response.json();
      const closes = klines.map((k: any) => parseFloat(k[4]));

      // Calculate standard deviation
      const mean = closes.reduce((a: number, b: number) => a + b, 0) / closes.length;
      const variance =
        closes.reduce((sum: number, price: number) => sum + Math.pow(price - mean, 2), 0) /
        closes.length;
      const stdDev = Math.sqrt(variance);

      // Return as percentage
      return stdDev / mean;
    } catch (error) {
      console.error("[MarketData] Failed to calculate volatility:", error);
      return 0.05; // Default 5%
    }
  }

  /**
   * Get comprehensive market context for signal generation
   */
  static async getMarketContext(asset: string): Promise<{
    price: MarketData;
    fearGreed: FearGreedData;
    global: GlobalMarketData;
    volatility: number;
  }> {
    const symbol = `${asset}USDT`;

    const [price, fearGreed, global, volatility] = await Promise.all([
      this.getMarketData(symbol),
      this.getFearGreedIndex(),
      this.getGlobalMarketData(),
      this.calculateVolatility(symbol),
    ]);

    return { price, fearGreed, global, volatility };
  }
}
