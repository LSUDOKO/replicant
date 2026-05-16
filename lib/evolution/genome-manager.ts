import { keccak256, toHex, type Hash } from "viem";
import { createStorageClient, type StorageClientConfig } from "@/lib/0g-storage";

export interface AgentGenome {
  agentId: string;
  species: string;
  generation: number;
  parentGenomeHash?: string;
  promptTemplate: string;
  systemInstructions: string;
  parameters: {
    temperature: number;
    topP: number;
    maxTokens: number;
    frequencyPenalty: number;
    presencePenalty: number;
  };
  capabilities: string[];
  constraints: string[];
  performanceMetrics: {
    successRate: number;
    avgResponseTime: number;
    errorRate: number;
    userSatisfaction: number;
  };
  evolutionHistory: {
    timestamp: number;
    mutation: string;
    fitnessImprovement: number;
  }[];
  metadata: {
    createdAt: number;
    lastEvolved?: number;
    totalEvolutions: number;
  };
}

export interface PerformanceHistory {
  agentId: string;
  period: { start: number; end: number };
  metrics: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    avgLatency: number;
    p95Latency: number;
    p99Latency: number;
  };
  taskBreakdown: {
    taskType: string;
    count: number;
    successRate: number;
  }[];
  errorPatterns: {
    errorType: string;
    frequency: number;
    lastOccurrence: number;
  }[];
}

export class GenomeManager {
  private storageClient: ReturnType<typeof createStorageClient>;

  constructor(config: StorageClientConfig) {
    this.storageClient = createStorageClient(config);
  }

  /**
   * Upload agent genome to 0G Storage
   */
  async uploadGenome(genome: AgentGenome): Promise<{ rootHash: Hash; txHash: string }> {
    const result = await this.storageClient.uploadJson(genome);
    return {
      rootHash: result.rootHash as Hash,
      txHash: result.txHash,
    };
  }

  /**
   * Download agent genome from 0G Storage
   */
  async downloadGenome(rootHash: Hash): Promise<AgentGenome> {
    const data = await this.storageClient.downloadJson(rootHash);
    return data as AgentGenome;
  }

  /**
   * Upload performance history to 0G Storage
   */
  async uploadPerformanceHistory(history: PerformanceHistory): Promise<{ rootHash: Hash; txHash: string }> {
    const result = await this.storageClient.uploadJson(history);
    return {
      rootHash: result.rootHash as Hash,
      txHash: result.txHash,
    };
  }

  /**
   * Generate a new genome based on parent and mutations
   */
  generateChildGenome(
    parent: AgentGenome,
    mutations: {
      promptMutations?: string[];
      parameterAdjustments?: Partial<AgentGenome["parameters"]>;
      capabilityAdditions?: string[];
      constraintModifications?: string[];
    },
    fitnessImprovement: number
  ): AgentGenome {
    const child: AgentGenome = {
      ...parent,
      generation: parent.generation + 1,
      parentGenomeHash: keccak256(toHex(JSON.stringify(parent))),
      metadata: {
        ...parent.metadata,
        createdAt: Date.now(),
        lastEvolved: Date.now(),
        totalEvolutions: parent.metadata.totalEvolutions + 1,
      },
    };

    // Apply prompt mutations
    if (mutations.promptMutations && mutations.promptMutations.length > 0) {
      child.promptTemplate = mutations.promptMutations[0];
    }

    // Apply parameter adjustments
    if (mutations.parameterAdjustments) {
      child.parameters = {
        ...child.parameters,
        ...mutations.parameterAdjustments,
      };
    }

    // Add new capabilities
    if (mutations.capabilityAdditions) {
      child.capabilities = [...new Set([...child.capabilities, ...mutations.capabilityAdditions])];
    }

    // Modify constraints
    if (mutations.constraintModifications) {
      child.constraints = mutations.constraintModifications;
    }

    // Record evolution
    child.evolutionHistory.push({
      timestamp: Date.now(),
      mutation: JSON.stringify(mutations),
      fitnessImprovement,
    });

    return child;
  }

  /**
   * Create genesis genome for a new agent
   */
  createGenesisGenome(agentId: string, species: string): AgentGenome {
    const templates: Record<string, Partial<AgentGenome>> = {
      "alpha-hunter": {
        promptTemplate: "You are AlphaHunter, a DeFi trading signal analyst. Analyze market data and provide actionable trading insights.",
        systemInstructions: "Focus on identifying high-probability trading opportunities. Prioritize risk management and data-driven analysis.",
        capabilities: ["market-analysis", "sentiment-analysis", "whale-tracking", "signal-generation"],
        constraints: ["no-financial-advice", "data-only-decisions", "risk-disclosure"],
      },
      "code-weaver": {
        promptTemplate: "You are CodeWeaver, a smart contract security auditor. Analyze Solidity code for vulnerabilities and best practices.",
        systemInstructions: "Identify security vulnerabilities, gas optimizations, and code quality issues. Provide actionable recommendations.",
        capabilities: ["vulnerability-detection", "gas-optimization", "code-review", "best-practices"],
        constraints: ["no-code-execution", "static-analysis-only", "severity-classification"],
      },
      "docu-mind": {
        promptTemplate: "You are DocuMind, a legal document analyzer. Review contracts and identify risks, obligations, and key terms.",
        systemInstructions: "Analyze legal documents for risk factors, obligations, and compliance issues. Provide clear summaries.",
        capabilities: ["clause-classification", "risk-detection", "obligation-extraction", "compliance-check"],
        constraints: ["no-legal-advice", "analysis-only", "jurisdiction-aware"],
      },
      "game-master": {
        promptTemplate: "You are GameMaster, a strategic game AI. Play games optimally while learning from opponent patterns.",
        systemInstructions: "Analyze game states, predict opponent moves, and select optimal strategies. Learn and adapt over time.",
        capabilities: ["game-analysis", "strategy-selection", "opponent-modeling", "move-prediction"],
        constraints: ["fair-play", "no-cheating", "rule-compliance"],
      },
      "oracle-keeper": {
        promptTemplate: "You are OracleKeeper, a price feed aggregator. Collect and verify price data from multiple sources.",
        systemInstructions: "Aggregate price data, detect manipulation, and provide reliable price feeds with confidence scores.",
        capabilities: ["price-aggregation", "manipulation-detection", "source-verification", "confidence-scoring"],
        constraints: ["multi-source-required", "outlier-detection", "staleness-check"],
      },
      "social-synth": {
        promptTemplate: "You are SocialSynth, a social media content creator. Generate engaging, on-brand content for various platforms.",
        systemInstructions: "Create platform-optimized content that aligns with brand voice and maximizes engagement.",
        capabilities: ["content-generation", "platform-optimization", "engagement-prediction", "trend-analysis"],
        constraints: ["brand-alignment", "platform-guidelines", "no-misinformation"],
      },
    };

    const template = templates[species] || templates["alpha-hunter"];

    return {
      agentId,
      species,
      generation: 0,
      promptTemplate: template.promptTemplate!,
      systemInstructions: template.systemInstructions!,
      parameters: {
        temperature: 0.7,
        topP: 0.9,
        maxTokens: 2000,
        frequencyPenalty: 0.0,
        presencePenalty: 0.0,
      },
      capabilities: template.capabilities!,
      constraints: template.constraints!,
      performanceMetrics: {
        successRate: 0,
        avgResponseTime: 0,
        errorRate: 0,
        userSatisfaction: 0,
      },
      evolutionHistory: [],
      metadata: {
        createdAt: Date.now(),
        totalEvolutions: 0,
      },
    };
  }
}
