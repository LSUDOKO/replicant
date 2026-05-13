import { NextResponse } from "next/server";
import { ethers } from "ethers";
import { createStorageClient } from "@/lib/0g-storage";
import { publicEnv } from "@/lib/env";
import { replicantAgentNftAbi } from "@/lib/contracts/erc7857-agent-id";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    return NextResponse.json({ error: "Missing PRIVATE_KEY" }, { status: 500 });
  }

  const agentIdAddr = publicEnv.contracts.agentId;
  if (!agentIdAddr) {
    return NextResponse.json({ error: "Agent ID contract not configured" }, { status: 500 });
  }

  try {
    const provider = new ethers.JsonRpcProvider(publicEnv.rpcUrl);
    const signer = new ethers.Wallet(privateKey, provider);
    const agentNft = new ethers.Contract(agentIdAddr, replicantAgentNftAbi, signer);

    const storagePrivateKey: string = process.env.ZERO_G_STORAGE_PRIVATE_KEY ?? process.env.PRIVATE_KEY ?? "";
    const client = createStorageClient({
      rpcUrl: publicEnv.rpcUrl,
      indexerUrl: publicEnv.storageIndexer,
      privateKey: storagePrivateKey,
    });

    const species = [
      { name: "AlphaHunter Prime", speciesType: 0 },
      { name: "CodeWeaver Sentinel", speciesType: 1 },
      { name: "GameMaster Nexus", speciesType: 2 },
      { name: "DocuMind Atlas", speciesType: 3 },
      { name: "OracleKeeper Vigil", speciesType: 4 },
      { name: "SocialSynth Muse", speciesType: 5 },
    ];

    const results: { agentId: number; species: string; txHash: string; rootHash: string }[] = [];

    for (const s of species) {
      const genome = {
        species: s.name,
        version: 1,
        prompt: `You are ${s.name}, a specialized AI agent.`,
        model: "deepseek-v3",
        temperature: 0.7,
        maxTokens: 2048,
        createdAt: new Date().toISOString(),
      };

      const uploadResult = await client.uploadJson(genome);
      const genomeHash = ethers.hexlify(ethers.randomBytes(32));

      const tx = await agentNft.mintGenesis(genomeHash, s.speciesType, { value: ethers.parseEther("0.01") });
      const receipt = await tx.wait();

      results.push({
        agentId: results.length + 1,
        species: s.name,
        txHash: typeof tx.hash === "string" ? tx.hash : JSON.stringify(tx.hash),
        rootHash: uploadResult.rootHash,
      });
    }

    return NextResponse.json({ success: true, agents: results });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Seed failed" },
      { status: 500 }
    );
  }
}