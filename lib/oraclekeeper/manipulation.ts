import type { RawPrice, ManipulationRisk } from "./types";

interface DetectionResult {
  detected: boolean;
  severity: ManipulationRisk;
  reason: string;
  sourcesToReject: string[];
}

export class ManipulationDetectionService {
  detectAll(prices: RawPrice[], validPrices: RawPrice[], median: bigint): DetectionResult[] {
    const results: DetectionResult[] = [];

    const flashLoan = this.detectFlashLoan(prices, validPrices);
    if (flashLoan) results.push(flashLoan);

    const washTrading = this.detectWashTrading(validPrices);
    if (washTrading) results.push(washTrading);

    const staleFeed = this.detectStaleFeed(prices, validPrices, median);
    if (staleFeed) results.push(staleFeed);

    const spreadManip = this.detectSpreadManipulation(validPrices);
    if (spreadManip) results.push(spreadManip);

    return results;
  }

  private detectFlashLoan(allPrices: RawPrice[], validPrices: RawPrice[]): DetectionResult | null {
    const dexPrices = allPrices.filter((p) => {
      const isDex = ["uniswap-v3", "curve", "balancer", "sushiswap"].includes(p.source);
      return isDex;
    });
    const cexPrices = allPrices.filter((p) => {
      const isCex = ["binance", "coinbase", "kraken", "okx", "bybit"].includes(p.source);
      return isCex;
    });

    if (dexPrices.length === 0 || cexPrices.length === 0) return null;

    const cexSorted = [...cexPrices].sort((a, b) => (a.price < b.price ? -1 : a.price > b.price ? 1 : 0));
    const cexMedian = cexSorted[Math.floor(cexSorted.length / 2)].price;
    const cexMedianNum = Number(cexMedian);

    const outliers: string[] = [];

    for (const dp of dexPrices) {
      const deviation = Math.abs(Number(dp.price) / 1e18 - cexMedianNum) / cexMedianNum;
      if (deviation > 0.05) {
        const volRatio = validPrices.length > 0
          ? Number(dp.volume24h) / (validPrices.reduce((s, p) => s + Number(p.volume24h), 0) / validPrices.length)
          : 1;
        if (volRatio > 5 || deviation > 0.1) {
          outliers.push(dp.source);
        }
      }
    }

    if (outliers.length > 0) {
      return {
        detected: true,
        severity: "CRITICAL",
        reason: `Flash loan suspected on DEX sources: ${outliers.join(", ")}. Price deviation >5% with abnormal volume.`,
        sourcesToReject: outliers,
      };
    }

    return null;
  }

  private detectWashTrading(validPrices: RawPrice[]): DetectionResult | null {
    if (validPrices.length < 3) return null;

    const volumes = validPrices.map((p) => ({ source: p.source, vol: Number(p.volume24h) }));
    const avgVol = volumes.reduce((s, v) => s + v.vol, 0) / volumes.length;

    const anomalies = volumes.filter((v) => v.vol > avgVol * 10);
    if (anomalies.length > 0) {
      return {
        detected: true,
        severity: "HIGH",
        reason: `Wash trading suspected: ${anomalies.map((a) => a.source).join(", ")} have volume >10x average (avg: ${avgVol.toFixed(0)}, anomaly: ${anomalies.map((a) => a.vol.toFixed(0)).join(", ")})`,
        sourcesToReject: anomalies.map((a) => a.source),
      };
    }

    return null;
  }

  private detectStaleFeed(allPrices: RawPrice[], validPrices: RawPrice[], median: bigint): DetectionResult | null {
    const now = Date.now();

    if (allPrices.length < 4 || validPrices.length < 3) return null;

    const recentCutoff = now - 15000;
    const recentSources = allPrices.filter((p) => p.timestamp >= recentCutoff);
    const oldSources = allPrices.filter((p) => p.timestamp < recentCutoff && now - p.timestamp > 30000);

    if (recentSources.length >= 3 && oldSources.length >= 1) {
      const medianNum = Number(median) / 1e18;
      const staleOutliers: string[] = [];

      for (const os of oldSources) {
        const priceNum = Number(os.price) / 1e18;
        const deviation = Math.abs(priceNum - medianNum) / medianNum;
        if (deviation > 0.005) {
          staleOutliers.push(os.source);
        }
      }

      if (staleOutliers.length > 0) {
        return {
          detected: true,
          severity: "HIGH",
          reason: `Stale feed attack suspected: ${staleOutliers.join(", ")} have delayed updates with significant deviation (>0.5%) from recent consensus.`,
          sourcesToReject: staleOutliers,
        };
      }
    }

    return null;
  }

  private detectSpreadManipulation(validPrices: RawPrice[]): DetectionResult | null {
    const wideSpread = validPrices.filter((p) => p.spread > 2.0);

    if (wideSpread.length > 0) {
      return {
        detected: true,
        severity: "MEDIUM",
        reason: `Unusually wide bid-ask spreads detected: ${wideSpread.map((p) => `${p.source} (${p.spread.toFixed(2)}%)`).join(", ")}. Low real liquidity suspected.`,
        sourcesToReject: wideSpread.map((p) => p.source),
      };
    }

    return null;
  }
}
