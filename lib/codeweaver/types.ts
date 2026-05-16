export interface VulnerabilityFinding {
  ruleId: string;
  title: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low" | "informational";
  lineStart: number;
  lineEnd: number;
  sourceCode: string;
  recommendation: string;
  category: VulnerabilityCategory;
}

export type VulnerabilityCategory =
  | "access-control"
  | "arithmetic"
  | "reentrancy"
  | "unchecked-calls"
  | "gas-optimization"
  | "best-practices"
  | "logic-error"
  | "timing"
  | "oracle-manipulation"
  | "flash-loan"
  | "front-running"
  | "centralization"
  | "compliance";

export interface ContractInfo {
  name: string;
  pragma: string;
  imports: string[];
  functions: FunctionInfo[];
  modifiers: string[];
  events: string[];
  stateVariables: StateVariableInfo[];
  mappings: MappingInfo[];
  inheritance: string[];
  lines: number;
}

export interface FunctionInfo {
  name: string;
  visibility: "public" | "external" | "internal" | "private";
  mutability: "pure" | "view" | "nonpayable" | "payable";
  modifiers: string[];
  params: { name: string; type: string }[];
  returns: { name: string; type: string }[];
  lineStart: number;
  lineEnd: number;
  body: string;
}

export interface StateVariableInfo {
  name: string;
  type: string;
  visibility: "public" | "internal" | "private";
  constant: boolean;
  line: number;
}

export interface MappingInfo {
  name: string;
  keyType: string;
  valueType: string;
  line: number;
}

export interface AuditReport {
  id: string;
  contractName: string;
  contractSource: string;
  timestamp: number;
  summary: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    informational: number;
  };
  findings: VulnerabilityFinding[];
  contractInfo: ContractInfo;
  teeAttestation: string;
  storageHash?: string;
  llmAnalyzed: boolean;
}

export interface AuditRequest {
  contractSource: string;
  contractName?: string;
}

export interface AuditResult {
  success: boolean;
  report?: AuditReport;
  error?: string;
}
