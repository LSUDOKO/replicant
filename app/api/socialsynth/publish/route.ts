import { NextResponse } from "next/server";
import { SocialSynthGenerator } from "@/lib/socialsynth";
import { FarcasterPublisher } from "@/lib/socialsynth/platforms/farcaster";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const synth = new SocialSynthGenerator();
const farcaster = new FarcasterPublisher();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, contentId, platform } = body;

    if (!contentId) {
      return NextResponse.json({ error: "contentId is required" }, { status: 400 });
    }

    const content = synth.getContent(contentId);
    if (!content) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 });
    }

    if (action === "publish") {
      const publishPlatform = platform || content.platform;

      if (publishPlatform === "farcaster" && farcaster.isReady) {
        const text = Array.isArray(content.content) ? content.content[0] : content.content;
        try {
          const hash = await farcaster.publishCast(text);
          synth.markPublished(contentId);
          const updated = synth.getContent(contentId);
          return NextResponse.json({ success: true, content: updated, farcasterHash: hash, message: "Published to Farcaster Hub" });
        } catch (err) {
          return NextResponse.json({
            success: false,
            error: `Farcaster publish failed: ${err instanceof Error ? err.message : "Unknown error"}`,
            hint: "Set FARCASTER_HUB_URL, FARCASTER_FID, FARCASTER_SIGNER_PRIVATE_KEY in .env",
          }, { status: 500 });
        }
      }

      synth.markPublished(contentId);
      const updated = synth.getContent(contentId);
      return NextResponse.json({ success: true, content: updated, message: "Published (platform API not configured — copied to clipboard)" });
    }

    if (action === "track") {
      if (platform === "farcaster" && farcaster.isReady) {
        try {
          const metrics = await farcaster.getCastMetrics(contentId);
          const full = synth.reportPerformance(contentId, metrics);
          return NextResponse.json({ success: true, metrics: full });
        } catch {}
      }
      const metrics = synth.reportPerformance(contentId, {});
      return NextResponse.json({ success: true, metrics });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Operation failed" },
      { status: 500 }
    );
  }
}
