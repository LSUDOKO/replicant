import type { Jurisdiction, StandardTemplate, RiskFlag, RiskLevel, Clause } from "./types";
import { TEMPLATES } from "./templates";

export class RiskDetectionService {
  detectRisks(
    clause: Clause,
    clauseType: string,
    jurisdiction: Jurisdiction
  ): RiskFlag[] {
    const risks: RiskFlag[] = [];
    const text = clause.text;

    const templates: StandardTemplate[] = (TEMPLATES as any)[jurisdiction]?.templates || [];
    const template = templates.find(
      (t) => t.clauseType.toLowerCase() === clauseType.toLowerCase()
    );

    if (template) {
      for (const flagRule of template.redFlags) {
        try {
          const regex = new RegExp(flagRule.pattern, "gi");
          let match: RegExpExecArray | null;
          while ((match = regex.exec(text)) !== null) {
            const startPos = match.index;
            const endPos = match.index + match[0].length;
            const linesBefore = text.substring(0, startPos).split("\n").length;
            risks.push({
              clauseType,
              severity: flagRule.severity,
              lineStart: clause.lineStart + linesBefore,
              lineEnd: clause.lineStart + linesBefore + match[0].split("\n").length,
              text: match[0].slice(0, 200),
              reason: flagRule.reason,
              suggestion: flagRule.suggestion,
              standardReference: flagRule.standardRef,
              confidence: 0.85,
            });
          }
        } catch {
          if (text.toLowerCase().includes(flagRule.pattern.toLowerCase())) {
            risks.push({
              clauseType,
              severity: flagRule.severity,
              lineStart: clause.lineStart,
              lineEnd: clause.lineEnd,
              text: text.slice(0, 200),
              reason: flagRule.reason,
              suggestion: flagRule.suggestion,
              standardReference: flagRule.standardRef,
              confidence: 0.7,
            });
          }
        }
      }
    }

    const generalFlags = this.checkGeneralRisks(text, clause, clauseType);
    risks.push(...generalFlags);

    return risks;
  }

  private checkGeneralRisks(
    text: string,
    clause: Clause,
    clauseType: string
  ): RiskFlag[] {
    const risks: RiskFlag[] = [];
    const patterns: {
      pattern: RegExp;
      severity: RiskLevel;
      reason: string;
      suggestion: string;
    }[] = [
      { pattern: /(unlimited|no limit|capless)/gi, severity: "HIGH", reason: "Unlimited liability exposure", suggestion: "Add a liability cap at 12 months of fees or a fixed maximum amount" },
      { pattern: /in\s*perpetuity|perpetual|indefinite\s*term/gi, severity: "HIGH", reason: "Indefinite duration creates ongoing obligations", suggestion: "Limit to a fixed term with renewal options" },
      { pattern: /(worldwide|global|any\s*jurisdiction)/gi, severity: "MEDIUM", reason: "Overly broad geographic scope", suggestion: "Limit scope to relevant operational territories" },
      { pattern: /sole\s*discretion|absolute\s*discretion|unilateral/gi, severity: "MEDIUM", reason: "Unilateral discretion favors one party", suggestion: "Change to mutual agreement or good faith standard" },
      { pattern: /non-refundable|nonrefundable|irrevocable/gi, severity: "LOW", reason: "Non-refundable payments may be challenged", suggestion: "Consider refund rights for non-delivery" },
      { pattern: /no\s*liability|not\s*liable|disclaim\s*all/gi, severity: "HIGH", reason: "Complete disclaimer of liability may be unenforceable", suggestion: "Add exceptions for gross negligence, fraud, and willful misconduct" },
      { pattern: /time\s*is\s*of\s*the\s*essence/gi, severity: "LOW", reason: "Strict time requirement may cause default", suggestion: "Add reasonable cure periods" },
      { pattern: /as\s*is|as-is|with\s*all\s*faults/gi, severity: "MEDIUM", reason: "As-is provision disclaims all warranties", suggestion: "Include minimum warranty of merchantability" },
      { pattern: /extend|extend\s*for\s*another|cancel\s*at\s*any\s*time/gi, severity: "LOW", reason: "Auto-renewal terms may lock parties in", suggestion: "Add notice period for non-renewal" },
    ];

    for (const p of patterns) {
      let match: RegExpExecArray | null;
      while ((match = p.pattern.exec(text)) !== null) {
        const linesBefore = text.substring(0, match.index).split("\n").length;
        risks.push({
          clauseType,
          severity: p.severity,
          lineStart: clause.lineStart + linesBefore,
          lineEnd: clause.lineStart + linesBefore + 1,
          text: match[0],
          reason: p.reason,
          suggestion: p.suggestion,
          standardReference: "General contract law",
          confidence: 0.75,
        });
      }
    }

    return risks;
  }
}
