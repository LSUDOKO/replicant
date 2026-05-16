import { NextRequest, NextResponse } from "next/server";
import { keccak256, toHex } from "viem";

/**
 * @route POST /api/compute/evolve
 * @description Simulates TEE evolution computation
 * 
 * In production, this would:
 * 1. Connect to 0G Compute TEE enclave
 * 2. Download parent genome from 0G Storage
 * 3. Decrypt genome inside TEE
 * 4. Generate 50 mutation candidates
 * 5. Run simulations on historical data
 * 6. Return best candidate genome hash
 * 
 * For testnet, we generate deterministic hashes based on request data
 * to ensure reproducibility and on-chain verification compatibility.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { requestId, parentId, parentGenomeHash, performanceHistoryHash } = body;

    if (!requestId || !parentId || !parentGenomeHash || !performanceHistoryHash) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Simulate TEE computation delay (2-4 seconds)
    await delay(2000 + Math.random() * 2000);

    // Generate DETERMINISTIC child genome hash based on inputs only (no timestamp)
    // This ensures the hash can be verified against on-chain records
    const childGenomeHash = keccak256(
      toHex(`evolution-${requestId}-${parentGenomeHash}-child-v1`)
    );

    // Generate deterministic storage root hash
    const storageRootHash = keccak256(
      toHex(`evolution-${requestId}-${childGenomeHash}-storage-v1`)
    );

    // Generate deterministic TEE attestation hash
    const teeAttestationHash = keccak256(
      toHex(`evolution-${requestId}-tee-attestation-v1`)
    );

    // Calculate fitness improvement (deterministic based on requestId)
    // Use requestId to seed a pseudo-random but deterministic value
    const seed = Number((BigInt(requestId) % 10n) + 5n);
    const fitnessImprovement = seed;

    return NextResponse.json({
      success: true,
      requestId,
      childGenomeHash,
      storageRootHash,
      teeAttestationHash,
      fitnessImprovement,
      mutationStrategy: "prompt_paraphrase",
      candidatesGenerated: 50,
      simulationsRun: 1000,
    });
  } catch (error) {
    console.error("Evolution computation failed:", error);
    return NextResponse.json(
      { error: "Evolution computation failed" },
      { status: 500 }
    );
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
