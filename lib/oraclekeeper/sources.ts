import type { RawPrice } from "./types";

interface CacheEntry { data: unknown; timestamp: number }
const fetchCache = new Map<string, CacheEntry>();
const CACHE_TTL = 5000;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchJson(url: string, timeoutMs = 10000): Promise<any> {
  const cached = fetchCache.get(url);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) return cached.data;

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal, headers: { "User-Agent": "REPLICANT-OracleKeeper/1.0" } });
    clearTimeout(id);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    fetchCache.set(url, { data, timestamp: Date.now() });
    return data;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

const PAIR_MAP: Record<string, Record<string, string>> = {
  "ETH/USDC": { binance: "ETHUSDC", coinbase: "ETH-USD", kraken: "ETHUSD", okx: "ETH-USDC", bybit: "ETHUSDC", bitfinex: "ethusd", coingeckoId: "ethereum", cryptocompare: "ETH" },
  "BTC/USDC": { binance: "BTCUSDC", coinbase: "BTC-USD", kraken: "XBTUSD", okx: "BTC-USDC", bybit: "BTCUSDC", bitfinex: "btcusd", coingeckoId: "bitcoin", cryptocompare: "BTC" },
  "SOL/USDC": { binance: "SOLUSDC", coinbase: "SOL-USD", kraken: "SOLUSD", okx: "SOL-USDC", bybit: "SOLUSDC", bitfinex: "solusd", coingeckoId: "solana", cryptocompare: "SOL" },
  "LINK/USDC": { binance: "LINKUSDC", coinbase: "LINK-USD", kraken: "LINKUSD", okx: "LINK-USDC", bybit: "LINKUSDC", bitfinex: "linkusd", coingeckoId: "chainlink", cryptocompare: "LINK" },
  "ARB/USDC": { binance: "ARBUSDC", coinbase: "ARB-USD", kraken: "ARBUSD", okx: "ARB-USDC", bybit: "ARBUSDC", bitfinex: "arbusd", coingeckoId: "arbitrum", cryptocompare: "ARB" },
};

function toWei(value: string): bigint {
  const [whole, fraction = ""] = value.split(".");
  const padded = fraction.padEnd(18, "0").slice(0, 18);
  return BigInt(whole + padded);
}

function parseNumber(val: string | undefined | null, fallback = "0"): string {
  return val || fallback;
}

export async function fetchBinance(pair: string): Promise<RawPrice> {
  const symbol = PAIR_MAP[pair]?.binance;
  if (!symbol) throw new Error(`Unsupported pair: ${pair}`);
  const data = await fetchJson(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`);
  const price = parseNumber(data.lastPrice);
  const bid = parseNumber(data.bidPrice);
  const ask = parseNumber(data.askPrice);
  return {
    source: "binance", pair,
    price: toWei(price), priceDecimal: parseFloat(price),
    timestamp: data.closeTime || Date.now(),
    volume24h: toWei(parseNumber(data.volume)),
    bid: toWei(bid), ask: toWei(ask),
    spread: parseFloat(ask) && parseFloat(price) ? ((parseFloat(ask) - parseFloat(bid)) / parseFloat(price)) * 100 : 0,
  };
}

export async function fetchCoinbase(pair: string): Promise<RawPrice> {
  const prod = PAIR_MAP[pair]?.coinbase;
  if (!prod) throw new Error(`Unsupported pair: ${pair}`);
  const data = await fetchJson(`https://api.exchange.coinbase.com/products/${prod}/ticker`);
  const price = parseNumber(data.price);
  const bid = parseNumber(data.bid);
  const ask = parseNumber(data.ask);
  return {
    source: "coinbase", pair,
    price: toWei(price), priceDecimal: parseFloat(price),
    timestamp: data.time ? new Date(data.time).getTime() : Date.now(),
    volume24h: toWei(parseNumber(data.volume)),
    bid: toWei(bid), ask: toWei(ask),
    spread: parseFloat(ask) && parseFloat(price) ? ((parseFloat(ask) - parseFloat(bid)) / parseFloat(price)) * 100 : 0,
  };
}

export async function fetchKraken(pair: string): Promise<RawPrice> {
  const kpair = PAIR_MAP[pair]?.kraken;
  if (!kpair) throw new Error(`Unsupported pair: ${pair}`);
  const data = await fetchJson(`https://api.kraken.com/0/public/Ticker?pair=${kpair}`);
  if (data.error?.length) throw new Error(`Kraken: ${data.error[0]}`);
  const ticker = data.result[Object.keys(data.result)[0]];
  const price = parseNumber(ticker?.c?.[0]);
  const bid = parseNumber(ticker?.b?.[0]);
  const ask = parseNumber(ticker?.a?.[0]);
  return {
    source: "kraken", pair,
    price: toWei(price), priceDecimal: parseFloat(price),
    timestamp: Date.now(),
    volume24h: toWei(parseNumber(ticker?.v?.[1])),
    bid: toWei(bid), ask: toWei(ask),
    spread: parseFloat(ask) && parseFloat(price) ? ((parseFloat(ask) - parseFloat(bid)) / parseFloat(price)) * 100 : 0,
  };
}

export async function fetchOKX(pair: string): Promise<RawPrice> {
  const instId = PAIR_MAP[pair]?.okx;
  if (!instId) throw new Error(`Unsupported pair: ${pair}`);
  const data = await fetchJson(`https://www.okx.com/api/v5/market/ticker?instId=${instId}`);
  const ticker = data?.data?.[0];
  if (!ticker) throw new Error("OKX: no data");
  const price = parseNumber(ticker.last);
  const bid = parseNumber(ticker.bidPx);
  const ask = parseNumber(ticker.askPx);
  return {
    source: "okx", pair,
    price: toWei(price), priceDecimal: parseFloat(price),
    timestamp: parseInt(ticker.ts || "0") || Date.now(),
    volume24h: toWei(parseNumber(ticker.volCcy24h)),
    bid: toWei(bid), ask: toWei(ask),
    spread: parseFloat(ask) && parseFloat(price) ? ((parseFloat(ask) - parseFloat(bid)) / parseFloat(price)) * 100 : 0,
  };
}

export async function fetchBybit(pair: string): Promise<RawPrice> {
  const symbol = PAIR_MAP[pair]?.bybit;
  if (!symbol) throw new Error(`Unsupported pair: ${pair}`);
  const data = await fetchJson(`https://api.bybit.com/v5/market/tickers?category=spot&symbol=${symbol}`);
  const ticker = data?.result?.list?.[0];
  if (!ticker) throw new Error("Bybit: no data");
  const price = parseNumber(ticker.lastPrice);
  const bid = parseNumber(ticker.bid1Price);
  const ask = parseNumber(ticker.ask1Price);
  return {
    source: "bybit", pair,
    price: toWei(price), priceDecimal: parseFloat(price),
    timestamp: parseInt(ticker.timestamp || "0") || Date.now(),
    volume24h: toWei(parseNumber(ticker.volume24h)),
    bid: toWei(bid), ask: toWei(ask),
    spread: parseFloat(ask) && parseFloat(price) ? ((parseFloat(ask) - parseFloat(bid)) / parseFloat(price)) * 100 : 0,
  };
}

export async function fetchBitfinex(pair: string): Promise<RawPrice> {
  const bpair = PAIR_MAP[pair]?.bitfinex;
  if (!bpair) throw new Error(`Unsupported pair: ${pair}`);
  const data = await fetchJson(`https://api.bitfinex.com/v1/pubticker/${bpair}`);
  const price = parseNumber(data.last_price);
  const bid = parseNumber(data.bid);
  const ask = parseNumber(data.ask);
  return {
    source: "bitfinex", pair,
    price: toWei(price), priceDecimal: parseFloat(price),
    timestamp: parseInt(data.timestamp || "0") * 1000 || Date.now(),
    volume24h: toWei(parseNumber(data.volume)),
    bid: toWei(bid), ask: toWei(ask),
    spread: parseFloat(ask) && parseFloat(price) ? ((parseFloat(ask) - parseFloat(bid)) / parseFloat(price)) * 100 : 0,
  };
}

export async function fetchCoinGecko(pair: string): Promise<RawPrice> {
  const id = PAIR_MAP[pair]?.coingeckoId;
  if (!id) throw new Error(`Unsupported pair: ${pair}`);
  const data = await fetchJson(`https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd&include_24hr_vol=true`);
  const coin = data[id];
  if (!coin) throw new Error(`CoinGecko: no data for ${id}`);
  const price = parseNumber(coin.usd?.toString());
  const vol = parseNumber(coin.usd_24h_vol?.toString());
  return {
    source: "coingecko", pair,
    price: toWei(price), priceDecimal: parseFloat(price),
    timestamp: Date.now(),
    volume24h: toWei(vol),
    bid: toWei(price), ask: toWei(price), spread: 0,
  };
}

export async function fetchCryptoCompare(pair: string): Promise<RawPrice> {
  const fsym = PAIR_MAP[pair]?.cryptocompare;
  if (!fsym) throw new Error(`Unsupported pair: ${pair}`);
  const data = await fetchJson(`https://min-api.cryptocompare.com/data/price?fsym=${fsym}&tsyms=USD`);
  const price = parseNumber(data.USD?.toString());
  return {
    source: "cryptocompare", pair,
    price: toWei(price), priceDecimal: parseFloat(price),
    timestamp: Date.now(),
    volume24h: toWei("0"),
    bid: toWei(price), ask: toWei(price), spread: 0,
  };
}

export function getMappedPair(pair: string): string | null {
  return PAIR_MAP[pair] ? pair : null;
}

export const FETCH_FUNCTIONS: Record<string, (pair: string) => Promise<RawPrice>> = {
  binance: fetchBinance,
  coinbase: fetchCoinbase,
  kraken: fetchKraken,
  okx: fetchOKX,
  bybit: fetchBybit,
  bitfinex: fetchBitfinex,
  coingecko: fetchCoinGecko,
  cryptocompare: fetchCryptoCompare,
};
