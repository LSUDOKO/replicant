import type { VulnerabilityFinding, VulnerabilityCategory, ContractInfo, FunctionInfo } from "./types";

interface DetectionRule {
  id: string;
  title: string;
  description: string;
  severity: VulnerabilityFinding["severity"];
  category: VulnerabilityCategory;
  detect: (info: ContractInfo, source: string) => VulnerabilityFinding[];
}

function extractLines(source: string, startLine: number, endLine: number): string {
  return source.split("\n").slice(Math.max(0, startLine - 1), endLine).join("\n");
}

const RULES: DetectionRule[] = [
  {
    id: "R01",
    title: "Unprotected External Calls",
    description: "External calls without proper reentrancy protection or checks-effects-interactions pattern.",
    severity: "high",
    category: "reentrancy",
    detect: (info, source) => {
      const findings: VulnerabilityFinding[] = [];
      for (const fn of info.functions) {
        if (fn.visibility === "external" || fn.visibility === "public") {
          const hasCall = /\.call\s*\{[^}]*\}\s*\(/.test(fn.body) || /\.delegatecall\s*\(/.test(fn.body);
          const hasReentrancyGuard = fn.modifiers.some(m => /nonReentrant/i.test(m));
          const hasStateChangeBefore = /(mapping|storage|\.)\w+\s*=\s*/.test(fn.body.split(".call")[0] || "");
          const hasEventBefore = /emit\s+\w+/.test(fn.body.split(".call")[0] || "");

          if (hasCall && !hasReentrancyGuard && hasStateChangeBefore && !hasEventBefore) {
            findings.push({
              ruleId: "R01",
              title: "Unprotected External Calls",
              description: `Function '${fn.name}' makes external calls with state changes before the call. This is susceptible to reentrancy attacks.`,
              severity: "high",
              category: "reentrancy",
              lineStart: fn.lineStart,
              lineEnd: fn.lineEnd,
              sourceCode: fn.body.slice(0, 300),
              recommendation: "Apply checks-effects-interactions pattern: make all state changes and emit events before external calls. Consider adding a reentrancy guard modifier.",
            });
          }
        }
      }
      return findings;
    },
  },
  {
    id: "R02",
    title: "Unchecked External Call Return Values",
    description: "External call return values are not checked, which can silently fail.",
    severity: "medium",
    category: "unchecked-calls",
    detect: (info, source) => {
      const findings: VulnerabilityFinding[] = [];
      for (const fn of info.functions) {
        const lines = fn.body.split("\n");
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          const callMatch = line.match(/\.(call|delegatecall|staticcall|send|transfer)\s*\(/);
          if (callMatch) {
            const prevLine = i > 0 ? lines[i - 1] : "";
            const hasRequire = /require\(/.test(prevLine) || /require\(/.test(line);
            const hasIf = /if\s*\(/.test(prevLine) || /if\s*\(/.test(line);
            const hasAssignment = /^\s*\w+\s*=/.test(prevLine) || /^\s*\w+\s*=/.test(line);
            if (!hasRequire && !hasIf && !hasAssignment) {
              findings.push({
                ruleId: "R02",
                title: "Unchecked External Call Return Values",
                description: `Unchecked return value from '${callMatch[0].replace("(", "")}' in function '${fn.name}'.`,
                severity: "medium",
                category: "unchecked-calls",
                lineStart: fn.lineStart + i,
                lineEnd: fn.lineStart + i,
                sourceCode: line.trim(),
                recommendation: "Check the return value of external calls using require() or handle the failure case explicitly.",
              });
            }
          }
        }
      }
      return findings;
    },
  },
  {
    id: "R03",
    title: "Timestamp Dependency",
    description: "Use of block.timestamp for critical logic can be manipulated by miners.",
    severity: "low",
    category: "timing",
    detect: (info, source) => {
      const findings: VulnerabilityFinding[] = [];
      for (const fn of info.functions) {
        const lines = fn.body.split("\n");
        for (let i = 0; i < lines.length; i++) {
          if (/block\.timestamp|block\.number|now\b/.test(lines[i]) &&
              (lines[i].includes("==") || lines[i].includes("<=") || lines[i].includes(">=") || lines[i].includes("<") || lines[i].includes(">"))) {
            findings.push({
              ruleId: "R03",
              title: "Timestamp Dependency",
              description: `Block timestamp used in comparison in function '${fn.name}'. Miners can manipulate timestamps by ~15 seconds.`,
              severity: "low",
              category: "timing",
              lineStart: fn.lineStart + i,
              lineEnd: fn.lineStart + i,
              sourceCode: lines[i].trim(),
              recommendation: "Avoid using block.timestamp for precise logic. Use it only for approximate time windows (>1 hour). Consider using block numbers for shorter timeframes.",
            });
          }
        }
      }
      if (findings.length === 0) {
        const lines = source.split("\n");
        for (let i = 0; i < lines.length; i++) {
          if (/block\.timestamp|block\.number|now\b/.test(lines[i]) &&
              (lines[i].includes("==") || lines[i].includes("<=") || lines[i].includes(">=") || lines[i].includes("<") || lines[i].includes(">"))) {
            findings.push({
              ruleId: "R03",
              title: "Timestamp Dependency",
              description: "Block timestamp used in comparison. Miners can manipulate timestamps by ~15 seconds.",
              severity: "low",
              category: "timing",
              lineStart: i + 1,
              lineEnd: i + 1,
              sourceCode: lines[i].trim(),
              recommendation: "Avoid using block.timestamp for precise logic. Use it only for approximate time windows (>1 hour).",
            });
          }
        }
      }
      return findings;
    },
  },
  {
    id: "R04",
    title: "Unrestricted Access Control",
    description: "Critical functions without proper access control modifiers.",
    severity: "critical",
    category: "access-control",
    detect: (info, source) => {
      const findings: VulnerabilityFinding[] = [];
      const criticalPatterns = [/withdraw/i, /transferOwnership/i, /mint\b/i, /pause/i, /unpause/i, /destroy/i, /selfdestruct/i, /upgradeTo/i, /changeAdmin/i];
      for (const fn of info.functions) {
        if (fn.visibility === "public" || fn.visibility === "external") {
          const isCritical = criticalPatterns.some(p => p.test(fn.name));
          const hasAccessControl = fn.modifiers.some(m =>
            /onlyOwner|onlyAdmin|onlyRole|auth|permission|whenNotPaused/i.test(m)
          );
          const usesTxOrigin = /tx\.origin/.test(fn.body);
          if (isCritical && !hasAccessControl && !usesTxOrigin) {
            findings.push({
              ruleId: "R04",
              title: "Unrestricted Access Control",
              description: `Critical function '${fn.name}' lacks access control modifiers.`,
              severity: "critical",
              category: "access-control",
              lineStart: fn.lineStart,
              lineEnd: fn.lineEnd,
              sourceCode: fn.body.slice(0, 300),
              recommendation: "Add an access control modifier like onlyOwner or a custom role-based check using OpenZeppelin's AccessControl.",
            });
          }
        }
      }
      return findings;
    },
  },
  {
    id: "R05",
    title: "tx.origin Usage",
    description: "Use of tx.origin for authentication is vulnerable to phishing attacks.",
    severity: "high",
    category: "access-control",
    detect: (info, source) => {
      const findings: VulnerabilityFinding[] = [];
      for (const fn of info.functions) {
        const lines = fn.body.split("\n");
        for (let i = 0; i < lines.length; i++) {
          if (/tx\.origin/.test(lines[i])) {
            findings.push({
              ruleId: "R05",
              title: "tx.origin Usage",
              description: `Function '${fn.name}' uses tx.origin for authorization. This is vulnerable to phishing attacks via malicious contracts.`,
              severity: "high",
              category: "access-control",
              lineStart: fn.lineStart + i,
              lineEnd: fn.lineStart + i,
              sourceCode: lines[i].trim(),
              recommendation: "Use msg.sender instead of tx.origin for authentication. tx.origin should never be used for authorization checks.",
            });
          }
        }
      }
      return findings;
    },
  },
  {
    id: "R06",
    title: "Integer Overflow/Underflow",
    description: "Unchecked arithmetic operations that could overflow or underflow.",
    severity: "medium",
    category: "arithmetic",
    detect: (info, source) => {
      const findings: VulnerabilityFinding[] = [];
      const usesSolidity08 = info.pragma.includes("^0.8") || info.pragma.includes(">=0.8");
      if (usesSolidity08) return findings;

      for (const fn of info.functions) {
        const lines = fn.body.split("\n");
        for (let i = 0; i < lines.length; i++) {
          const hasArithmetic = /(\w+\s*[-+*/]\s*\w+[^=]|(\+|-|\*\/)=)/.test(lines[i]);
          const hasSafeMath = /SafeMath|\.add\(|\.sub\(|\.mul\(|\.div\(/.test(lines[i]) || /unchecked\s*\{/.test(lines[i]);
          if (hasArithmetic && !hasSafeMath && !/require\(/.test(lines[i])) {
            findings.push({
              ruleId: "R06",
              title: "Integer Overflow/Underflow",
              description: `Unchecked arithmetic in function '${fn.name}'. Solidity <0.8 requires SafeMath or explicit overflow checks.`,
              severity: "medium",
              category: "arithmetic",
              lineStart: fn.lineStart + i,
              lineEnd: fn.lineStart + i,
              sourceCode: lines[i].trim(),
              recommendation: "Use Solidity ^0.8.0 which has built-in overflow checks, or use OpenZeppelin's SafeMath library.",
            });
          }
        }
      }
      return findings;
    },
  },
  {
    id: "R07",
    title: "Gas: Loop Over Dynamic Array",
    description: "Loops over dynamic arrays can cause out-of-gas errors.",
    severity: "low",
    category: "gas-optimization",
    detect: (info, source) => {
      const findings: VulnerabilityFinding[] = [];
      for (const fn of info.functions) {
        const lines = fn.body.split("\n");
        for (let i = 0; i < lines.length; i++) {
          const forMatch = lines[i].match(/for\s*\([^)]*\.(length)\s*[!<>=]+\s*\d/);
          if (forMatch) {
            findings.push({
              ruleId: "R07",
              title: "Gas: Loop Over Dynamic Array",
              description: `Loop in function '${fn.name}' iterates over a dynamic array. Array growth can cause out-of-gas.`,
              severity: "low",
              category: "gas-optimization",
              lineStart: fn.lineStart + i,
              lineEnd: fn.lineStart + i,
              sourceCode: lines[i].trim(),
              recommendation: "Consider limiting array sizes, using pagination, or requiring a max iteration parameter.",
            });
          }
        }
      }
      return findings;
    },
  },
  {
    id: "R08",
    title: "Centralization Risk",
    description: "Contract has privileged roles that can unilaterally affect critical state.",
    severity: "medium",
    category: "centralization",
    detect: (info, source) => {
      const findings: VulnerabilityFinding[] = [];
      const centralizationPatterns = [
        /onlyOwner/i, /onlyAdmin/i, /onlyRole\s*\(DEFAULT_ADMIN/i,
      ];
      let hasOwnerModifier = false;
      for (const fn of info.functions) {
        if (fn.modifiers.some(m => centralizationPatterns.some(p => p.test(m)))) {
          hasOwnerModifier = true;
          break;
        }
      }
      if (hasOwnerModifier) {
        findings.push({
          ruleId: "R08",
          title: "Centralization Risk",
          description: "Contract uses owner-only modifiers which gives a single address control over critical functions. This is a centralization risk.",
          severity: "medium",
          category: "centralization",
          lineStart: 1,
          lineEnd: 1,
          sourceCode: extractLines(source, 1, Math.min(5, info.lines)),
          recommendation: "Consider using a multi-sig wallet as the owner, a timelock for admin actions, or a DAO-based governance model.",
        });
      }
      return findings;
    },
  },
  {
    id: "R09",
    title: "Use of Deprecated Keywords",
    description: "Contract uses deprecated Solidity keywords or functions.",
    severity: "informational",
    category: "best-practices",
    detect: (info, source) => {
      const findings: VulnerabilityFinding[] = [];
      const deprecatedPatterns = [
        { pattern: /\bthis\s*\.\s*send\b/, msg: "'this.send()' is deprecated" },
        { pattern: /\bsuicide\b/, msg: "'suicide()' is deprecated, use selfdestruct()" },
        { pattern: /\bblock\.blockhash\b/, msg: "'block.blockhash()' is deprecated, use blockhash()" },
        { pattern: /\bmsg\.gas\b/, msg: "'msg.gas' is deprecated" },
        { pattern: /\bthrow\b/, msg: "'throw' is deprecated, use require/revert" },
        { pattern: /var\s+\w+\s*=/, msg: "'var' is deprecated, use explicit types" },
      ];
      const lines = source.split("\n");
      for (let i = 0; i < lines.length; i++) {
        for (const dp of deprecatedPatterns) {
          if (dp.pattern.test(lines[i])) {
            findings.push({
              ruleId: "R09",
              title: "Use of Deprecated Keywords",
              description: dp.msg,
              severity: "informational",
              category: "best-practices",
              lineStart: i + 1,
              lineEnd: i + 1,
              sourceCode: lines[i].trim(),
              recommendation: `Replace deprecated construct: ${dp.msg}`,
            });
          }
        }
      }
      return findings;
    },
  },
  {
    id: "R10",
    title: "Missing Events on State Changes",
    description: "Important state-changing operations should emit events for off-chain monitoring.",
    severity: "informational",
    category: "best-practices",
    detect: (info, source) => {
      const findings: VulnerabilityFinding[] = [];
      for (const fn of info.functions) {
        if (fn.visibility === "external" || fn.visibility === "public") {
          if (fn.mutability !== "view" && fn.mutability !== "pure") {
            const hasStateChange = /=\s*[^=]/.test(fn.body) || /delete\b/.test(fn.body);
            const hasEvent = /emit\s+\w+/.test(fn.body);
            if (hasStateChange && !hasEvent) {
              findings.push({
                ruleId: "R10",
                title: "Missing Events on State Changes",
                description: `Function '${fn.name}' modifies state but does not emit any events.`,
                severity: "informational",
                category: "best-practices",
                lineStart: fn.lineStart,
                lineEnd: fn.lineEnd,
                sourceCode: fn.body.slice(0, 200),
                recommendation: "Emit events for all state-changing operations to enable off-chain monitoring and indexing.",
              });
              break;
            }
          }
        }
      }
      return findings;
    },
  },
  {
    id: "R11",
    title: "Uninitialized Storage Pointer",
    description: "Storage pointers that may reference unintended storage slots.",
    severity: "high",
    category: "logic-error",
    detect: (info, source) => {
      const findings: VulnerabilityFinding[] = [];
      const lines = source.split("\n");
      const usesSolidityPre082 = info.pragma.includes("^0.7") || info.pragma.includes("^0.6") || info.pragma.includes("^0.5");
      if (usesSolidityPre082) {
        for (let i = 0; i < lines.length; i++) {
          if (/\w+\s*storage\s+\w+/i.test(lines[i]) && !/\s*=\s*\w+/.test(lines[i])) {
            findings.push({
              ruleId: "R11",
              title: "Uninitialized Storage Pointer",
              description: "Possible uninitialized storage pointer. This can overwrite arbitrary storage slots.",
              severity: "high",
              category: "logic-error",
              lineStart: i + 1,
              lineEnd: i + 1,
              sourceCode: lines[i].trim(),
              recommendation: "Always initialize storage pointers explicitly. Consider using memory instead of storage for local variables.",
            });
          }
        }
      }
      return findings;
    },
  },
  {
    id: "R12",
    title: "Floating Pragma",
    description: "Contract uses a floating pragma version, which may lead to inconsistent behavior across compiler versions.",
    severity: "informational",
    category: "best-practices",
    detect: (info, source) => {
      const findings: VulnerabilityFinding[] = [];
      if (/pragma solidity\s+\^/.test(info.pragma)) {
        findings.push({
          ruleId: "R12",
          title: "Floating Pragma",
          description: "Contract uses ^ in pragma directive. This may compile with different compiler versions.",
          severity: "informational",
          category: "best-practices",
          lineStart: 1,
          lineEnd: 1,
          sourceCode: info.pragma,
          recommendation: "Lock the pragma to a specific compiler version to ensure deterministic behavior.",
        });
      }
      return findings;
    },
  },
];

export class VulnerabilityDetector {
  detect(source: string, info: ContractInfo): VulnerabilityFinding[] {
    const findings: VulnerabilityFinding[] = [];
    for (const rule of RULES) {
      try {
        const ruleFindings = rule.detect(info, source);
        findings.push(...ruleFindings);
      } catch (err) {
        console.error(`[CodeWeaver] Rule ${rule.id} failed:`, err);
      }
    }
    return findings;
  }
}
