export type DocumentType = "pdf" | "docx" | "txt";
export type Severity = "critical" | "high" | "medium" | "low" | "safe";
export type RiskLevel = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "SAFE";
export type Jurisdiction = "US-Delaware" | "US-California" | "UK-England" | "EU-Germany" | "Singapore" | "UAE-DIFC";

export interface DocumentContent {
  filename: string;
  fileType: DocumentType;
  rawText: string;
  pages?: number;
  metadata: {
    author?: string;
    created?: Date;
    modified?: Date;
    source?: string;
  };
}

export interface Clause {
  id: string;
  header: string;
  text: string;
  lineStart: number;
  lineEnd: number;
  classification?: string;
  riskLevel?: RiskLevel;
  standardComparison?: StandardComparison;
  riskFlags?: RiskFlag[];
  summary?: string;
}

export interface StandardComparison {
  hasStandard: boolean;
  standardText?: string;
  similarity: number;
  deviationScore: number;
  inAcceptableVariation: boolean;
  redFlagsFound: string[];
  notes: string;
}

export interface RiskFlag {
  clauseType: string;
  severity: RiskLevel;
  lineStart: number;
  lineEnd: number;
  text: string;
  reason: string;
  suggestion: string;
  standardReference: string;
  confidence: number;
}

export interface ClauseAnalysis {
  id: string;
  header: string;
  text: string;
  lineStart: number;
  lineEnd: number;
  classification: string;
  riskLevel: RiskLevel;
  standardComparison: StandardComparison;
  riskFlags: RiskFlag[];
  summary: string;
}

export interface StandardTemplate {
  clauseType: string;
  standardText: string;
  acceptableVariations: string[];
  redFlags: {
    pattern: string;
    severity: RiskLevel;
    reason: string;
    suggestion: string;
    standardRef: string;
  }[];
}

export interface AuditReport {
  id: string;
  documentHash: string;
  documentName: string;
  jurisdiction: Jurisdiction;
  totalClauses: number;
  clausesAnalyzed: ClauseAnalysis[];
  overallRisk: RiskLevel;
  riskBreakdown: Record<string, number>;
  teeAttestation: string;
  timestamp: number;
  storageHash?: string;
}

export interface AuditRequest {
  document: string;
  filename: string;
  fileType: DocumentType;
  jurisdiction: Jurisdiction;
}
