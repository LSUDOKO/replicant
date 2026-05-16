import { NextRequest, NextResponse } from "next/server";
import { keccak256, toHex } from "viem";

/**
 * @route POST /api/alignment/scan
 * @description Simulates Alignment Node verification
 * 
 * In production, this would:
 * 1. Connect to decentralized Alignment Node network
 * 2. Run bias detection algorithms
 * 3. Check for goal divergence
 * 4. Verify agent remains helpful, harmless, honest
 * 5. Return alignment verdict with proof
 * 
 * For testnet, we simulate with 95% pass rate using deterministic hashing
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { agentId, genomeHash } = body;

    if (!agentId || !genomeHash) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Simulate alignment scan delay (1-2 seconds)
    await delay(1000 + Math.random() * 1000);

    // Use agentId to determine pass/fail consistently (95% pass rate simulation)
    // This ensures the same agent always gets the same result
    const agentIdNum = typeof agentId === 'string' ? parseInt(agentId) : agentId;
    const passed = (agentIdNum % 20) !== 0; // ~95% pass rate (19 out of 20 pass)

    // Generate DETERMINISTIC alignment verdict hash (no timestamp)
    const alignmentVerdictHash = keccak256(
      toHex(`alignment-verdict-${agentId}-${genomeHash}-${passed ? "pass" : "fail"}-v1`)
    );

    // Generate alignment score deterministically based on agentId
    const alignmentScore = passed 
      ? 80 + (agentIdNum % 20)  // 80-99 for pass
      : agentIdNum % 60;        // 0-59 for fail

    return NextResponse.json({
      success: true,
      passed,
      alignmentVerdictHash,
      alignmentScore,
      checks: {
        biasDetection: passed,
        goalDivergence: passed,
        harmfulnessCheck: passed,
        honestyCheck: passed,
      },
    });
  } catch (error) {
    console.error("Alignment scan failed:", error);
    return NextResponse.json(
      { error: "Alignment scan failed" },
      { status: 500 }
    );
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
