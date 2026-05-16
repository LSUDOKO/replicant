import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const auditHistory: Map<string, unknown[]> = new Map();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { agentId, limit } = body;

    const key = agentId ? `agent-${agentId}` : "all";
    const history = auditHistory.get(key) || [];
    const results = history.slice(0, limit || 10);

    return NextResponse.json({ success: true, reports: results });
  } catch (error) {
    return NextResponse.json({ error: "Failed to get history" }, { status: 500 });
  }
}
