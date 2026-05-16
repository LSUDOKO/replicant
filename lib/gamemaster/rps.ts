import type { GameType, PlayerId } from "./types";

export type RPSChoice = "rock" | "paper" | "scissors";
export interface RPSBoard {
  round: number;
  scores: Record<PlayerId, number>;
  lastAgentChoice?: RPSChoice;
  lastHumanChoice?: RPSChoice;
}

export class RPSEngine {
  readonly gameType: GameType = "rock-paper-scissors";
  readonly WIN_SCORE = 5;

  createBoard(): RPSBoard {
    return { round: 0, scores: { agent: 0, human: 0 } };
  }

  getValidMoves(): RPSChoice[] {
    return ["rock", "paper", "scissors"];
  }

  isValidMove(_board: unknown, action: Record<string, unknown>): boolean {
    return ["rock", "paper", "scissors"].includes(action.choice as string);
  }

  applyMove(board: RPSBoard, action: Record<string, unknown>, player: PlayerId): RPSBoard {
    const choice = action.choice as RPSChoice;
    return {
      ...board,
      round: board.round + 1,
      lastAgentChoice: player === "agent" ? choice : board.lastAgentChoice,
      lastHumanChoice: player === "human" ? choice : board.lastHumanChoice,
    };
  }

  checkRoundWinner(agentChoice: RPSChoice, humanChoice: RPSChoice): PlayerId | "draw" {
    if (agentChoice === humanChoice) return "draw";
    if (
      (agentChoice === "rock" && humanChoice === "scissors") ||
      (agentChoice === "paper" && humanChoice === "rock") ||
      (agentChoice === "scissors" && humanChoice === "paper")
    ) {
      return "agent";
    }
    return "human";
  }

  checkWinner(board: RPSBoard): PlayerId | "draw" | null {
    if (board.scores.agent >= this.WIN_SCORE) return "agent";
    if (board.scores.human >= this.WIN_SCORE) return "human";
    return null;
  }

  generateAgentMove(
    board: RPSBoard,
    moveHistory: { player: PlayerId; choice: RPSChoice }[]
  ): { action: Record<string, unknown>; reasoning: string; confidence: number } {
    const humanMoves = moveHistory.filter((m) => m.player !== "agent").map((m) => m.choice);

    if (humanMoves.length < 3) {
      const choice = (["rock", "paper", "scissors"] as RPSChoice[])[Math.floor(Math.random() * 3)];
      return {
        action: { choice },
        reasoning: "Insufficient data, randomizing opening move",
        confidence: 0.33,
      };
    }

    const lastThree = humanMoves.slice(-3);
    if (new Set(lastThree).size === 1) {
      const predicted = lastThree[0];
      const counter = this.counterMove(predicted);
      return {
        action: { choice: counter },
        reasoning: `Opponent streaking with ${predicted}, predicting they will switch`,
        confidence: 0.6,
      };
    }

    const freq: Record<string, number> = {};
    for (const m of humanMoves) freq[m] = (freq[m] || 0) + 1;
    const mostCommon = Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0] as RPSChoice;
    const counter = this.counterMove(mostCommon);
    const freqRatio = freq[mostCommon] / humanMoves.length;

    return {
      action: { choice: counter },
      reasoning: `Opponent favors ${mostCommon} (${(freqRatio * 100).toFixed(0)}% of moves), countering`,
      confidence: 0.55 + freqRatio * 0.3,
    };
  }

  private counterMove(choice: RPSChoice): RPSChoice {
    const counters: Record<RPSChoice, RPSChoice> = { rock: "paper", paper: "scissors", scissors: "rock" };
    return counters[choice];
  }
}
