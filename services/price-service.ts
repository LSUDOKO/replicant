/**
 * Live Price Service
 * Fetches real-time market data from Binance public API (no auth required)
 */

export interface PriceData {
  symbol: string;
  price: number;
  timestamp: number;
}

export class PriceService {
  private static readonly BINANCE_API = "https://api.binance.com/api/v3";

  /**
   * Fetch current price for a trading pair
   * @param symbol - Trading pair (e.g., "SOLUSDT", "ETHUSDT")
   */
  static async getCurrentPrice(symbol: string): Promise<PriceData> {
    try {
      const response = await fetch(
        `${this.BINANCE_API}/ticker/price?symbol=${symbol.toUpperCase()}`,
        { next: { revalidate: 60 } } // Cache for 60 seconds
      );

      if (!response.ok) {
        throw new Error(`Binance API error: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        symbol: data.symbol,
        price: parseFloat(data.price),
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error("[PriceService] Failed to fetch price:", error);
      throw new Error(
        `Failed to fetch ${symbol} price: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Fetch 24h price change statistics
   */
  static async get24hStats(symbol: string) {
    try {
      const response = await fetch(
        `${this.BINANCE_API}/ticker/24hr?symbol=${symbol.toUpperCase()}`,
        { next: { revalidate: 300 } }
      );

      if (!response.ok) {
        throw new Error(`Binance API error: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        symbol: data.symbol,
        priceChange: parseFloat(data.priceChange),
        priceChangePercent: parseFloat(data.priceChangePercent),
        highPrice: parseFloat(data.highPrice),
        lowPrice: parseFloat(data.lowPrice),
        volume: parseFloat(data.volume),
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error("[PriceService] Failed to fetch 24h stats:", error);
      throw error;
    }
  }
}
