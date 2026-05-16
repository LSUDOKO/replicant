import { keccak256, toHex } from "viem";
import type { AuditReport, ClauseAnalysis, Clause, Jurisdiction, RiskFlag, RiskLevel, StandardComparison } from "./types";
import { classifyClause } from "./classification";
import { ComparisonService } from "./comparison";
import { RiskDetectionService } from "./risk-detection";

function generateId(): string {
  return keccak256(toHex(`${Date.now()}${Math.random()}`)).slice(2, 10);
}

function generateAttestation(data: string): string {
  return `0x${keccak256(toHex(data + Date.now() + Math.random())).slice(2, 66)}`;
}

function calculateClauseRisk(risks: RiskFlag[], standard: StandardComparison): RiskLevel {
  if (risks.length === 0) {
    if (standard.deviationScore < 0.2) return "SAFE";
    return "LOW";
  }

  const sevRank: Record<string, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1, SAFE: 0 };
  const maxSev = Math.max(...risks.map((r) => sevRank[r.severity] || 0));

  if (maxSev >= 4) return "CRITICAL";
  if (maxSev >= 3) return "HIGH";
  if (maxSev >= 2) return "MEDIUM";
  return "LOW";
}

function calculateOverallRisk(
  clauses: ClauseAnalysis[],
  breakdown: Record<string, number>
): RiskLevel {
  if (breakdown["CRITICAL"] > 0) return "CRITICAL";
  if (breakdown["HIGH"] > 2) return "HIGH";
  if (breakdown["HIGH"] > 0 || breakdown["MEDIUM"] > 3) return "MEDIUM";
  if (breakdown["MEDIUM"] > 0 || breakdown["LOW"] > 5) return "LOW";
  return "SAFE";
}

function generateClauseSummary(classification: string, risk: RiskLevel, flagCount: number): string {
  if (risk === "SAFE") return `${classification} clause matches standard template.`;
  if (risk === "LOW") return `${classification} clause has minor deviations. ${flagCount} notes.`;
  return `${classification} clause has ${risk.toLowerCase()} risk level. ${flagCount} flags require review.`;
}

export class ReportService {
  private comparison: ComparisonService;
  private riskDetector: RiskDetectionService;

  constructor() {
    this.comparison = new ComparisonService();
    this.riskDetector = new RiskDetectionService();
  }

  generateReport(
    clauses: Clause[],
    source: string,
    filename: string,
    jurisdiction: Jurisdiction
  ): AuditReport {
    const breakdown: Record<string, number> = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0, SAFE: 0 };

    const analyzedClauses: ClauseAnalysis[] = clauses.map((clause) => {
      const classification = classifyClause(clause);
      const standardComp = this.comparison.compare(clause, classification, jurisdiction);
      const risks = this.riskDetector.detectRisks(clause, classification, jurisdiction);
      const clauseRisk = calculateClauseRisk(risks, standardComp);

      for (const r of risks) {
        breakdown[r.severity] = (breakdown[r.severity] || 0) + 1;
      }

      return {
        id: clause.id,
        header: clause.header,
        text: clause.text.slice(0, 500),
        lineStart: clause.lineStart,
        lineEnd: clause.lineEnd,
        classification,
        riskLevel: clauseRisk,
        standardComparison: standardComp,
        riskFlags: risks,
        summary: generateClauseSummary(classification, clauseRisk, risks.length),
      };
    });

    const overallRisk = calculateOverallRisk(analyzedClauses, breakdown);
    const documentHash = keccak256(toHex(source)).slice(2, 66);
    const teeData = `${documentHash}:${overallRisk}:${clauses.length}`;

    return {
      id: generateId(),
      documentHash: `0x${documentHash}`,
      documentName: filename,
      jurisdiction,
      totalClauses: clauses.length,
      clausesAnalyzed: analyzedClauses,
      overallRisk,
      riskBreakdown: breakdown,
      teeAttestation: generateAttestation(teeData),
      timestamp: Date.now(),
    };
  }
}
