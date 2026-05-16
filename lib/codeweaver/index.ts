import { SolidityParser } from "./parser";
import { VulnerabilityDetector } from "./detector";
import { LLMAnalyzer } from "./llm";
import { ReportGenerator } from "./reporter";
import { AuditStorage } from "./storage";
import type { AuditReport, AuditRequest, AuditResult } from "./types";

export class CodeWeaverService {
  private parser: SolidityParser;
  private detector: VulnerabilityDetector;
  private llm: LLMAnalyzer;
  private reporter: ReportGenerator;
  private storage: AuditStorage;

  constructor() {
    this.parser = new SolidityParser();
    this.detector = new VulnerabilityDetector();
    this.llm = new LLMAnalyzer();
    this.reporter = new ReportGenerator();
    this.storage = new AuditStorage();
  }

  async runAudit(request: AuditRequest): Promise<AuditResult> {
    try {
      const contractInfo = this.parser.parse(
        request.contractSource,
        request.contractName
      );

      const patternFindings = this.detector.detect(
        request.contractSource,
        contractInfo
      );

      const { llmFindings, summary } = await this.llm.analyze(
        request.contractSource,
        contractInfo,
        patternFindings
      );

      const report = this.reporter.generate(
        contractInfo.name,
        request.contractSource,
        patternFindings,
        llmFindings,
        summary,
        contractInfo
      );

      try {
        const storageHash = await this.storage.uploadReport(report);
        report.storageHash = storageHash;
      } catch (err) {
        console.warn("[CodeWeaver] Storage upload skipped:", err);
      }

      return {
        success: true,
        report,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Audit failed",
      };
    }
  }
}

export {
  SolidityParser,
  VulnerabilityDetector,
  LLMAnalyzer,
  ReportGenerator,
  AuditStorage,
};

export type { AuditReport, AuditRequest, AuditResult, VulnerabilityFinding, ContractInfo } from "./types";
