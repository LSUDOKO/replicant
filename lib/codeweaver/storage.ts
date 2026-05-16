import { publicEnv } from "@/lib/env";
import { createStorageClient } from "@/lib/0g-storage";
import type { AuditReport } from "./types";

const STORAGE_PREFIX = "codeweaver-audit";

export class AuditStorage {
  private client: ReturnType<typeof createStorageClient> | null = null;

  private getClient() {
    if (!this.client) {
      const privateKey = process.env.ZERO_G_STORAGE_PRIVATE_KEY || process.env.PRIVATE_KEY;
      if (!privateKey) {
        throw new Error("No private key configured for 0G Storage");
      }
      this.client = createStorageClient({
        rpcUrl: publicEnv.rpcUrl,
        privateKey,
        indexerUrl: publicEnv.storageIndexer,
      });
    }
    return this.client;
  }

  async uploadReport(report: AuditReport): Promise<string> {
    const client = this.getClient();
    const result = await client.uploadJson({
      type: STORAGE_PREFIX,
      version: "1.0",
      report,
    });
    return result.rootHash;
  }

  async downloadReport(storageHash: string): Promise<AuditReport | null> {
    try {
      const client = this.getClient();
      const data = await client.downloadJson(storageHash);
      return (data as any)?.report || null;
    } catch (error) {
      console.error("[CodeWeaver] Failed to download report:", error);
      return null;
    }
  }
}
