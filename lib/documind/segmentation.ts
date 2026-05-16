import type { Clause, DocumentContent } from "./types";

const CLAUSE_HEADER_PATTERNS = [
  /^(?:\d+\.)\s+(.+)/im,
  /^Section\s+\d+[:.]?\s*(.+)/im,
  /^Article\s+\d+[:.]?\s*(.+)/im,
  /^(?:^|\n)(\d+\.\d+)\s+(.+)/im,
  /^(?:^|\n)([A-Z][A-Z\s]+)\s*$/im,
];

const SECTION_KEYWORDS = [
  "definitions", "interpretation", "term", "termination", "payment", "fees",
  "confidentiality", "indemnification", "indemnity", "liability", "limitation",
  "warranty", "representations", "covenants", "assignment", "governing law",
  "dispute resolution", "arbitration", "force majeure", "notice", "entire agreement",
  "amendment", "waiver", "severability", "counterparts", "signatures",
  "non-compete", "non-solicitation", "intellectual property", "ownership",
  "license", "delivery", "acceptance", "inspection", "insurance",
  "compliance", "audit", "records", "confidential information",
  "non-disclosure", "data protection", "privacy", "export control",
  "anti-corruption", "sanctions", "affiliates", "subsidiaries",
  "assignment", "delegation", "subcontracting", "independent contractor",
  "relationship", "publicity", "press release", "further assurances",
  "survival", "cumulative remedies", "waiver of jury trial",
];

export class SegmentationService {
  segmentClauses(doc: DocumentContent): Clause[] {
    const rawText = doc.rawText;
    const sections = rawText.split(/\n\s*\n|\r\n\s*\r\n/);

    const clauses: Clause[] = [];
    let currentClause: Partial<Clause> = {};

    for (const section of sections) {
      const trimmed = section.trim();
      if (!trimmed) continue;

      const headerMatch = this.detectHeader(trimmed);
      if (headerMatch) {
        if (currentClause.text) {
          clauses.push({
            id: `clause-${clauses.length + 1}`,
            header: currentClause.header || "",
            text: currentClause.text,
            lineStart: currentClause.lineStart || 0,
            lineEnd: currentClause.lineEnd || 0,
          });
        }
        currentClause = {
          id: `clause-${clauses.length + 1}`,
          header: headerMatch,
          text: trimmed,
          lineStart: this.estimateLineNumber(rawText, trimmed),
          lineEnd: this.estimateLineNumber(rawText, trimmed) + trimmed.split("\n").length,
        };
      } else if (currentClause.text) {
        currentClause.text += "\n" + trimmed;
        currentClause.lineEnd = this.estimateLineNumber(rawText, trimmed) + trimmed.split("\n").length;
      } else {
        currentClause = {
          id: `clause-${clauses.length + 1}`,
          header: "Preamble",
          text: trimmed,
          lineStart: this.estimateLineNumber(rawText, trimmed),
          lineEnd: this.estimateLineNumber(rawText, trimmed) + trimmed.split("\n").length,
        };
      }
    }

    if (currentClause.text) {
      clauses.push({
        id: `clause-${clauses.length + 1}`,
        header: currentClause.header || "General",
        text: currentClause.text,
        lineStart: currentClause.lineStart || 0,
        lineEnd: currentClause.lineEnd || 0,
      });
    }

    return clauses;
  }

  private detectHeader(text: string): string | null {
    for (const pattern of CLAUSE_HEADER_PATTERNS) {
      const match = text.match(pattern);
      if (match) {
        const header = (match[1] || match[2] || "").trim();
        if (header) return header;
      }
    }

    const firstLine = text.split("\n")[0].trim();
    const lower = firstLine.toLowerCase();
    for (const keyword of SECTION_KEYWORDS) {
      if (lower.includes(keyword) && lower.length < 100) {
        return firstLine;
      }
    }

    return null;
  }

  private estimateLineNumber(fullText: string, snippet: string): number {
    const index = fullText.indexOf(snippet);
    if (index === -1) return 0;
    return fullText.substring(0, index).split("\n").length + 1;
  }
}
