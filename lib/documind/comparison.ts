import type { Jurisdiction, StandardTemplate, StandardComparison, Clause } from "./types";
import { TEMPLATES } from "./templates";

export class ComparisonService {
  compare(
    clause: Clause,
    clauseType: string,
    jurisdiction: Jurisdiction
  ): StandardComparison {
    const templates: StandardTemplate[] = (TEMPLATES as any)[jurisdiction]?.templates || [];
    const standard = templates.find(
      (t) => t.clauseType.toLowerCase() === clauseType.toLowerCase()
    );

    if (!standard) {
      return {
        hasStandard: false,
        similarity: 0.5,
        deviationScore: 0.5,
        inAcceptableVariation: false,
        redFlagsFound: [],
        notes: "No standard template available for this jurisdiction",
      };
    }

    const similarity = this.calculateSimilarity(clause.text, standard.standardText);
    const inVariation = standard.acceptableVariations.some(
      (v) => this.calculateSimilarity(clause.text, v) > 0.7
    );
    const flagsFound = this.checkRedFlags(clause.text, standard);

    const deviation = inVariation
      ? Math.max(0, 1 - similarity - 0.2)
      : 1 - similarity;

    return {
      hasStandard: true,
      standardText: standard.standardText.slice(0, 300) + "...",
      similarity,
      deviationScore: deviation,
      inAcceptableVariation: inVariation,
      redFlagsFound: flagsFound,
      notes: this.generateNotes(deviation, flagsFound.length, inVariation),
    };
  }

  private calculateSimilarity(text1: string, text2: string): number {
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));

    if (words1.size === 0 || words2.size === 0) return 0;

    const intersection = new Set([...words1].filter((w) => words2.has(w)));
    const union = new Set([...words1, ...words2]);

    if (union.size === 0) return 0;
    return intersection.size / union.size;
  }

  private checkRedFlags(
    text: string,
    template: StandardTemplate
  ): string[] {
    const found: string[] = [];
    for (const flag of template.redFlags) {
      try {
        const regex = new RegExp(flag.pattern, "gi");
        if (regex.test(text)) {
          found.push(flag.suggestion);
        }
      } catch {
        if (text.toLowerCase().includes(flag.pattern.toLowerCase())) {
          found.push(flag.suggestion);
        }
      }
    }
    return found;
  }

  private generateNotes(
    deviation: number,
    flagCount: number,
    inVariation: boolean
  ): string {
    if (deviation < 0.2) return "Clause closely matches standard template.";
    if (inVariation) return "Clause uses acceptable variation of standard language.";
    if (deviation < 0.5)
      return `Minor deviation from standard. ${flagCount} potential issues detected.`;
    return `Significant deviation from standard. ${flagCount} issues found. Review recommended.`;
  }
}
