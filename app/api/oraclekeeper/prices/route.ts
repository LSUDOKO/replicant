import { NextResponse } from "next/server";
import { OracleKeeperService } from "@/lib/oraclekeeper";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const oracle = new OracleKeeperService();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pair = searchParams.get("pair") || "ETH/USDC";
    const pairsStr = searchParams.get("pairs");

    if (pairsStr === "all") {
      const results = await oracle.getAllPairsPrices();
      return NextResponse.json({ success: true, prices: results });
    }

    const result = await oracle.getPrice(pair);
    return NextResponse.json({ success: true, price: result });
  } catch (error) {
    console.error("[OracleKeeper] Price fetch error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch prices" },
      { status: 500 }
    );
  }
}
