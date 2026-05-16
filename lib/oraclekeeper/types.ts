export type SourceType = "cex" | "dex" | "aggregated";
export type ManipulationRisk = "NONE" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface PriceSource {
  id: string;
  name: string;
  type: SourceType;
  weight: number;
  url: string;
  active: boolean;
}

export interface RawPrice {
  source: string;
  pair: string;
  price: bigint;
  priceDecimal: number;
  timestamp: number;
  volume24h: bigint;
  bid: bigint;
  ask: bigint;
  spread: number;
}

export interface PriceAggregate {
  pair: string;
  consensusPrice: bigint;
  consensusDecimal: number;
  twap: bigint;
  sourcesUsed: number;
  sourcesRejected: number;
  maxDeviation: number;
  confidence: number;
  manipulationRisk: ManipulationRisk;
  rejectionReasons: string[];
  allPrices: { source: string; price: number; status: "accepted" | "rejected"; reason?: string }[];
  lastUpdate: number;
}

export interface SourceStatus {
  id: string;
  name: string;
  type: SourceType;
  weight: number;
  status: "active" | "stale" | "error";
  lastUpdate: number;
  latency: number;
  price?: number;
}

export interface OracleStats {
  totalPublications: number;
  accuracy: number;
  currentStreak: number;
  bestStreak: number;
  activeSources: number;
  pairs: string[];
}

export const PRICE_PAIRS = ["ETH/USDC", "BTC/USDC", "SOL/USDC", "LINK/USDC", "ARB/USDC"];

export const SOURCE_DEFINITIONS: PriceSource[] = [
  { id: "binance", name: "Binance", type: "cex", weight: 0.95, url: "https://api.binance.com/api/v3/ticker/24hr?symbol={PAIR}", active: true },
  { id: "coinbase", name: "Coinbase Pro", type: "cex", weight: 0.95, url: "https://api.exchange.coinbase.com/products/{PAIR}/ticker", active: true },
  { id: "kraken", name: "Kraken", type: "cex", weight: 0.90, url: "https://api.kraken.com/0/public/Ticker?pair={PAIR}", active: true },
  { id: "okx", name: "OKX", type: "cex", weight: 0.85, url: "https://www.okx.com/api/v5/market/ticker?instId={PAIR}", active: true },
  { id: "bybit", name: "Bybit", type: "cex", weight: 0.85, url: "https://api.bybit.com/v5/market/tickers?category=spot&symbol={PAIR}", active: true },
  { id: "bitfinex", name: "Bitfinex", type: "cex", weight: 0.80, url: "https://api.bitfinex.com/v1/pubticker/{PAIR}", active: true },
  { id: "coingecko", name: "CoinGecko", type: "aggregated", weight: 0.70, url: "https://api.coingecko.com/api/v3/simple/price?ids={ID}&vs_currencies=usd&include_24hr_vol=true", active: true },
  { id: "cryptocompare", name: "CryptoCompare", type: "aggregated", weight: 0.65, url: "https://min-api.cryptocompare.com/data/price?fsym={FSYM}&tsyms=USD", active: true },
];
