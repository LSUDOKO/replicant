import type { OpponentModel, GameMove, GameState, PlayerId } from "./types";

export class OpponentModeler {
  createInitialModel(playerId: string): OpponentModel {
    return {
      playerId,
      patterns: {
        openingPreference: [],
        aggressiveTendency: 0.5,
        defensiveTendency: 0.5,
        bluffFrequency: 0.5,
        riskTolerance: 0.5,
        favoriteMoves: {},
        responseToLoss: "adaptive",
      },
      confidence: 0.1,
      lastUpdated: Date.now(),
    };
  }

  analyzeOpponent(moveHistory: GameMove[], gameType: string): OpponentModel {
    const playerMoves = moveHistory.filter((m) => m.player !== "agent" as PlayerId);
    const totalMoves = playerMoves.length;

    if (totalMoves === 0) return this.createInitialModel("human");

    const openings = playerMoves.slice(0, 3).map((m) => JSON.stringify(m.action));
    const aggressiveCount = playerMoves.filter((m) => this.isAggressive(m, gameType)).length;

    const freq: Record<string, number> = {};
    for (const m of playerMoves) {
      const key = JSON.stringify(m.action);
      freq[key] = (freq[key] || 0) + 1;
    }

    const responseToLoss = this.detectResponseToLoss(moveHistory);
    const aggressiveRatio = aggressiveCount / totalMoves;

    return {
      playerId: "human",
      patterns: {
        openingPreference: [...new Set(openings)],
        aggressiveTendency: aggressiveRatio,
        defensiveTendency: 1 - aggressiveRatio,
        bluffFrequency: this.calculateBluffFrequency(playerMoves),
        riskTolerance: this.calculateRiskTolerance(playerMoves, gameType),
        favoriteMoves: freq,
        responseToLoss,
      },
      confidence: Math.min(0.1 + totalMoves * 0.05, 0.95),
      lastUpdated: Date.now(),
    };
  }

  private isAggressive(move: GameMove, gameType: string): boolean {
    if (gameType === "chess") {
      const a = move.action;
      return !!(a.captured || a.piece === "p" || (a.to && ["d4", "d5", "e4", "e5"].includes(a.to as string)));
    }
    if (gameType === "rock-paper-scissors") {
      return true;
    }
    if (gameType === "connect-four") {
      const col = move.action.column as number;
      return col >= 2 && col <= 4;
    }
    if (gameType === "tic-tac-toe") {
      const c = move.action;
      return (c.row as number) === 1 && (c.col as number) === 1;
    }
    if (gameType === "poker") {
      return (move.action.type as string) === "raise";
    }
    if (gameType === "blockchain-game") {
      return (move.action.type as string) === "attack";
    }
    return false;
  }

  private calculateBluffFrequency(moves: GameMove[]): number {
    if (moves.length < 5) return 0.3;
    const patterns = moves.map((m) => JSON.stringify(m.action));
    const unique = new Set(patterns).size;
    return Math.min(unique / patterns.length, 0.9);
  }

  private calculateRiskTolerance(moves: GameMove[], gameType: string): number {
    if (moves.length < 3) return 0.5;
    if (gameType === "poker") {
      const raises = moves.filter((m) => (m.action.type as string) === "raise").length;
      return raises / moves.length;
    }
    if (gameType === "blockchain-game") {
      const attacks = moves.filter((m) => (m.action.type as string) === "attack").length;
      return attacks / moves.length;
    }
    return 0.5;
  }

  private detectResponseToLoss(moveHistory: GameMove[]): "aggressive" | "defensive" | "adaptive" {
    if (moveHistory.length < 6) return "adaptive";

    const recentMoves = moveHistory.slice(-6);
    const recentLost = recentMoves.some((m) => m.player !== "agent");

    if (!recentLost) return "adaptive";

    const afterLoss = recentMoves.slice(-3);
    const aggressiveAfter = afterLoss.filter((m) => {
      if (m.player === "agent") return false;
      const a = m.action;
      return !!(a.captured || a.type === "raise" || a.type === "attack");
    }).length;

    if (aggressiveAfter >= 2) return "aggressive";
    if (aggressiveAfter === 0) return "defensive";
    return "adaptive";
  }
}
