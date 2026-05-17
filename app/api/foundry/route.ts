import { NextResponse } from "next/server";
import {
  foundryStatus,
  ingotProvenance,
  runFoundryInference,
  isFoundryConfigured,
} from "@/lib/foundry";
import { SPECIES_SYSTEM_PROMPTS, type SpeciesId } from "@/lib/species/engine";
import type { IngotId } from "@foundryprotocol/sdk";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_SPECIES: SpeciesId[] = [
  "alpha-hunter",
  "code-weaver",
  "game-master",
  "docu-mind",
  "oracle-keeper",
  "social-synth",
];

/**
 * GET /api/foundry
 *   → Foundry deployment + which species are Ingot-backed.
 * GET /api/foundry?tokenId=1
 *   → lineage + revenue snapshot for a backing Ingot.
 */
export async function GET(request: Request) {
  const tokenId = new URL(request.url).searchParams.get("tokenId");
  try {
    if (tokenId !== null) {
      if (!/^\d+$/.test(tokenId)) {
        return NextResponse.json({ error: "tokenId must be a non-negative integer" }, { status: 400 });
      }
      return NextResponse.json(await ingotProvenance(BigInt(tokenId)));
    }
    return NextResponse.json({
      enabled: isFoundryConfigured(),
      ...foundryStatus(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Foundry query failed" },
      { status: 502 },
    );
  }
}

/**
 * POST /api/foundry
 * Body: { species, ingotId?, config?, payload? }
 * Runs verifiable inference through a Foundry Ingot on 0G Compute and
 * returns the engine-shaped output with an on-chain receipt.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const species = body.species as SpeciesId;

    if (!VALID_SPECIES.includes(species)) {
      return NextResponse.json({ error: `Unknown species: ${body.species}` }, { status: 400 });
    }

    const ingotRaw =
      typeof body.ingotId === "string" && body.ingotId.trim()
        ? body.ingotId.trim()
        : process.env[`FOUNDRY_INGOT_${species.replace(/-/g, "_").toUpperCase()}`];

    if (!ingotRaw) {
      return NextResponse.json(
        { error: `No Foundry Ingot for ${species}. Pass body.ingotId or set FOUNDRY_INGOT_<SPECIES>.` },
        { status: 400 },
      );
    }

    const ingotId = (ingotRaw.startsWith("ingot:") ? ingotRaw : `ingot:${ingotRaw}`) as IngotId;

    const output = await runFoundryInference({
      species,
      ingotId,
      systemPrompt: SPECIES_SYSTEM_PROMPTS[species],
      config: body.config ?? {},
      payload: body.payload ?? {},
    });

    return NextResponse.json(output);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Foundry inference failed" },
      { status: 502 },
    );
  }
}
