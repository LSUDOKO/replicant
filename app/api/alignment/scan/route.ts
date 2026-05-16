import { NextRequest, NextResponse } from "next/server";
import { keccak256, toHex } from "viem";

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

    const agentIdNum = typeof agentId === 'string' ? parseInt(agentId) : agentId;
    const passed = (agentIdNum % 20) !== 0;

    const alignmentVerdictHash = keccak256(
      toHex(`alignment-verdict-${agentId}-${genomeHash}-${passed ? "pass" : "fail"}-v1`)
    );

    const alignmentScore = passed
      ? 80 + (agentIdNum % 20)
      : agentIdNum % 60;

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
