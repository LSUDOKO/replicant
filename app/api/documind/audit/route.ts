import { NextResponse } from "next/server";
import { DocuMindService } from "@/lib/documind";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const docuMind = new DocuMindService();

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let source: string;
    let filename = "contract.txt";
    let jurisdiction: string = "US-Delaware";

    if (contentType.includes("multipart")) {
      const formData = await request.formData();
      const file = formData.get("document") as File | null;
      if (!file) {
        return NextResponse.json({ error: "No document file provided" }, { status: 400 });
      }
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: "File exceeds 10MB limit" }, { status: 400 });
      }
      filename = file.name;
      jurisdiction = (formData.get("jurisdiction") as string) || "US-Delaware";
      source = await file.text();
    } else {
      const body = await request.json().catch(() => ({}));
      source = body.document || body.text || "";
      filename = body.filename || "contract.txt";
      jurisdiction = body.jurisdiction || "US-Delaware";
      if (!source || source.length === 0) {
        return NextResponse.json({ error: "No document text provided" }, { status: 400 });
      }
      if (source.length > MAX_FILE_SIZE) {
        return NextResponse.json({ error: "Document exceeds 10MB limit" }, { status: 400 });
      }
    }

    const validJurisdictions = ["US-Delaware", "US-California", "UK-England", "EU-Germany", "Singapore", "UAE-DIFC"];
    if (!validJurisdictions.includes(jurisdiction)) {
      return NextResponse.json({ error: `Invalid jurisdiction: ${jurisdiction}` }, { status: 400 });
    }

    const report = await docuMind.runAudit({
      document: source,
      filename,
      fileType: filename.endsWith(".pdf") ? "pdf" : filename.endsWith(".docx") ? "docx" : "txt",
      jurisdiction: jurisdiction as any,
    });

    return NextResponse.json({ success: true, report });
  } catch (error) {
    console.error("[DocuMind] Audit error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Analysis failed" },
      { status: 500 }
    );
  }
}
