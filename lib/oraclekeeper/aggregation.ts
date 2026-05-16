import type { RawPrice, PriceAggregate, ManipulationRisk } from "./types";
import { SOURCE_DEFINITIONS } from "./types";
import { FETCH_FUNCTIONS } from "./sources";

function toNumber(bn: bigint): number {
  return Number(bn) / 1e18;
}

export class PriceAggregationService {
  private readonly STALE_MS = 30000;
  private readonly MAX_DEVIATION = 0.02;
  private readonly MIN_SOURCES = 3;

  async fetchAllPrices(pair: string): Promise<RawPrice[]> {
    const results = await Promise.allSettled(
      Object.entries(FETCH_FUNCTIONS).map(async ([id, fn]) => {
        try {
          const price = await fn(pair);
          return { id, price };
        } catch (err) {
          return { id, error: err };
        }
      })
    );

    const prices: RawPrice[] = [];
    for (const result of results) {
      if (result.status === "fulfilled") {
        if ("error" in result.value) continue;
        prices.push(result.value.price);
      }
    }

    return prices;
  }

  aggregate(prices: RawPrice[], pair: string): PriceAggregate {
    const allResults: { source: string; price: number; status: "accepted" | "rejected"; reason?: string }[] = [];
    const rejectionReasons: string[] = [];

    if (prices.length < this.MIN_SOURCES) {
      return {
        pair, consensusPrice: 0n, consensusDecimal: 0,
        twap: 0n, sourcesUsed: 0, sourcesRejected: 0,
        maxDeviation: 0, confidence: 0,
        manipulationRisk: "HIGH",
        rejectionReasons: [`Insufficient sources: ${prices.length}/${this.MIN_SOURCES}`],
        allPrices: prices.map((p) => ({ source: p.source, price: toNumber(p.price), status: "rejected", reason: "Insufficient total sources" })),
        lastUpdate: Date.now(),
      };
    }

    const now = Date.now();
    const freshPrices = prices.filter((p) => now - p.timestamp < this.STALE_MS);

    if (freshPrices.length < this.MIN_SOURCES) {
      rejectionReasons.push(`${prices.length - freshPrices.length} stale sources rejected`);
    }

    const workPrices = freshPrices.length >= this.MIN_SOURCES ? freshPrices : prices;

    const sorted = [...workPrices].sort((a, b) => (a.price < b.price ? -1 : a.price > b.price ? 1 : 0));
    const median = sorted[Math.floor(sorted.length / 2)].price;

    const validPrices: RawPrice[] = [];
    const rejectedPrices: RawPrice[] = [];

    for (const p of workPrices) {
      const deviation = p.price > median
        ? Number((p.price - median) * 10000n / median) / 100
        : Number((median - p.price) * 10000n / median) / 100;

      if (deviation <= this.MAX_DEVIATION * 100) {
        validPrices.push(p);
        allResults.push({ source: p.source, price: toNumber(p.price), status: "accepted" });
      } else {
        rejectedPrices.push(p);
        rejectionReasons.push(`${p.source}: Outlier (${deviation.toFixed(2)}% from median)`);
        allResults.push({ source: p.source, price: toNumber(p.price), status: "rejected", reason: `Outlier ${deviation.toFixed(2)}% from median` });
      }
    }

    if (validPrices.length < this.MIN_SOURCES) {
      return {
        pair, consensusPrice: 0n, consensusDecimal: 0,
        twap: 0n, sourcesUsed: validPrices.length, sourcesRejected: rejectedPrices.length,
        maxDeviation: 0, confidence: 0, manipulationRisk: "CRITICAL",
        rejectionReasons: [`Insufficient valid sources after outlier rejection: ${validPrices.length}/${this.MIN_SOURCES}`, ...rejectionReasons],
        allPrices: allResults, lastUpdate: Date.now(),
      };
    }

    const validSorted = [...validPrices].sort((a, b) => (a.price < b.price ? -1 : a.price > b.price ? 1 : 0));
    const consensus = validSorted[Math.floor(validSorted.length / 2)].price;

    const totalVolume = validPrices.reduce((sum, p) => sum + p.volume24h, 0n);
    const twap = totalVolume > 0n
      ? validPrices.reduce((sum, p) => sum + (p.price * p.volume24h / totalVolume), 0n)
      : consensus;

    const deviations = validPrices.map((p) => {
      const diff = p.price > consensus ? p.price - consensus : consensus - p.price;
      return Number(diff * 10000n / consensus) / 100;
    });
    const maxDeviation = Math.max(...deviations, 0);

    const sourceTypes = new Set(validPrices.map((p) => {
      const def = SOURCE_DEFINITIONS.find((s) => s.id === p.source);
      return def?.type || "cex";
    }));
    const hasCEX = sourceTypes.has("cex");
    const hasDEX = sourceTypes.has("dex");

    let confidence = Math.min(validPrices.length * 12, 50);
    const avgDev = deviations.reduce((a, b) => a + b, 0) / deviations.length;
    confidence += Math.max(0, 25 - avgDev * 10);
    if (hasCEX && hasDEX) confidence += 20;
    else if (hasCEX || hasDEX) confidence += 10;

    const avgSpread = validPrices.reduce((s, p) => s + p.spread, 0) / validPrices.length;
    if (avgSpread < 0.1) confidence += 5;

    const manipulationRisk = this.assessManipulationRisk(validPrices, rejectedPrices, workPrices.length);

    return {
      pair,
      consensusPrice: consensus,
      consensusDecimal: toNumber(consensus),
      twap,
      sourcesUsed: validPrices.length,
      sourcesRejected: rejectedPrices.length,
      maxDeviation,
      confidence: Math.min(Math.round(confidence), 100),
      manipulationRisk,
      rejectionReasons,
      allPrices: allResults,
      lastUpdate: Date.now(),
    };
  }

  private assessManipulationRisk(
    valid: RawPrice[],
    rejected: RawPrice[],
    totalSubmitted: number
  ): ManipulationRisk {
    let riskScore = 0;

    const rejectionRate = rejected.length / Math.max(totalSubmitted, 1);
    if (rejectionRate > 0.5) riskScore += 4;
    else if (rejectionRate > 0.3) riskScore += 2;

    const highSpread = valid.filter((p) => p.spread > 1.0).length;
    if (highSpread >= 2) riskScore += 3;
    else if (highSpread >= 1) riskScore += 1;

    const volumes = valid.map((p) => Number(p.volume24h));
    if (volumes.length > 1) {
      const avgVol = volumes.reduce((a, b) => a + b, 0) / volumes.length;
      const volOutliers = valid.filter((p) => {
        const v = Number(p.volume24h);
        return v > avgVol * 10 || v < avgVol / 10;
      }).length;
      if (volOutliers > 1) riskScore += 2;
    }

    const now = Date.now();
    const staleSources = valid.filter((p) => now - p.timestamp > 60000).length;
    if (staleSources > 2) riskScore += 1;

    const sourceWeights = valid.map((p) => {
      const def = SOURCE_DEFINITIONS.find((s) => s.id === p.source);
      return def?.weight || 0.5;
    });
    if (sourceWeights.length > 0 && Math.max(...sourceWeights) > 0.4) riskScore += 1;

    if (riskScore >= 7) return "CRITICAL";
    if (riskScore >= 5) return "HIGH";
    if (riskScore >= 3) return "MEDIUM";
    if (riskScore >= 1) return "LOW";
    return "NONE";
  }
}
