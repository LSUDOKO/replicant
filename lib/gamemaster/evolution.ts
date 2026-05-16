import type { AgentGameStats, GameType } from "./types";

export interface EvolutionEvent {
  agentId: number;
  fromGeneration: number;
  toGeneration: number;
  timestamp: number;
  reason: string;
  gameType: GameType;
  statsBefore: Partial<AgentGameStats>;
}

export class EvolutionEngine {
  private evolutionHistory: Map<number, EvolutionEvent[]> = new Map();

  shouldEvolve(stats: AgentGameStats): { trigger: boolean; reason: string } {
    if (stats.gamesPlayed < 5) return { trigger: false, reason: "Not enough games played" };

    if (stats.currentWinStreak >= 5) return { trigger: false, reason: "Winning streak, no evolution needed" };

    if (stats.gamesLost >= 3 && stats.gamesLost >= stats.gamesWon) {
      return { trigger: true, reason: `Lost ${stats.gamesLost} games with ${stats.currentWinStreak} win streak. Need strategy improvement.` };
    }

    if (stats.gamesPlayed >= 10 && stats.winRate < 0.4) {
      return { trigger: true, reason: `Win rate ${(stats.winRate * 100).toFixed(0)}% below 40% threshold. Evolution required.` };
    }

    return { trigger: false, reason: "Performance within acceptable range" };
  }

  recordEvolution(event: EvolutionEvent): void {
    const history = this.evolutionHistory.get(event.agentId) || [];
    history.push(event);
    this.evolutionHistory.set(event.agentId, history);
  }

  getEvolutionHistory(agentId: number): EvolutionEvent[] {
    return this.evolutionHistory.get(agentId) || [];
  }

  getCurrentGeneration(agentId: number): number {
    const history = this.evolutionHistory.get(agentId) || [];
    return history.length + 1;
  }

  getStrategyShift(fromGen: number, toGen: number): string {
    const shifts: Record<string, string> = {
      "1→2": "Increased aggression detection. Agent now bluffs more effectively.",
      "2→3": "Improved endgame calculation. Minimax depth increased from 4 to 6.",
      "3→4": "Added opponent modeling layer. Agent adapts to human play styles.",
      "4→5": "Integrated Monte Carlo tree search for imperfect information games.",
      "5→6": "Self-play training pipeline active. Agent practices against its own strategies.",
    };
    return shifts[`${fromGen}→${toGen}`] || "General strategy optimization across all game modes.";
  }
}
