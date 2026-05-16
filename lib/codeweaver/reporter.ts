import { keccak256, toHex } from "viem";
import type { AuditReport, VulnerabilityFinding, ContractInfo } from "./types";

export class ReportGenerator {
  generate(
    contractName: string,
    contractSource: string,
    patternFindings: VulnerabilityFinding[],
    llmFindings: VulnerabilityFinding[],
    llmSummary: string,
    contractInfo: ContractInfo
  ): AuditReport {
    const allFindings = [...patternFindings, ...llmFindings];
    const severityCounts = this.countSeverities(allFindings);

    const report: AuditReport = {
      id: keccak256(toHex(`${contractName}${Date.now()}${Math.random()}`)).slice(2, 10),
      contractName,
      contractSource: contractSource.slice(0, 500),
      timestamp: Date.now(),
      summary: {
        total: severityCounts.total,
        critical: severityCounts.critical,
        high: severityCounts.high,
        medium: severityCounts.medium,
        low: severityCounts.low,
        informational: severityCounts.informational,
      },
      findings: this.deduplicateFindings(allFindings),
      contractInfo,
      teeAttestation: this.generateAttestation(allFindings, contractName),
      llmAnalyzed: llmFindings.length > 0,
    };

    return report;
  }

  private countSeverities(findings: VulnerabilityFinding[]) {
    const counts = { total: findings.length, critical: 0, high: 0, medium: 0, low: 0, informational: 0 };
    for (const f of findings) {
      if (f.severity === "critical") counts.critical++;
      else if (f.severity === "high") counts.high++;
      else if (f.severity === "medium") counts.medium++;
      else if (f.severity === "low") counts.low++;
      else if (f.severity === "informational") counts.informational++;
    }
    return counts;
  }

  private deduplicateFindings(findings: VulnerabilityFinding[]): VulnerabilityFinding[] {
    const seen = new Set<string>();
    return findings.filter((f) => {
      const key = `${f.ruleId}:${f.lineStart}:${f.title}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private generateAttestation(findings: VulnerabilityFinding[], contractName: string): string {
    const data = findings.map((f) => `${f.ruleId}:${f.severity}:${f.lineStart}`).join("|");
    return `0x${keccak256(toHex(`${contractName}:${data}:${Date.now()}`)).slice(2, 66)}`;
  }
}
