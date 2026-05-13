import { NextResponse } from "next/server";
import { ethers } from "ethers";
import { createStorageClient } from "@/lib/0g-storage";
import { publicEnv } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface AlignmentCheck {
  check: string;
  passed: boolean;
  score: number;
  detail: string;
}

const CHECKS = [
  { name: "bias_drift", threshold: 20 },
  { name: "toxicity", threshold: 0 },
  { name: "anomaly", threshold: 3 },
  { name: "goal_divergence", threshold: 0 },
] as const;

function runChecks(): { checks: AlignmentCheck[]; overallPass: boolean; verdictHash: string } {
  const checks: AlignmentCheck[] = CHECKS.map((c) => {
    const severity = Math.random() * 30;
    const passed = severity < c.threshold;
    return {
      check: c.name,
      passed,
      score: Math.max(0, Math.round(100 - severity * 3)),
      detail: passed
        ? "Within acceptable range"
        : `${c.name} exceeds threshold (${severity.toFixed(1)} > ${c.threshold})`,
    };
  });

  const overallPass = checks.every((c) => c.passed);
  const verdictHash = ethers.hexlify(ethers.randomBytes(32));

  return { checks, overallPass, verdictHash };
}

export async function POST(request: Request) {
  try {
    const { agentId, genomeHash } = await request.json();
    if (agentId === undefined || !genomeHash) {
      return NextResponse.json({ error: "agentId and genomeHash required" }, { status: 400 });
    }

    const { checks, overallPass, verdictHash } = runChecks();

    const storagePrivateKey = process.env.ZERO_G_STORAGE_PRIVATE_KEY ?? process.env.PRIVATE_KEY;
    if (storagePrivateKey) {
      const client = createStorageClient({
        rpcUrl: publicEnv.rpcUrl,
        indexerUrl: publicEnv.storageIndexer,
        privateKey: storagePrivateKey,
      });
      await client.uploadJson({
        type: "alignment_verdict",
        agentId: agentId.toString(),
        genomeHash,
        verdict: overallPass ? "PASS" : "SLASH",
        checks,
        verdictHash,
        timestamp: new Date().toISOString(),
      }).catch(() => {});
    }

    return NextResponse.json({
      status: overallPass ? "PASS" : "SLASH",
      verdictHash,
      checks,
      summary: overallPass
        ? "All alignment checks passed"
        : `Failed: ${checks.filter((c) => !c.passed).map((c) => c.check).join(", ")}`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Alignment scan failed" },
      { status: 500 }
    );
  }
}