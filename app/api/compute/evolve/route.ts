import { NextRequest, NextResponse } from "next/server";
import { createWalletClient, http, parseEventLogs, publicActions, type Hash } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { zeroGGalileo, zeroGMainnet, storageIndexers } from "@/lib/0g";
import { replicantEvolutionCoordinatorAbi } from "@/lib/contracts/evolution-coordinator";
import { GenomeManager } from "@/lib/evolution/genome-manager";
import { TEEExecutor } from "@/lib/evolution/tee-executor";
import { AlignmentVerifier } from "@/lib/evolution/alignment-verifier";

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const STORAGE_PRIVATE_KEY = process.env.ZERO_G_STORAGE_PRIVATE_KEY || process.env.PRIVATE_KEY;
const NETWORK = process.env.NEXT_PUBLIC_0G_NETWORK === "mainnet" ? "mainnet" : "galileo";
const CHAIN = NETWORK === "mainnet" ? zeroGMainnet : zeroGGalileo;
const RPC_URL = NETWORK === "mainnet"
  ? (process.env.ZERO_G_MAINNET_RPC_URL ?? "https://evmrpc.0g.ai")
  : (process.env.ZERO_G_GALILEO_RPC_URL ?? "https://evmrpc-testnet.0g.ai");
const STORAGE_INDEXER = storageIndexers[NETWORK];

const COORDINATOR_ADDRESS = process.env.NEXT_PUBLIC_EVOLUTION_COORDINATOR_CONTRACT as Hash | undefined;

export async function POST(req: NextRequest) {
  try {
    if (!PRIVATE_KEY) {
      return NextResponse.json({ error: "PRIVATE_KEY not configured on server" }, { status: 500 });
    }
    if (!STORAGE_PRIVATE_KEY) {
      return NextResponse.json({ error: "ZERO_G_STORAGE_PRIVATE_KEY not configured" }, { status: 500 });
    }
    if (!COORDINATOR_ADDRESS) {
      return NextResponse.json({ error: "Evolution Coordinator contract not configured" }, { status: 500 });
    }

    const body = await req.json();
    const { requestId, parentId, parentGenomeHash, performanceHistoryHash, species, generation } = body;

    if (!requestId || !parentId || !parentGenomeHash || !performanceHistoryHash) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Initialize services
    const genomeManager = new GenomeManager({
      rpcUrl: RPC_URL,
      indexerUrl: STORAGE_INDEXER,
      privateKey: STORAGE_PRIVATE_KEY,
    });
    const teeExecutor = new TEEExecutor();
    const alignmentVerifier = new AlignmentVerifier();

    // Step 1: Download or create parent genome
    let parentGenome;
    try {
      parentGenome = await genomeManager.downloadGenome(parentGenomeHash as Hash);
    } catch (error) {
      console.log("Parent genome not found in storage, creating genesis genome");
      parentGenome = genomeManager.createGenesisGenome(parentId, species || "alpha-hunter");
    }

    // Step 2: Create mock performance history (in production, this would be real data)
    const performanceHistory = {
      agentId: parentId,
      period: { start: Date.now() - 30 * 24 * 60 * 60 * 1000, end: Date.now() },
      metrics: {
        totalRequests: 1000,
        successfulRequests: 850,
        failedRequests: 150,
        avgLatency: 1200,
        p95Latency: 2500,
        p99Latency: 4000,
      },
      taskBreakdown: [
        { taskType: "analysis", count: 600, successRate: 0.9 },
        { taskType: "generation", count: 300, successRate: 0.8 },
        { taskType: "verification", count: 100, successRate: 0.85 },
      ],
      errorPatterns: [
        { errorType: "timeout", frequency: 80, lastOccurrence: Date.now() - 3600000 },
        { errorType: "validation", frequency: 50, lastOccurrence: Date.now() - 7200000 },
        { errorType: "rate-limit", frequency: 20, lastOccurrence: Date.now() - 10800000 },
      ],
    };

    // Step 3: Execute TEE evolution
    const teeResult = await teeExecutor.executeEvolution(
      requestId,
      parentGenome,
      performanceHistory
    );

    // Step 4: Generate child genome
    const childGenome = genomeManager.generateChildGenome(
      parentGenome,
      {
        promptMutations: teeResult.bestCandidate.promptMutations,
        parameterAdjustments: teeResult.bestCandidate.parameterAdjustments,
        capabilityAdditions: teeResult.bestCandidate.capabilityAdditions,
        constraintModifications: teeResult.bestCandidate.constraintModifications,
      },
      teeResult.fitnessImprovement
    );

    // Step 5: Upload child genome to 0G Storage
    let storageRootHash: Hash;
    try {
      const uploadResult = await genomeManager.uploadGenome(childGenome);
      storageRootHash = uploadResult.rootHash;
      console.log("Child genome uploaded to 0G Storage:", storageRootHash);
    } catch (error) {
      console.error("Failed to upload to 0G Storage, using hash:", error);
      storageRootHash = teeResult.storageRootHash;
    }

    // Step 6: Verify alignment
    const alignmentResult = await alignmentVerifier.verifyAlignment(
      parentGenome,
      childGenome,
      teeResult.bestCandidate
    );

    if (!alignmentResult.passed) {
      return NextResponse.json({
        success: false,
        error: "Alignment verification failed",
        alignmentScore: alignmentResult.score,
        violations: alignmentResult.violations,
        recommendations: alignmentResult.recommendations,
      }, { status: 400 });
    }

    // Step 7: Complete evolution on-chain with empty proofs array
    // The contract will use the else branch (_mintWithGenome) when proofs.length == 0
    const account = privateKeyToAccount(`0x${PRIVATE_KEY.replace("0x", "")}`);
    const walletClient = createWalletClient({
      account,
      chain: CHAIN,
      transport: http(RPC_URL),
    }).extend(publicActions);

    const completeHash = await walletClient.writeContract({
      address: COORDINATOR_ADDRESS,
      abi: replicantEvolutionCoordinatorAbi,
      functionName: "completeEvolution",
      args: [
        BigInt(requestId),
        teeResult.childGenomeHash,
        storageRootHash,
        teeResult.teeAttestationHash,
        alignmentResult.alignmentVerdictHash,
        BigInt(teeResult.fitnessImprovement),
        [], // Empty array - contract will mint new token instead of cloning
      ],
    });

    const receipt = await walletClient.waitForTransactionReceipt({ hash: completeHash });

    if (receipt.status === "reverted") {
      return NextResponse.json(
        { error: "completeEvolution transaction reverted on-chain" },
        { status: 500 }
      );
    }

    const logs = parseEventLogs({
      abi: replicantEvolutionCoordinatorAbi,
      eventName: "EvolutionCompleted",
      logs: receipt.logs,
    });

    const childId = logs[0]?.args?.childId;

    return NextResponse.json({
      success: true,
      requestId,
      childId: childId?.toString() ?? null,
      childGenomeHash: teeResult.childGenomeHash,
      storageRootHash,
      teeAttestationHash: teeResult.teeAttestationHash,
      alignmentVerdictHash: alignmentResult.alignmentVerdictHash,
      fitnessImprovement: teeResult.fitnessImprovement,
      completeTxHash: completeHash,
      mutationStrategy: teeResult.mutationStrategy,
      candidatesGenerated: teeResult.candidatesGenerated,
      simulationsRun: teeResult.simulationsRun,
      alignmentScore: alignmentResult.score,
      alignmentPassed: alignmentResult.passed,
    });
  } catch (error) {
    console.error("Evolution computation failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Evolution computation failed" },
      { status: 500 }
    );
  }
}
