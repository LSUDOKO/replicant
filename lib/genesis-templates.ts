import type { AgentSpecies } from "@/types";

export interface GenomeTemplate {
  species: AgentSpecies;
  speciesType: number;
  config: Record<string, unknown>;
}

export const GENOME_TEMPLATES: Record<AgentSpecies, GenomeTemplate> = {
  "alpha-hunter": {
    species: "alpha-hunter",
    speciesType: 0,
    config: {
      name: "AlphaHunter Genesis",
      task: "Aggregate social and market sentiment into BUY/HOLD/SELL signals.",
      model: "0g-router/llm",
      threshold: { accuracyFloor: 0.6, window: 50 },
      dataFeeds: ["market_ohlcv", "social_sentiment", "news_events"],
      mutationStrategies: ["prompt_paraphrase", "temperature_adjust", "source_weight_shift"],
    },
  },
  "code-weaver": {
    species: "code-weaver",
    speciesType: 1,
    config: {
      name: "CodeWeaver Genesis",
      task: "Audit Solidity contracts and classify exploitable vulnerabilities.",
      model: "0g-router/llm",
      threshold: { falseNegativeFloor: 0.05, evaluationSet: "solidity-security-v1" },
      detectors: ["reentrancy", "unchecked_call", "oracle_manipulation", "access_control"],
      mutationStrategies: ["pattern_library_expansion", "analysis_depth_tuning", "false_positive_calibration"],
    },
  },
  "game-master": {
    species: "game-master",
    speciesType: 2,
    config: {
      name: "GameMaster Genesis",
      task: "Operate an adaptive NPC opponent with sealed strategy evolution.",
      model: "0g-router/llm",
      threshold: { winRateFloor: 0.4, games: 100 },
      strategySpace: ["aggressive", "defensive", "bait", "counterplay"],
      mutationStrategies: ["strategy_archetype_shift", "opening_book_expansion", "opponent_modeling"],
    },
  },
  "docu-mind": {
    species: "docu-mind",
    speciesType: 3,
    config: {
      name: "DocuMind Genesis",
      task: "Extract risky legal clauses and explain liability exposure.",
      model: "0g-router/llm",
      threshold: { missedClauseTolerance: 0, reviewMode: "confidential_tee" },
      clauseTypes: ["indemnity", "limitation_of_liability", "termination", "jurisdiction"],
      mutationStrategies: ["template_library_expansion", "jurisdiction_tuning", "nonstandard_clause_detection"],
    },
  },
  "oracle-keeper": {
    species: "oracle-keeper",
    speciesType: 4,
    config: {
      name: "OracleKeeper Genesis",
      task: "Detect manipulated prices before publishing oracle updates.",
      model: "0g-router/llm",
      threshold: { manipulationMissTolerance: 0, sourceCount: 10 },
      sources: ["cex_depth", "dex_twap", "funding_rate", "liquidation_feed"],
      mutationStrategies: ["source_weight_adjustment", "anomaly_threshold_tuning", "attack_pattern_expansion"],
    },
  },
  "social-synth": {
    species: "social-synth",
    speciesType: 5,
    config: {
      name: "SocialSynth Genesis",
      task: "Generate social content and evolve tone based on engagement.",
      model: "0g-router/llm",
      threshold: { engagementFloor: 0.02, posts: 20 },
      formats: ["thread", "short_post", "video_script", "carousel_outline"],
      mutationStrategies: ["tone_shift", "format_variation", "topic_selection_tuning"],
    },
  },
};
