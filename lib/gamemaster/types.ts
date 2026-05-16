export type GameType = "tic-tac-toe" | "connect-four" | "chess" | "rock-paper-scissors" | "poker" | "blockchain-game";

export type GameStatus = "waiting" | "active" | "completed";
export type PlayerId = "agent" | "human";

export interface GamePlayer {
  id: PlayerId;
  address?: string;
  name: string;
}

export interface GameMove {
  player: PlayerId;
  action: Record<string, unknown>;
  timestamp: number;
  reasoning?: string;
  strategy?: string;
  confidence?: number;
}

export interface OpponentModel {
  playerId: string;
  patterns: {
    openingPreference: string[];
    aggressiveTendency: number;
    defensiveTendency: number;
    bluffFrequency: number;
    riskTolerance: number;
    favoriteMoves: Record<string, number>;
    responseToLoss: "aggressive" | "defensive" | "adaptive";
  };
  confidence: number;
  lastUpdated: number;
}

export interface GameState {
  gameId: string;
  gameType: GameType;
  board: unknown;
  players: [GamePlayer, GamePlayer];
  currentPlayer: PlayerId;
  moveHistory: GameMove[];
  agentModel: OpponentModel;
  status: GameStatus;
  winner?: PlayerId | "draw";
  agentId: number;
  reasoning?: string;
  strategy?: string;
  confidence?: number;
  timestamp: number;
}

export interface AgentGameStats {
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  draws: number;
  winRate: number;
  currentWinStreak: number;
  bestWinStreak: number;
  evolutionGeneration: number;
  totalMovesMade: number;
}

export interface GameMoveRequest {
  action: Record<string, unknown>;
}

export interface GameCreateRequest {
  gameType: GameType;
  agentId: number;
  humanPlayer?: string;
}

export interface MoveResult {
  gameState: GameState;
  agentMove?: {
    action: Record<string, unknown>;
    reasoning: string;
    strategy: string;
    confidence: number;
  };
}
