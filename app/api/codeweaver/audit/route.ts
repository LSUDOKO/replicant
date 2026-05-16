import { NextResponse } from "next/server";
import { CodeWeaverService } from "@/lib/codeweaver";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 100 * 1024;
const auditHistory: Map<string, import("@/lib/codeweaver").AuditReport[]> = new Map();

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let body: { contractSource?: string; contractName?: string };

    if (contentType.includes("multipart")) {
      const formData = await request.formData();
      const file = formData.get("contract") as File | null;
      if (!file) {
        return NextResponse.json({ error: "No contract file provided" }, { status: 400 });
      }
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: "File exceeds 100KB limit" }, { status: 400 });
      }
      const contractName = file.name.replace(/\.sol$/i, "");
      body = { contractSource: await file.text(), contractName: contractName || undefined };
    } else {
      body = await request.json().catch(() => ({}));
      if (!body.contractSource || body.contractSource.length === 0) {
        return NextResponse.json({ error: "No contract source provided" }, { status: 400 });
      }
      if (body.contractSource.length > MAX_FILE_SIZE) {
        return NextResponse.json({ error: "Contract source exceeds 100KB limit" }, { status: 400 });
      }
    }

    const service = new CodeWeaverService();
    const result = await service.runAudit({
      contractSource: body.contractSource!,
      contractName: body.contractName,
    });

    if (!result.success || !result.report) {
      return NextResponse.json({ error: result.error || "Audit failed" }, { status: 500 });
    }

    const history = auditHistory.get(result.report.contractName) || [];
    history.unshift(result.report);
    auditHistory.set(result.report.contractName, history.slice(0, 50));

    return NextResponse.json({ success: true, report: result.report });
  } catch (error) {
    console.error("[CodeWeaver] Audit error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Audit failed" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const contractName = searchParams.get("contract") || "";
  const limit = parseInt(searchParams.get("limit") || "10");

  const history = contractName
    ? auditHistory.get(contractName) || []
    : Array.from(auditHistory.values()).flat();

  return NextResponse.json({
    reports: history.slice(0, limit).map((r) => ({
      id: r.id,
      contractName: r.contractName,
      timestamp: r.timestamp,
      summary: r.summary,
      storageHash: r.storageHash,
      llmAnalyzed: r.llmAnalyzed,
    })),
  });
}
