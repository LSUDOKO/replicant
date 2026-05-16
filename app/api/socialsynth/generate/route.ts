import { NextResponse } from "next/server";
import { SocialSynthGenerator } from "@/lib/socialsynth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const synth = new SocialSynthGenerator();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { topic, platform, tone, strategy, format } = body;

    if (!topic || !platform || !tone || !strategy) {
      return NextResponse.json({ error: "topic, platform, tone, and strategy are required" }, { status: 400 });
    }

    const validPlatforms = ["twitter", "farcaster", "lens", "discord"];
    const validTones = ["hype", "educational", "humorous", "controversial", "inspirational", "cautionary", "technical", "neutral"];
    const validStrategies = ["viral", "educational", "engagement", "authority", "community"];

    if (!validPlatforms.includes(platform)) return NextResponse.json({ error: `Invalid platform: ${platform}` }, { status: 400 });
    if (!validTones.includes(tone)) return NextResponse.json({ error: `Invalid tone: ${tone}` }, { status: 400 });
    if (!validStrategies.includes(strategy)) return NextResponse.json({ error: `Invalid strategy: ${strategy}` }, { status: 400 });

    const content = await synth.generate({ topic, platform, tone, strategy, format });

    return NextResponse.json({ success: true, content });
  } catch (error) {
    console.error("[SocialSynth] Generate error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Generation failed" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const contents = synth.getAllContent();
    return NextResponse.json({ success: true, contents });
  } catch (error) {
    return NextResponse.json({ error: "Failed to get contents" }, { status: 500 });
  }
}
