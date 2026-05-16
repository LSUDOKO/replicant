import { Chess } from "chess.js";
import type { GameType, PlayerId } from "./types";

function fenFromBoard(board: unknown): string {
  if (typeof board === "string") return board;
  if (board && typeof board === "object" && "fen" in (board as any)) return (board as any).fen;
  return new Chess().fen();
}

export class ChessEngine {
  readonly gameType: GameType = "chess";

  createBoard(): { fen: string } {
    return { fen: new Chess().fen() };
  }

  getValidMoves(board: unknown): { from: string; to: string; promotion?: string }[] {
    const chess = new Chess(fenFromBoard(board));
    return chess.moves({ verbose: true }).map((m) => ({
      from: m.from,
      to: m.to,
      promotion: m.promotion,
    }));
  }

  isValidMove(board: unknown, action: Record<string, unknown>): boolean {
    try {
      const fen = fenFromBoard(board);
      if (!fen) return false;
      const chess = new Chess(fen);
      const result = chess.move({
        from: action.from as string,
        to: action.to as string,
        promotion: action.promotion as string | undefined,
      });
      return result !== null;
    } catch {
      return false;
    }
  }

  applyMove(board: unknown, action: Record<string, unknown>, _player?: string): { fen: string } {
    const chess = new Chess(fenFromBoard(board));
    chess.move({
      from: action.from as string,
      to: action.to as string,
      promotion: action.promotion as string | undefined,
    });
    return { fen: chess.fen() };
  }

  checkWinner(board: unknown): PlayerId | "draw" | null {
    const chess = new Chess(fenFromBoard(board));
    if (chess.isGameOver()) {
      if (chess.isDraw()) return "draw";
      if (chess.turn() === "w") return "human";
      return "agent";
    }
    return null;
  }

  getGameStatus(board: unknown): { isCheck: boolean; isGameOver: boolean; turn: string } {
    const chess = new Chess(fenFromBoard(board));
    return {
      isCheck: chess.isCheck(),
      isGameOver: chess.isGameOver(),
      turn: chess.turn() === "w" ? "white" : "black",
    };
  }

  generateAgentMove(
    fen: string,
    moveHistory: number,
    opponentModel: unknown
  ): { action: Record<string, unknown>; reasoning: string; confidence: number; strategy: string } {
    const chess = new Chess(fen);
    const legalMoves = chess.moves({ verbose: true });
    if (legalMoves.length === 0) {
      return { action: {}, reasoning: "No legal moves available", confidence: 0, strategy: "resign" };
    }

    const phase = moveHistory < 10 ? "opening" : moveHistory < 30 ? "middlegame" : "endgame";

    const scoredMoves = legalMoves.map((m) => {
      const testChess = new Chess(fen);
      testChess.move(m);
      const score = this.scoreMove(testChess, m, phase, opponentModel);
      return { move: m, scores: score };
    });

    const archetype = this.determineArchetype(opponentModel);
    const sortKey = archetype === "aggressive" ? "aggression" : archetype === "defensive" ? "safety" : "overall";
    scoredMoves.sort((a, b) => (b.scores[sortKey as keyof typeof b.scores] as number) - (a.scores[sortKey as keyof typeof a.scores] as number));

    const selected = scoredMoves[0];
    return {
      action: { from: selected.move.from, to: selected.move.to, promotion: selected.move.promotion },
      reasoning: this.generateReasoning(selected.move, selected.scores, phase),
      confidence: Math.min(Math.max(selected.scores.overall + 0.5, 0.3), 0.95),
      strategy: archetype,
    };
  }

  private scoreMove(chess: Chess, move: { captured?: string; from: string; to: string }, phase: string, _opponentModel: unknown) {
    const pieceValues: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };

    const material = move.captured ? (pieceValues[move.captured.toLowerCase()] || 0) / 9 : 0;

    const centerSquares = ["d4", "d5", "e4", "e5"];
    const position = centerSquares.includes(move.to) ? 0.7 : 0.3;

    let aggression = move.captured ? 0.8 : 0.3;
    const attackCount = chess.isCheck() ? 1.0 : aggression;

    const safety = chess.isCheck() ? 0.2 : 0.7;

    const deception = move.captured ? 0.1 : 0.5;

    const phaseWeights: Record<string, { material: number; position: number; safety: number; aggression: number }> = {
      opening: { material: 0.2, position: 0.4, safety: 0.3, aggression: 0.1 },
      middlegame: { material: 0.3, position: 0.2, safety: 0.2, aggression: 0.3 },
      endgame: { material: 0.4, position: 0.3, safety: 0.2, aggression: 0.1 },
    };
    const w = phaseWeights[phase] || phaseWeights.middlegame;

    const overall = material * w.material + position * w.position + safety * w.safety + attackCount * w.aggression;

    return { overall, material, position, safety, aggression, deception };
  }

  private determineArchetype(opponentModel: unknown): string {
    const model = opponentModel as Record<string, unknown> | undefined;
    const agg = (model?.patterns as Record<string, unknown> | undefined)?.aggressiveTendency as number | undefined;
    if (agg !== undefined && agg > 0.6) return "defensive";
    if (agg !== undefined && agg < 0.3) return "aggressive";
    return "balanced";
  }

  private generateReasoning(move: { from: string; to: string; captured?: string; san?: string }, scores: Record<string, number>, phase: string): string {
    const reasons: string[] = [];
    if (move.captured) reasons.push(`captures ${move.captured}`);
    if (scores.aggression > 0.7) reasons.push("creates attacking threats");
    if (scores.safety > 0.7) reasons.push("maintains position safety");
    if (scores.deception > 0.5) reasons.push("sets up hidden tactical possibilities");
    return `In ${phase}, ${move.san || `${move.from}→${move.to}`} ${reasons.length > 0 ? reasons.join(" and ") : "develops position"}`;
  }

  render(board: unknown): string {
    const chess = new Chess(fenFromBoard(board));
    return chess.ascii();
  }
}
