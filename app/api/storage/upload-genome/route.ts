import { randomUUID } from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { unlink, writeFile } from "node:fs/promises";
import { Indexer, ZgFile } from "@0gfoundation/0g-storage-ts-sdk";
import { ethers } from "ethers";
import { NextResponse } from "next/server";

import { publicEnv } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface UploadGenomeRequest {
  encryptedPayload: unknown;
}

export async function POST(request: Request) {
  const privateKey = process.env.ZERO_G_STORAGE_PRIVATE_KEY ?? process.env.PRIVATE_KEY;
  if (!privateKey) {
    return NextResponse.json(
      {
        error:
          "Missing ZERO_G_STORAGE_PRIVATE_KEY or PRIVATE_KEY. Set a funded 0G wallet key for storage uploads.",
      },
      { status: 500 }
    );
  }

  let tempPath: string | undefined;

  try {
    const body = (await request.json()) as UploadGenomeRequest;
    if (!body.encryptedPayload || typeof body.encryptedPayload !== "object") {
      return NextResponse.json(
        { error: "encryptedPayload object is required" },
        { status: 400 }
      );
    }

    tempPath = join(tmpdir(), `replicant-genome-${randomUUID()}.json`);
    await writeFile(
      tempPath,
      JSON.stringify(body.encryptedPayload, null, 2),
      "utf8"
    );

    const provider = new ethers.JsonRpcProvider(publicEnv.rpcUrl);
    const signer = new ethers.Wallet(privateKey, provider);
    const indexer = new Indexer(publicEnv.storageIndexer);
    const file = await ZgFile.fromFilePath(tempPath);

    try {
      const [tree, treeError] = await file.merkleTree();
      if (treeError !== null || !tree) {
        return NextResponse.json(
          { error: treeError?.message ?? "Failed to build 0G merkle tree" },
          { status: 502 }
        );
      }

      const rootHash = tree.rootHash();
      const [tx, uploadError] = await indexer.upload(file, publicEnv.rpcUrl, signer);
      if (uploadError !== null) {
        return NextResponse.json(
          { error: uploadError.message },
          { status: 502 }
        );
      }

      return NextResponse.json({
        rootHash,
        txHash: typeof tx === "string" ? tx : JSON.stringify(tx),
        indexer: publicEnv.storageIndexer,
      });
    } finally {
      await file.close();
    }
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unknown 0G Storage upload error",
      },
      { status: 500 }
    );
  } finally {
    if (tempPath) {
      await unlink(tempPath).catch(() => undefined);
    }
  }
}
