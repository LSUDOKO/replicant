import { NextResponse } from "next/server";
import { ethers } from "ethers";
import { publicEnv } from "@/lib/env";
import { replicantAgentNftAbi } from "@/lib/contracts/erc7857-agent-id";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ agentId: string }> }
) {
  const { agentId } = await params;
  const agentIdAddr = publicEnv.contracts.agentId;
  if (!agentIdAddr) {
    return NextResponse.json({ error: "Agent ID contract not configured" }, { status: 500 });
  }

  try {
    const provider = new ethers.JsonRpcProvider(publicEnv.rpcUrl);
    const agentNft = new ethers.Contract(agentIdAddr, replicantAgentNftAbi, provider);

    const metadata = await agentNft.getAgentMetadata(BigInt(agentId));
    const owner = await agentNft.ownerOf(BigInt(agentId));
    const creator = await agentNft.creatorOf(BigInt(agentId));
    const lineage = await agentNft.getLineage(BigInt(agentId));
    const children = await agentNft.getChildren(BigInt(agentId));

    return NextResponse.json({
      agentId,
      metadata: {
        speciesType: Number(metadata.speciesType),
        generation: Number(metadata.generation),
        status: ["active", "archived", "slashed", "evolving"][Number(metadata.status)],
        parentId: Number(metadata.parentId),
        fitnessScore: Number(metadata.fitnessScore),
        stake: ethers.formatEther(metadata.stake),
        storageRootHash: metadata.storageRootHash,
        teeAttestationHash: metadata.teeAttestationHash,
        alignmentVerdictHash: metadata.alignmentVerdictHash,
      },
      owner,
      creator,
      lineage: lineage.map((l: bigint) => Number(l)),
      children: children.map((c: bigint) => Number(c)),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch metrics" },
      { status: 500 }
    );
  }
}