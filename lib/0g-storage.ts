import { Indexer, ZgFile } from "@0gfoundation/0g-storage-ts-sdk";
import { ethers } from "ethers";
import { randomUUID } from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { unlink, writeFile, readFile } from "node:fs/promises";

export interface UploadResult {
  rootHash: string;
  txHash: string;
  indexer: string;
}

export interface StorageClientConfig {
  rpcUrl: string;
  indexerUrl: string;
  privateKey: string;
}

export function createStorageClient(config: StorageClientConfig) {
  const provider = new ethers.JsonRpcProvider(config.rpcUrl);
  const signer = new ethers.Wallet(config.privateKey, provider);
  const indexer = new Indexer(config.indexerUrl);

  async function uploadJson(data: unknown): Promise<UploadResult> {
    const tempPath = join(tmpdir(), `replicant-${randomUUID()}.json`);
    try {
      await writeFile(tempPath, JSON.stringify(data, null, 2), "utf8");
      const file = await ZgFile.fromFilePath(tempPath);
      try {
        const [tree, treeError] = await file.merkleTree();
        if (treeError !== null || !tree) {
          throw new Error(treeError?.message ?? "Failed to build merkle tree");
        }
        const rootHash = tree.rootHash();
        const [tx, uploadError] = await indexer.upload(file, config.rpcUrl, signer);
        if (uploadError !== null) {
          throw new Error(uploadError.message);
        }
        return {
          rootHash: rootHash ?? "0x",
          txHash: typeof tx === "string" ? tx : "uploaded",
          indexer: config.indexerUrl,
        };
      } finally {
        await file.close();
      }
    } finally {
      await unlink(tempPath).catch(() => {});
    }
  }

  async function downloadJson(rootHash: string): Promise<unknown> {
    const tempPath = join(tmpdir(), `replicant-dl-${randomUUID()}.json`);
    try {
      await indexer.download(rootHash, tempPath, true);
      const raw = await readFile(tempPath, "utf8");
      return JSON.parse(raw);
    } finally {
      await unlink(tempPath).catch(() => {});
    }
  }

  return { uploadJson, downloadJson };
}