import { NextResponse } from "next/server";
import { OracleKeeperService } from "@/lib/oraclekeeper";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const oracle = new OracleKeeperService();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pair = searchParams.get("pair") || "ETH/USDC";

    const sources = await oracle.getSourceStatusesWithPrices(pair);

    return NextResponse.json({ success: true, sources });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch sources" },
      { status: 500 }
    );
  }
}
