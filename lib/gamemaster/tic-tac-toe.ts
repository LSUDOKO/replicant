import type { GameType, PlayerId } from "./types";

export type TTTSymbol = "X" | "O" | null;
export type TTTBoard = TTTSymbol[][];

export class TicTacToeEngine {
  readonly gameType: GameType = "tic-tac-toe";

  createBoard(): TTTBoard {
    return [
      [null, null, null],
      [null, null, null],
      [null, null, null],
    ];
  }

  getValidMoves(board: TTTBoard): { row: number; col: number }[] {
    const moves: { row: number; col: number }[] = [];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        if (board[r][c] === null) {
          moves.push({ row: r, col: c });
        }
      }
    }
    return moves;
  }

  isValidMove(board: TTTBoard, action: Record<string, unknown>): boolean {
    const row = action.row as number;
    const col = action.col as number;
    if (row === undefined || col === undefined) return false;
    if (row < 0 || row > 2 || col < 0 || col > 2) return false;
    return board[row][col] === null;
  }

  applyMove(board: TTTBoard, action: Record<string, unknown>, player: PlayerId): TTTBoard {
    const newBoard = board.map((r) => [...r]);
    const symbol = player === "agent" ? "X" : "O";
    newBoard[action.row as number][action.col as number] = symbol;
    return newBoard;
  }

  checkWinner(board: TTTBoard): PlayerId | "draw" | null {
    const lines = [
      // rows
      [[0, 0], [0, 1], [0, 2]],
      [[1, 0], [1, 1], [1, 2]],
      [[2, 0], [2, 1], [2, 2]],
      // columns
      [[0, 0], [1, 0], [2, 0]],
      [[0, 1], [1, 1], [2, 1]],
      [[0, 2], [1, 2], [2, 2]],
      // diagonals
      [[0, 0], [1, 1], [2, 2]],
      [[0, 2], [1, 1], [2, 0]],
    ];

    for (const line of lines) {
      const [a, b, c] = line;
      const val = board[a[0]][a[1]];
      if (val && val === board[b[0]][b[1]] && val === board[c[0]][c[1]]) {
        return val === "X" ? "agent" : "human";
      }
    }

    if (board.every((r) => r.every((c) => c !== null))) return "draw";
    return null;
  }

  generateAgentMove(board: TTTBoard, _opponentModel: unknown): { action: Record<string, unknown>; reasoning: string; confidence: number } {
    const validMoves = this.getValidMoves(board);

    const winMove = validMoves.find((m) => {
      const test = this.applyMove(board, { row: m.row, col: m.col }, "agent");
      return this.checkWinner(test) === "agent";
    });
    if (winMove) return { action: winMove, reasoning: "Winning move detected", confidence: 0.95 };

    const blockMove = validMoves.find((m) => {
      const test = this.applyMove(board, { row: m.row, col: m.col }, "human");
      return this.checkWinner(test) === "human";
    });
    if (blockMove) return { action: blockMove, reasoning: "Blocking opponent winning move", confidence: 0.9 };

    if (board[1][1] === null) return { action: { row: 1, col: 1 }, reasoning: "Taking center for positional advantage", confidence: 0.7 };

    const corners = validMoves.filter((m) => [0, 2].includes(m.row) && [0, 2].includes(m.col));
    if (corners.length > 0) {
      const c = corners[Math.floor(Math.random() * corners.length)];
      return { action: c, reasoning: "Taking corner for positional advantage", confidence: 0.6 };
    }

    const m = validMoves[Math.floor(Math.random() * validMoves.length)];
    return { action: m, reasoning: "Developing position", confidence: 0.5 };
  }

  render(board: TTTBoard): string {
    return board.map((r) => r.map((c) => c ?? ".").join(" ")).join("\n");
  }
}
