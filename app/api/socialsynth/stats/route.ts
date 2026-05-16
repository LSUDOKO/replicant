import { NextResponse } from "next/server";
import { SocialSynthGenerator } from "@/lib/socialsynth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const synth = new SocialSynthGenerator();

export async function GET() {
  try {
    const stats = synth.getStats();
    return NextResponse.json({ success: true, stats });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get stats" },
      { status: 500 }
    );
  }
}
