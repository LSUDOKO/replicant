import { NextResponse } from "next/server";
import { createStorageClient } from "@/lib/0g-storage";
import { publicEnv } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const privateKey = process.env.ZERO_G_STORAGE_PRIVATE_KEY ?? process.env.PRIVATE_KEY;
  if (!privateKey) {
    return NextResponse.json({ error: "Missing storage private key" }, { status: 500 });
  }

  try {
    const { logType, agentId, payload } = await request.json();
    if (!logType || !agentId || !payload) {
      return NextResponse.json({ error: "logType, agentId, and payload are required" }, { status: 400 });
    }

    const client = createStorageClient({
      rpcUrl: publicEnv.rpcUrl,
      indexerUrl: publicEnv.storageIndexer,
      privateKey,
    });

    const logEntry = {
      type: logType,
      agentId,
      timestamp: new Date().toISOString(),
      data: payload,
    };

    const result = await client.uploadJson(logEntry);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 502 }
    );
  }
}