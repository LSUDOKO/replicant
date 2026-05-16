import { NextResponse } from "next/server";
import { ethers } from "ethers";
import { publicEnv } from "@/lib/env";
import { replicantAgentNftAbi } from "@/lib/contracts/erc7857-agent-id";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SPECIES_NAMES = ["AlphaHunter", "CodeWeaver", "GameMaster", "DocuMind", "OracleKeeper", "SocialSynth"];
const SPECIES_IDS = ["alpha-hunter", "code-weaver", "game-master", "docu-mind", "oracle-keeper", "social-synth"];
const STATUS_NAMES = ["Active", "Archived", "Slashed", "Evolving"];
const SPECIES_COLORS: Record<string, string> = {
  AlphaHunter: "#00D4FF",
  CodeWeaver: "#8B5CF6",
  GameMaster: "#D946EF",
  DocuMind: "#F59E0B",
  OracleKeeper: "#10B981",
  SocialSynth: "#F97316",
};

const SPECIES_IMAGE_PATHS: Record<string, string> = {
  "alpha-hunter": "/species/alpha-hunter.jpg",
  "code-weaver": "/species/code-weaver.png",
  "game-master": "/species/game-master.webp",
  "docu-mind": "/species/docu-mind.webp",
  "oracle-keeper": "/species/oracle-keeper.png",
  "social-synth": "/species/social-synth.webp",
};

function buildSvg(species: string, tokenId: string, generation: number, fitness: number, status: string): string {
  const color = SPECIES_COLORS[species] ?? "#8B5CF6";
  const statusColor = status === "Active" ? "#00FF88" : status === "Slashed" ? "#FF3366" : "#FFB800";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0A0A0F"/>
      <stop offset="100%" style="stop-color:#12121A"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:${color};stop-opacity:0.8"/>
      <stop offset="100%" style="stop-color:${color};stop-opacity:0.2"/>
    </linearGradient>
  </defs>
  <rect width="400" height="400" fill="url(#bg)" rx="20"/>
  <rect x="0" y="0" width="400" height="4" fill="url(#accent)" rx="2"/>
  <rect x="20" y="24" width="360" height="1" fill="${color}" opacity="0.15"/>
  <text x="20" y="18" font-family="monospace" font-size="9" fill="${color}" opacity="0.6" letter-spacing="3">REPLICANT PROTOCOL</text>
  <circle cx="200" cy="140" r="55" fill="${color}" opacity="0.08"/>
  <circle cx="200" cy="140" r="45" fill="none" stroke="${color}" stroke-width="1.5" opacity="0.4"/>
  <text x="200" y="132" font-family="monospace" font-size="11" fill="${color}" text-anchor="middle" opacity="0.7">SPECIES</text>
  <text x="200" y="152" font-family="monospace" font-size="16" fill="${color}" text-anchor="middle" font-weight="bold">${species.toUpperCase()}</text>
  <text x="200" y="215" font-family="monospace" font-size="28" fill="white" text-anchor="middle" font-weight="bold">#${tokenId}</text>
  <text x="200" y="240" font-family="monospace" font-size="11" fill="rgba(255,255,255,0.4)" text-anchor="middle">GEN-${generation}</text>
  <rect x="20" y="265" width="360" height="1" fill="${color}" opacity="0.1"/>
  <text x="40" y="295" font-family="monospace" font-size="10" fill="rgba(255,255,255,0.4)">FITNESS</text>
  <text x="40" y="315" font-family="monospace" font-size="22" fill="white" font-weight="bold">${fitness}%</text>
  <text x="200" y="295" font-family="monospace" font-size="10" fill="rgba(255,255,255,0.4)" text-anchor="middle">STATUS</text>
  <text x="200" y="315" font-family="monospace" font-size="14" fill="${statusColor}" text-anchor="middle" font-weight="bold">${status.toUpperCase()}</text>
  <text x="360" y="295" font-family="monospace" font-size="10" fill="rgba(255,255,255,0.4)" text-anchor="end">NETWORK</text>
  <text x="360" y="315" font-family="monospace" font-size="11" fill="${color}" text-anchor="end">0G GALILEO</text>
  <rect x="20" y="340" width="360" height="1" fill="${color}" opacity="0.1"/>
  <text x="200" y="370" font-family="monospace" font-size="9" fill="rgba(255,255,255,0.2)" text-anchor="middle">AUTONOMOUS AI EVOLUTION PROTOCOL</text>
</svg>`;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ tokenId: string }> }
) {
  const { tokenId } = await params;
  const contractAddr = publicEnv.contracts.agentId;
  if (!contractAddr) {
    return NextResponse.json({ error: "Contract not configured" }, { status: 500 });
  }

  try {
    const provider = new ethers.JsonRpcProvider(publicEnv.rpcUrl);
    const contract = new ethers.Contract(contractAddr, replicantAgentNftAbi, provider);

    const [metadata, owner] = await Promise.all([
      contract.getAgentMetadata(BigInt(tokenId)),
      contract.ownerOf(BigInt(tokenId)),
    ]);

    const species = SPECIES_NAMES[Number(metadata.speciesType)] ?? "Unknown";
    const speciesId = SPECIES_IDS[Number(metadata.speciesType)] ?? "alpha-hunter";
    const status = STATUS_NAMES[Number(metadata.status)] ?? "Unknown";
    const generation = Number(metadata.generation);
    const fitness = Number(metadata.fitnessScore);

    // Use actual species image from public folder
    const speciesImagePath = SPECIES_IMAGE_PATHS[speciesId];
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://replicant.0g.ai";
    const imageUrl = `${baseUrl}${speciesImagePath}`;

    const svg = buildSvg(species, tokenId, generation, fitness, status);
    const imageDataUri = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;

    const json = {
      name: `${species} #${tokenId}`,
      description: `REPLICANT autonomous AI agent — ${species} Gen-${generation}. An ERC-7857 iNFT on the 0G network with encrypted genome and TEE-verified inference.`,
      image: imageUrl, // Use actual species image
      image_data: imageDataUri, // Keep SVG as backup
      external_url: `https://chainscan-galileo.0g.ai/token/${contractAddr}?a=${tokenId}`,
      attributes: [
        { trait_type: "Species", value: species },
        { trait_type: "Generation", value: generation },
        { trait_type: "Fitness Score", value: fitness },
        { trait_type: "Status", value: status },
        { trait_type: "Stake (0G)", value: Number(ethers.formatEther(metadata.stake)) },
        { trait_type: "Owner", value: owner },
      ],
    };

    return NextResponse.json(json, {
      headers: {
        "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("[metadata]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch metadata" },
      { status: 500 }
    );
  }
}
