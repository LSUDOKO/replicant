import axios from "axios";
import type { VulnerabilityFinding, ContractInfo } from "./types";

interface LLMConfig {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export class LLMAnalyzer {
  private apiKey: string;
  private endpoint = "https://openrouter.ai/api/v1/chat/completions";
  private config: Required<LLMConfig>;

  constructor(config?: LLMConfig) {
    this.apiKey = process.env.OPENROUTER_API_KEY || "";
    this.config = {
      model: config?.model || "anthropic/claude-3.5-sonnet",
      temperature: config?.temperature ?? 0.3,
      maxTokens: config?.maxTokens ?? 2000,
    };
  }

  async analyze(
    source: string,
    info: ContractInfo,
    patternFindings: VulnerabilityFinding[]
  ): Promise<{
    llmFindings: VulnerabilityFinding[];
    summary: string;
  }> {
    if (!this.apiKey) {
      return {
        llmFindings: [],
        summary: "LLM analysis skipped: no API key configured.",
      };
    }

    const systemPrompt = `You are CodeWeaver, a professional Solidity smart contract auditor.
Analyze the provided contract and identify security vulnerabilities, logic errors, and gas optimizations.
Focus on finding issues that static analysis might miss.

For each finding, provide:
- Severity (critical/high/medium/low/informational)
- Exact line number
- Description of the issue
- Concrete fix recommendation

Also provide an overall risk summary.`;

    const userPrompt = `Audit this Solidity contract:

\`\`\`solidity
${source.slice(0, 8000)}
\`\`\`

Contract Info:
- Name: ${info.name}
- Pragma: ${info.pragma}
- Functions: ${info.functions.map(f => `${f.name}(${f.visibility}, ${f.mutability})`).join(", ")}
- State Variables: ${info.stateVariables.map(v => `${v.type} ${v.name}`).join(", ")}
- Inheritance: ${info.inheritance.join(", ") || "None"}

Pattern-based analysis already found ${patternFindings.length} issues:
${patternFindings.slice(0, 10).map(f => `- [${f.severity}] ${f.title} (line ${f.lineStart}): ${f.description.slice(0, 100)}`).join("\n")}

Provide your analysis as JSON:
{
  "findings": [
    {
      "ruleId": "LLM-XX",
      "title": "...",
      "description": "...",
      "severity": "critical|high|medium|low|informational",
      "lineStart": <number>,
      "lineEnd": <number>,
      "recommendation": "..."
    }
  ],
  "summary": "Overall risk assessment (2-3 sentences)"
}

IMPORTANT: Only include findings that are DIFFERENT from what pattern analysis already found. Focus on business logic, architecture, and design-level issues.`;

    try {
      const response = await axios.post(
        this.endpoint,
        {
          model: this.config.model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: this.config.temperature,
          max_tokens: this.config.maxTokens,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "HTTP-Referer": "https://replicant.io",
            "X-Title": "REPLICANT CodeWeaver",
          },
          timeout: 30000,
        }
      );

      const content = response.data.choices[0]?.message?.content || "";
      return this.parseLLMResponse(content);
    } catch (error) {
      console.error("[CodeWeaver] LLM analysis failed:", error);
      return {
        llmFindings: [],
        summary: "LLM analysis unavailable. Report based on pattern analysis only.",
      };
    }
  }

  private parseLLMResponse(content: string): {
    llmFindings: VulnerabilityFinding[];
    summary: string;
  } {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return { llmFindings: [], summary: "Could not parse LLM response." };
      }
      const parsed = JSON.parse(jsonMatch[0]);
      const findings: VulnerabilityFinding[] = (parsed.findings || []).map(
        (f: any) => ({
          ruleId: f.ruleId || "LLM-00",
          title: f.title || "Unknown Issue",
          description: f.description || "",
          severity: f.severity || "medium",
          category: f.category || "logic-error",
          lineStart: f.lineStart || 0,
          lineEnd: f.lineEnd || 0,
          sourceCode: "",
          recommendation: f.recommendation || "",
        })
      );
      return {
        llmFindings: findings,
        summary: parsed.summary || "Analysis complete.",
      };
    } catch {
      return { llmFindings: [], summary: "Could not parse LLM response." };
    }
  }
}
