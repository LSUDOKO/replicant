// === Enums (union types) ===

export type AgentStatus = "active" | "archived" | "slashed" | "evolving";

export type AgentSpecies =
  | "alpha-hunter"
  | "code-weaver"
  | "game-master"
  | "docu-mind"
  | "oracle-keeper"
  | "social-synth";

export type EvolutionStatus =
  | "pending"
  | "mutating"
  | "validating"
  | "completed"
  | "failed";

export type MutationStrategy =
  | "prompt_paraphrase"
  | "temperature_adjust"
  | "context_window_resize"
  | "model_layer_prune"
  | "attention_head_retune"
  | "ensemble_weight_shift";

// === Data Interfaces ===

export interface Agent {
  id: string;
  name: string;
  species: AgentSpecies;
  generation: number;
  status: AgentStatus;
  fitnessScore: number;
  parentId: string | null;
  childrenIds: string[];
  creator: string;
  owner: string;
  createdAt: string;
  price?: number;
  stake: number;
  evolutionCount: number;
  alignmentScore: number;
  txHash: string;
}

export interface EvolutionEvent {
  id: string;
  agentId: string;
  agentName: string;
  parentGeneration: number;
  childGeneration: number;
  status: EvolutionStatus;
  fitnessImprovement: number;
  mutationStrategy: MutationStrategy;
  startedAt: string;
  completedAt?: string;
  txHash: string;
}

export interface ActivityEvent {
  id: string;
  type: "mint" | "evolution" | "slash" | "sale" | "transfer";
  agentId: string;
  agentName: string;
  description: string;
  timestamp: string;
  txHash: string;
}

export interface SpeciesInfo {
  id: AgentSpecies;
  name: string;
  domain: string;
  description: string;
  evolutionTrigger: string;
  demoLine: string;
}

export interface StatCard {
  label: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
}

export interface VitalsDataPoint {
  time: string;
  fitness: number;
  alignment: number;
  inference: number;
}
