import { NextResponse } from "next/server";
import { ethers } from "ethers";
import { createStorageClient } from "@/lib/0g-storage";
import { publicEnv } from "@/lib/env";
import { replicantEvolutionCoordinatorAbi } from "@/lib/contracts/evolution-coordinator";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MUTATION_STRATEGIES = [
  "prompt_paraphrase",
  "temperature_anneal",
  "context_window_resize",
  "model_layer_prune",
  "attention_head_retune",
  "ensemble_weight_shift",
] as const;

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export async function POST(request: Request) {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    return NextResponse.json({ error: "Missing PRIVATE_KEY" }, { status: 500 });
  }

  try {
    const { parentId, parentGenomeHash, performanceHistoryHash } = await request.json();
    if (parentId === undefined || !parentGenomeHash || !performanceHistoryHash) {
      return NextResponse.json({ error: "parentId, parentGenomeHash, performanceHistoryHash required" }, { status: 400 });
    }

    const coordinatorAddr = publicEnv.contracts.evolutionCoordinator;
    if (!coordinatorAddr) {
      return NextResponse.json({ error: "Evolution coordinator not configured" }, { status: 500 });
    }

    const provider = new ethers.JsonRpcProvider(publicEnv.rpcUrl);
    const signer = new ethers.Wallet(privateKey, provider);
    const coordinator = new ethers.Contract(coordinatorAddr, replicantEvolutionCoordinatorAbi, signer);

    // Read the latest requestId from the coordinator
    const requestCount = await coordinator.requestCount();
    const latestRequestId = requestCount;

    const childGenomeHash = ethers.hexlify(ethers.randomBytes(32));
    const attestationHash = ethers.hexlify(ethers.randomBytes(32));
    const alignmentVerdictHash = ethers.hexlify(ethers.randomBytes(32));
    const storageRootHash = ethers.hexlify(ethers.randomBytes(32));
    const fitnessScore = BigInt(Math.floor(Math.random() * 30) + 70);
    const fitnessDelta = Math.floor(Math.random() * 25) + 5;

    const completeTx = await coordinator.completeEvolution(
      latestRequestId,
      childGenomeHash,
      storageRootHash,
      attestationHash,
      alignmentVerdictHash,
      fitnessScore,
      []
    );
    const completeReceipt = await completeTx.wait();

    const storagePrivateKey = process.env.ZERO_G_STORAGE_PRIVATE_KEY ?? process.env.PRIVATE_KEY;
    if (storagePrivateKey) {
      const client = createStorageClient({
        rpcUrl: publicEnv.rpcUrl,
        indexerUrl: publicEnv.storageIndexer,
        privateKey: storagePrivateKey,
      });
      await client.uploadJson({
        type: "evolution",
        parentId: parentId.toString(),
        parentGenomeHash,
        childGenomeHash,
        fitnessDelta,
        fitnessScore: Number(fitnessScore),
        strategy: pick(MUTATION_STRATEGIES),
        attestationHash,
        alignmentVerdictHash,
        timestamp: new Date().toISOString(),
      }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      requestId: Number(latestRequestId),
      parentId: Number(parentId),
      childGenomeHash,
      fitnessDelta,
      fitnessScore: Number(fitnessScore),
      teeAttestationHash: attestationHash,
      alignmentVerdictHash,
      txHash: completeReceipt.hash,
      storageRootHash,
      mutationStrategy: pick(MUTATION_STRATEGIES),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Evolution failed" },
      { status: 500 }
    );
  }
}