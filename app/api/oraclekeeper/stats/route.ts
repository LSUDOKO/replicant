import { NextResponse } from "next/server";
import { OracleKeeperService } from "@/lib/oraclekeeper";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const oracle = new OracleKeeperService();

export async function GET() {
  try {
    const stats = oracle.getStats();
    return NextResponse.json({ success: true, stats });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get stats" },
      { status: 500 }
    );
  }
}
