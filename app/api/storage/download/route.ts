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
    const { rootHash } = await request.json();
    if (!rootHash || typeof rootHash !== "string") {
      return NextResponse.json({ error: "rootHash is required" }, { status: 400 });
    }

    const client = createStorageClient({
      rpcUrl: publicEnv.rpcUrl,
      indexerUrl: publicEnv.storageIndexer,
      privateKey,
    });

    const data = await client.downloadJson(rootHash);
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Download failed" },
      { status: 502 }
    );
  }
}