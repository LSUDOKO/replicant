import type { Jurisdiction, StandardTemplate } from "./types";

export const TEMPLATES: Record<Jurisdiction, { templates: StandardTemplate[] }> = {
  "US-Delaware": {
    templates: [
      {
        clauseType: "Indemnification",
        standardText: "Each party shall indemnify and hold harmless the other party from and against any and all claims, damages, losses, and expenses arising out of or resulting from the indemnifying party's breach of this Agreement.",
        acceptableVariations: [
          "Party A shall indemnify Party B from third-party claims arising out of Party A's breach",
          "Mutual indemnification for breaches of representations and warranties",
        ],
        redFlags: [
          { pattern: "unlimited|no limit|capless", severity: "CRITICAL", reason: "Unlimited liability exposure", suggestion: "Add liability cap at 12 months of fees or fixed amount", standardRef: "Delaware Ch. 8 § 102(b)(7)" },
          { pattern: "indemnify.*third.*part(y|ies).*not.*party", severity: "HIGH", reason: "Broad third-party indemnification", suggestion: "Limit to direct damages only", standardRef: "Airgas v. Cravath" },
        ],
      },
      {
        clauseType: "Termination",
        standardText: "This Agreement may be terminated by either party upon 30 days written notice. Upon termination, all outstanding obligations shall be settled within 60 days.",
        acceptableVariations: [
          "Either party may terminate for convenience with 60 days notice",
          "Termination for cause with 10 days cure period",
        ],
        redFlags: [
          { pattern: "terminate.*without cause.*no notice|immediate termination.*without notice", severity: "HIGH", reason: "No termination notice period", suggestion: "Add minimum 30-day notice for convenience termination", standardRef: "Delaware employment law standards" },
          { pattern: "survive.*in perpetuity|indefinite.*survival", severity: "MEDIUM", reason: "Indefinite survival clauses", suggestion: "Limit survival to 3-5 years post-termination", standardRef: "Delaware contract interpretation" },
        ],
      },
      {
        clauseType: "Non-Compete",
        standardText: "During the term and for 6 months thereafter, Employee shall not engage in competing business within 50 miles of Company's primary location.",
        acceptableVariations: [
          "12-month non-compete with garden leave",
          "6-month non-solicitation of customers only",
        ],
        redFlags: [
          { pattern: "24\\s*months|2\\s*years|three\\s*years", severity: "CRITICAL", reason: "Excessive non-compete duration", suggestion: "Reduce to 6-12 months maximum", standardRef: "Delaware courts reject >12 months" },
          { pattern: "worldwide|global|any jurisdiction", severity: "HIGH", reason: "Unreasonable geographic scope", suggestion: "Limit to actual business territory", standardRef: "Delaware reasonableness test" },
        ],
      },
      {
        clauseType: "Limitation of Liability",
        standardText: "Neither party's liability shall exceed the total amount paid under this Agreement in the 12 months preceding the claim, except for death, personal injury, fraud, or breach of confidentiality.",
        acceptableVariations: [
          "Liability capped at $1,000,000",
          "Unlimited liability for gross negligence only",
        ],
        redFlags: [
          { pattern: "exclude.*consequential|exclude.*indirect|waive.*consequential", severity: "MEDIUM", reason: "Exclusion of consequential loss may be unenforceable", suggestion: "Use liability 'cap' instead of blanket 'exclusion'", standardRef: "UCC § 2-719" },
          { pattern: "no liability.*whatsoever|not liable.*under.*circumstances", severity: "CRITICAL", reason: "Complete liability waiver may be void", suggestion: "Add exceptions for fraud, death, personal injury, IP infringement", standardRef: "Delaware public policy" },
        ],
      },
      {
        clauseType: "Confidentiality",
        standardText: "The Receiving Party shall hold Confidential Information in confidence and shall not disclose it to third parties without the Disclosing Party's prior written consent.",
        acceptableVariations: [
          "Standard NDA with 3-year term",
          "Perpetual protection for trade secrets",
        ],
        redFlags: [
          { pattern: "no.*exclusion|no.*exception|all.*information", severity: "MEDIUM", reason: "No exclusions from confidential information definition", suggestion: "Add standard exclusions: publicly known, independently developed, rightfully received from third party", standardRef: "Delaware trade secret law" },
        ],
      },
    ],
  },
  "US-California": {
    templates: [
      {
        clauseType: "Indemnification",
        standardText: "Each party shall indemnify the other against third-party claims arising from the indemnifying party's breach of this Agreement.",
        acceptableVariations: [
          "Mutual indemnification with defense obligations",
        ],
        redFlags: [
          { pattern: "indemnify.*gross negligence|indemnify.*willful misconduct", severity: "HIGH", reason: "California limits indemnification for own negligence", suggestion: "Cap at proportional fault", standardRef: "California Civil Code § 2782" },
        ],
      },
    ],
  },
  "UK-England": {
    templates: [
      {
        clauseType: "Limitation of Liability",
        standardText: "Neither party's liability shall exceed the total amount paid under this Agreement in the 12 months preceding the claim, except for death, personal injury, fraud, or breach of confidentiality.",
        acceptableVariations: [
          "Liability capped at £1,000,000",
          "Unlimited liability for gross negligence only",
        ],
        redFlags: [
          { pattern: "exclude.*consequential|exclude.*indirect", severity: "MEDIUM", reason: "Exclusion of consequential loss may be unenforceable under UCTA", suggestion: "Use 'cap' instead of 'exclude' for liability", standardRef: "UK Unfair Contract Terms Act 1977" },
        ],
      },
      {
        clauseType: "Termination",
        standardText: "This Agreement may be terminated by either party upon 30 days written notice.",
        acceptableVariations: [
          "60 days notice for convenience",
        ],
        redFlags: [
          { pattern: "terminate.*without cause.*immediately|summary termination", severity: "MEDIUM", reason: "Summary termination may breach implied terms", suggestion: "Add reasonable notice period", standardRef: "UK Employment Rights Act 1996" },
        ],
      },
    ],
  },
  "EU-Germany": {
    templates: [
      {
        clauseType: "Confidentiality",
        standardText: "The Receiving Party shall protect Confidential Information with the same degree of care as its own confidential information.",
        acceptableVariations: [
          "Standard German GTC confidentiality clause",
        ],
        redFlags: [
          { pattern: "indefinite.*confidentiality|perpetual.*confidential", severity: "MEDIUM", reason: "German law limits indefinite confidentiality obligations", suggestion: "Limit confidentiality term to 3-5 years", standardRef: "BGB § 307" },
        ],
      },
    ],
  },
  "Singapore": {
    templates: [
      {
        clauseType: "Indemnification",
        standardText: "Each party shall indemnify the other against third-party claims arising from its breach of this Agreement.",
        acceptableVariations: [],
        redFlags: [
          { pattern: "indemnify.*own.*negligence", severity: "HIGH", reason: "Singapore has specific rules on indemnity for own negligence", suggestion: "Review enforceability under Singapore law", standardRef: "Singapore Unfair Contract Terms Act" },
        ],
      },
    ],
  },
  "UAE-DIFC": {
    templates: [
      {
        clauseType: "Governing Law & Disputes",
        standardText: "This Agreement shall be governed by and construed in accordance with the laws of the Dubai International Financial Centre.",
        acceptableVariations: [
          "DIFC Law with DIFC Courts jurisdiction",
        ],
        redFlags: [
          { pattern: "onshore.*UAE.*law|UAE.*Civil.*Code", severity: "MEDIUM", reason: "Onshore UAE law differs significantly from DIFC law", suggestion: "Consider DIFC law for freezone entities", standardRef: "DIFC Law No. 3 of 2004" },
        ],
      },
    ],
  },
};
