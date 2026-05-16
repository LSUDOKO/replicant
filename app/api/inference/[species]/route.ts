import { NextResponse } from "next/server";
import { runInference } from "@/lib/species/engine";
import type { SpeciesId } from "@/lib/species/engine";

const VALID_SPECIES: SpeciesId[] = ["alpha-hunter", "code-weaver", "game-master", "docu-mind", "oracle-keeper", "social-synth"];

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ species: string }> }
) {
  const { species } = await params;

  if (!VALID_SPECIES.includes(species as SpeciesId)) {
    return NextResponse.json({ error: `Unknown species: ${species}` }, { status: 400 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const output = await runInference({
      species: species as SpeciesId,
      config: body.config ?? {},
      payload: body.payload ?? {},
    });

    return NextResponse.json(output);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Inference failed" },
      { status: 500 }
    );
  }
}
