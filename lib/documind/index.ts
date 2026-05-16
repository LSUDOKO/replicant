import { SegmentationService } from "./segmentation";
import { ReportService } from "./reporting";
import { IngestionService } from "./ingestion";
import type { AuditReport, AuditRequest, DocumentContent } from "./types";

export class DocuMindService {
  private segmenter: SegmentationService;
  private reporter: ReportService;
  public ingestion: IngestionService;

  constructor() {
    this.segmenter = new SegmentationService();
    this.reporter = new ReportService();
    this.ingestion = new IngestionService();
  }

  async runAudit(request: AuditRequest): Promise<AuditReport> {
    const doc: DocumentContent = {
      filename: request.filename,
      fileType: request.fileType,
      rawText: request.document,
      metadata: {},
    };

    const clauses = this.segmenter.segmentClauses(doc);

    const report = this.reporter.generateReport(
      clauses,
      request.document,
      request.filename,
      request.jurisdiction
    );

    return report;
  }

  async runAuditFromBuffer(
    buffer: Buffer,
    filename: string,
    jurisdiction: AuditRequest["jurisdiction"]
  ): Promise<AuditReport> {
    const doc = await this.ingestion.parseFile(buffer, filename);

    const clauses = this.segmenter.segmentClauses(doc);

    const report = this.reporter.generateReport(
      clauses,
      doc.rawText,
      doc.filename,
      jurisdiction
    );

    return report;
  }
}

export { SegmentationService, ReportService, IngestionService };
export type { AuditReport, DocumentContent } from "./types";
