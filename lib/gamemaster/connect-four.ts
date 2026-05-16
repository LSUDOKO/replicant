import type { GameType, PlayerId } from "./types";

type Cell = "agent" | "human" | null;
export type CFBoard = Cell[][];

export class ConnectFourEngine {
  readonly gameType: GameType = "connect-four";
  readonly ROWS = 6;
  readonly COLS = 7;

  createBoard(): CFBoard {
    return Array.from({ length: this.ROWS }, () => Array(this.COLS).fill(null));
  }

  getValidMoves(board: CFBoard): number[] {
    const moves: number[] = [];
    for (let c = 0; c < this.COLS; c++) {
      if (board[0][c] === null) moves.push(c);
    }
    return moves;
  }

  isValidMove(board: CFBoard, action: Record<string, unknown>): boolean {
    const col = action.column as number;
    if (col === undefined || col < 0 || col >= this.COLS) return false;
    return board[0][col] === null;
  }

  applyMove(board: CFBoard, action: Record<string, unknown>, player: PlayerId): CFBoard {
    const col = action.column as number;
    const newBoard = board.map((r) => [...r]);
    for (let r = this.ROWS - 1; r >= 0; r--) {
      if (newBoard[r][col] === null) {
        newBoard[r][col] = player;
        break;
      }
    }
    return newBoard;
  }

  checkWinner(board: CFBoard): PlayerId | "draw" | null {
    const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];

    for (let r = 0; r < this.ROWS; r++) {
      for (let c = 0; c < this.COLS; c++) {
        const player = board[r][c];
        if (!player) continue;

        for (const [dr, dc] of directions) {
          let count = 1;
          for (let i = 1; i < 4; i++) {
            const nr = r + dr * i;
            const nc = c + dc * i;
            if (nr < 0 || nr >= this.ROWS || nc < 0 || nc >= this.COLS) break;
            if (board[nr][nc] === player) count++;
            else break;
          }
          if (count >= 4) return player;
        }
      }
    }

    if (board[0].every((c) => c !== null)) return "draw";
    return null;
  }

  generateAgentMove(
    board: CFBoard,
    _opponentModel: unknown
  ): { action: Record<string, unknown>; reasoning: string; confidence: number } {
    const validMoves = this.getValidMoves(board);

    const winMove = validMoves.find((c) => {
      const test = this.applyMove(board, { column: c }, "agent");
      return this.checkWinner(test) === "agent";
    });
    if (winMove !== undefined) {
      return { action: { column: winMove }, reasoning: "Winning move detected — connecting 4", confidence: 0.95 };
    }

    const blockMove = validMoves.find((c) => {
      const test = this.applyMove(board, { column: c }, "human");
      return this.checkWinner(test) === "human";
    });
    if (blockMove !== undefined) {
      return { action: { column: blockMove }, reasoning: "Blocking opponent's 4-in-a-row threat", confidence: 0.9 };
    }

    const { bestCol } = this.minimax(board, 4, -Infinity, Infinity, true);
    if (bestCol !== undefined && validMoves.includes(bestCol)) {
      return { action: { column: bestCol }, reasoning: "Minimax evaluation favors this column", confidence: 0.75 };
    }

    const centerMoves = validMoves.filter((c) => c >= 2 && c <= 4);
    const targetMoves = centerMoves.length > 0 ? centerMoves : validMoves;
    const col = targetMoves[Math.floor(Math.random() * targetMoves.length)];
    return {
      action: { column: col },
      reasoning: col === 3 ? "Taking center column for positional control" : "Developing position",
      confidence: 0.6,
    };
  }

  private minimax(
    board: CFBoard,
    depth: number,
    alpha: number,
    beta: number,
    maximizing: boolean
  ): { bestCol: number | undefined; score: number } {
    const winner = this.checkWinner(board);
    if (winner === "agent") return { bestCol: undefined, score: 10000 };
    if (winner === "human") return { bestCol: undefined, score: -10000 };
    if (winner === "draw" || depth === 0) return { bestCol: undefined, score: this.evaluateBoard(board) };

    const validMoves = this.getValidMoves(board);
    if (validMoves.length === 0) return { bestCol: undefined, score: 0 };

    if (maximizing) {
      let maxScore = -Infinity;
      let bestCol = validMoves[0];
      for (const col of validMoves) {
        const newBoard = this.applyMove(board, { column: col }, "agent");
        const { score } = this.minimax(newBoard, depth - 1, alpha, beta, false);
        if (score > maxScore) {
          maxScore = score;
          bestCol = col;
        }
        alpha = Math.max(alpha, score);
        if (beta <= alpha) break;
      }
      return { bestCol, score: maxScore };
    } else {
      let minScore = Infinity;
      let bestCol = validMoves[0];
      for (const col of validMoves) {
        const newBoard = this.applyMove(board, { column: col }, "human");
        const { score } = this.minimax(newBoard, depth - 1, alpha, beta, true);
        if (score < minScore) {
          minScore = score;
          bestCol = col;
        }
        beta = Math.min(beta, score);
        if (beta <= alpha) break;
      }
      return { bestCol, score: minScore };
    }
  }

  private evaluateBoard(board: CFBoard): number {
    let score = 0;

    const centerCol = Math.floor(this.COLS / 2);
    for (let r = 0; r < this.ROWS; r++) {
      if (board[r][centerCol] === "agent") score += 3;
      else if (board[r][centerCol] === "human") score -= 3;
    }

    score += this.evaluateWindow(board, "agent") * 10;
    score -= this.evaluateWindow(board, "human") * 10;

    return score;
  }

  private evaluateWindow(board: CFBoard, player: PlayerId): number {
    let score = 0;
    const opponent: PlayerId = player === "agent" ? "human" : "agent";

    const lines: number[][] = [];
    for (let r = 0; r < this.ROWS; r++) {
      for (let c = 0; c <= this.COLS - 4; c++) {
        const line: number[] = [];
        for (let i = 0; i < 4; i++) line.push(r * this.COLS + c + i);
        lines.push(line);
      }
    }
    for (let c = 0; c < this.COLS; c++) {
      for (let r = 0; r <= this.ROWS - 4; r++) {
        const line: number[] = [];
        for (let i = 0; i < 4; i++) line.push((r + i) * this.COLS + c);
        lines.push(line);
      }
    }
    for (let r = 0; r <= this.ROWS - 4; r++) {
      for (let c = 0; c <= this.COLS - 4; c++) {
        const line: number[] = [];
        for (let i = 0; i < 4; i++) line.push((r + i) * this.COLS + c + i);
        lines.push(line);
      }
    }
    for (let r = 3; r < this.ROWS; r++) {
      for (let c = 0; c <= this.COLS - 4; c++) {
        const line: number[] = [];
        for (let i = 0; i < 4; i++) line.push((r - i) * this.COLS + c + i);
        lines.push(line);
      }
    }

    for (const line of lines) {
      let playerCount = 0;
      let opponentCount = 0;
      for (const idx of line) {
        const r = Math.floor(idx / this.COLS);
        const c = idx % this.COLS;
        if (board[r][c] === player) playerCount++;
        else if (board[r][c] === opponent) opponentCount++;
      }
      if (opponentCount === 0) score += playerCount * playerCount;
    }
    return score;
  }

  render(board: CFBoard): string {
    return board
      .map((r) => r.map((c) => (c === "agent" ? "X" : c === "human" ? "O" : ".")).join(" "))
      .join("\n") + "\n0 1 2 3 4 5 6";
  }
}
