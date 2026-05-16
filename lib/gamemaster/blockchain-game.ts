import type { GameType, PlayerId } from "./types";

interface Tile {
  owner: PlayerId | null;
  defense: number;
  resources: number;
}

export interface BlockchainGameBoard {
  grid: Tile[][];
  scores: Record<PlayerId, number>;
  round: number;
  agentResources: number;
  humanResources: number;
}

const GRID_SIZE = 5;

export class BlockchainGameEngine {
  readonly gameType: GameType = "blockchain-game";

  createBoard(): BlockchainGameBoard {
    const grid: Tile[][] = Array.from({ length: GRID_SIZE }, () =>
      Array.from({ length: GRID_SIZE }, () => ({
        owner: null,
        defense: 1,
        resources: Math.floor(Math.random() * 5) + 1,
      }))
    );
    grid[0][0].owner = "agent";
    grid[0][0].defense = 3;
    grid[GRID_SIZE - 1][GRID_SIZE - 1].owner = "human";
    grid[GRID_SIZE - 1][GRID_SIZE - 1].defense = 3;

    return {
      grid,
      scores: { agent: 0, human: 0 },
      round: 0,
      agentResources: 10,
      humanResources: 10,
    };
  }

  getValidMoves(board: BlockchainGameBoard, player: PlayerId): Record<string, unknown>[] {
    const moves: Record<string, unknown>[] = [];
    const resources = player === "agent" ? board.agentResources : board.humanResources;

    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const tile = board.grid[r][c];
        if (tile.owner === player) {
          if (resources >= 2) {
            moves.push({ type: "reinforce", row: r, col: c });
          }
          const neighbors = this.getNeighbors(r, c);
          for (const [nr, nc] of neighbors) {
            if (board.grid[nr][nc].owner !== player && resources >= tile.defense + 1) {
              moves.push({ type: "attack", fromRow: r, fromCol: c, toRow: nr, toCol: nc });
            }
          }
        }
      }
    }
    return moves;
  }

  isValidMove(board: BlockchainGameBoard, action: Record<string, unknown>, player: PlayerId): boolean {
    const validMoves = this.getValidMoves(board, player);
    return validMoves.some((m) => JSON.stringify(m) === JSON.stringify(action));
  }

  applyMove(board: BlockchainGameBoard, action: Record<string, unknown>, player: PlayerId): BlockchainGameBoard {
    const newBoard = JSON.parse(JSON.stringify(board)) as BlockchainGameBoard;
    const type = action.type as string;

    if (type === "reinforce") {
      const r = action.row as number;
      const c = action.col as number;
      newBoard.grid[r][c].defense += 2;
      if (player === "agent") newBoard.agentResources -= 2;
      else newBoard.humanResources -= 2;
    }

    if (type === "attack") {
      const fr = action.fromRow as number;
      const fc = action.fromCol as number;
      const tr = action.toRow as number;
      const tc = action.toCol as number;
      const attackerStrength = newBoard.grid[fr][fc].defense;
      const defenderStrength = newBoard.grid[tr][tc].defense;

      if (attackerStrength > defenderStrength) {
        newBoard.grid[tr][tc].owner = player;
        newBoard.grid[tr][tc].defense = attackerStrength - defenderStrength;
        newBoard.grid[tr][tc].resources += 2;
      } else {
        newBoard.grid[fr][fc].defense = Math.max(1, attackerStrength - 1);
      }

      const cost = attackerStrength + 1;
      if (player === "agent") newBoard.agentResources -= cost;
      else newBoard.humanResources -= cost;
    }

    return newBoard;
  }

  checkWinner(board: BlockchainGameBoard): PlayerId | "draw" | null {
    if (board.round >= 20) {
      if (board.scores.agent > board.scores.human) return "agent";
      if (board.scores.human > board.scores.agent) return "human";
      return "draw";
    }
    return null;
  }

  getNeighbors(r: number, c: number): [number, number][] {
    const neighbors: [number, number][] = [];
    for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE) {
        neighbors.push([nr, nc]);
      }
    }
    return neighbors;
  }

  collectResources(board: BlockchainGameBoard): BlockchainGameBoard {
    const newBoard = JSON.parse(JSON.stringify(board)) as BlockchainGameBoard;
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const tile = newBoard.grid[r][c];
        if (tile.owner === "agent") newBoard.agentResources += tile.resources;
        else if (tile.owner === "human") newBoard.humanResources += tile.resources;
      }
    }
    return newBoard;
  }

  generateAgentMove(
    board: BlockchainGameBoard,
    _opponentModel: unknown
  ): { action: Record<string, unknown>; reasoning: string; confidence: number } {
    const validMoves = this.getValidMoves(board, "agent");

    const attackMoves = validMoves.filter((m) => m.type === "attack");
    if (attackMoves.length > 0) {
      return {
        action: attackMoves[Math.floor(Math.random() * attackMoves.length)],
        reasoning: "Attacking enemy territory to expand control",
        confidence: 0.7,
      };
    }

    if (board.agentResources >= 4) {
      const reinforceMoves = validMoves.filter((m) => m.type === "reinforce");
      if (reinforceMoves.length > 0) {
        return {
          action: reinforceMoves[Math.floor(Math.random() * reinforceMoves.length)],
          reasoning: "Reinforcing forward positions",
          confidence: 0.6,
        };
      }
    }

    return {
      action: { type: "reinforce", row: 0, col: 0 },
      reasoning: "Conserving resources, reinforcing home base",
      confidence: 0.5,
    };
  }

  render(board: BlockchainGameBoard): string {
    return board.grid
      .map((row) =>
        row
          .map((t) => {
            const owner = t.owner === "agent" ? "A" : t.owner === "human" ? "H" : ".";
            return `${owner}${t.defense}`;
          })
          .join(" ")
      )
      .join("\n");
  }
}
