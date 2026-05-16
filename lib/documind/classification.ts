import type { Clause } from "./types";

const CLAUSE_CLASSIFIERS: { keywords: string[]; type: string }[] = [
  { keywords: ["indemnify", "indemnification", "hold harmless", "indemnitor", "indemnitee"], type: "Indemnification" },
  { keywords: ["terminate", "termination", "cancel", "cancellation", "expire", "expiration", "notice period"], type: "Termination" },
  { keywords: ["non-compete", "non compete", "non-competition", "restrictive covenant", "competitive activity"], type: "Non-Compete" },
  { keywords: ["limitation of liability", "liability cap", "maximum liability", "aggregate liability", "consequential", "indirect damages"], type: "Limitation of Liability" },
  { keywords: ["confidential", "confidentiality", "non-disclosure", "proprietary information", "trade secret"], type: "Confidentiality" },
  { keywords: ["warrant", "warranty", "representation", "represent and warrant", "as-is", "as is"], type: "Warranties & Representations" },
  { keywords: ["intellectual property", "ip ownership", "work made for hire", "assignment of rights", "patent", "copyright", "trademark"], type: "Intellectual Property" },
  { keywords: ["payment", "fee", "compensation", "invoice", "payable", "royalty", "pricing"], type: "Payment & Fees" },
  { keywords: ["governing law", "choice of law", "jurisdiction", "venue", "arbitration", "dispute resolution", "litigation"], type: "Governing Law & Disputes" },
  { keywords: ["force majeure", "act of god", "unforeseeable", "beyond reasonable control"], type: "Force Majeure" },
  { keywords: ["assignment", "delegate", "subcontract", "novation", "transfer rights"], type: "Assignment" },
  { keywords: ["insurance", "coverage", "policy", "insured"], type: "Insurance" },
  { keywords: ["data protection", "privacy", "gdpr", "personal data", "processing"], type: "Data Protection & Privacy" },
  { keywords: ["compliance", "regulatory", "anti-corruption", "sanctions", "anti-bribery", "export control"], type: "Compliance & Regulatory" },
  { keywords: ["entire agreement", "merger clause", "integration", "complete understanding"], type: "Entire Agreement" },
  { keywords: ["amendment", "modification", "variation", "change"], type: "Amendment" },
  { keywords: ["waiver", "no waiver", "failure to enforce"], type: "Waiver" },
  { keywords: ["severability", "illegal", "invalid", "unenforceable", "blue pencil"], type: "Severability" },
  { keywords: ["notice", "written notice", "notify", "notification"], type: "Notice" },
  { keywords: ["audit", "inspect", "examination", "records", "books"], type: "Audit & Records" },
  { keywords: ["non-solicitation", "non solicitation", "no-hire", "no hire"], type: "Non-Solicitation" },
  { keywords: ["exclusivity", "exclusive", "sole provider", "preferred"], type: "Exclusivity" },
  { keywords: ["milestone", "deliverable", "service level", "sla", "performance"], type: "Service Levels & Deliverables" },
  { keywords: ["defend", "defense", "defend indemnify"], type: "Defense & Indemnification" },
  { keywords: ["survival", "survive", "continuing obligations"], type: "Survival" },
];

export function classifyClause(clause: Clause): string {
  const text = `${clause.header} ${clause.text}`.toLowerCase();

  let bestMatch = { type: "General Provision", score: 0 };

  for (const classifier of CLAUSE_CLASSIFIERS) {
    let score = 0;
    for (const keyword of classifier.keywords) {
      const regex = new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
      const matches = text.match(regex);
      if (matches) {
        score += matches.length;
      }
    }
    if (score > bestMatch.score) {
      bestMatch = { type: classifier.type, score };
    }

    const headerLower = clause.header.toLowerCase();
    if (classifier.keywords.some((k) => headerLower.includes(k))) {
      score += 3;
    }
  }

  return bestMatch.type;
}
