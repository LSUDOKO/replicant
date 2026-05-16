import { keccak256, toHex } from "viem";
import type { GameState, GameMove, GameCreateRequest, MoveResult, GameType, PlayerId, AgentGameStats, OpponentModel } from "./types";
import { TicTacToeEngine } from "./tic-tac-toe";
import { ConnectFourEngine } from "./connect-four";
import { ChessEngine } from "./chess";
import { RPSEngine, type RPSBoard, type RPSChoice } from "./rps";
import { PokerEngine } from "./poker";
import { BlockchainGameEngine } from "./blockchain-game";
import { OpponentModeler } from "./opponent-model";
import { EvolutionEngine } from "./evolution";

type AnyEngine = TicTacToeEngine | ConnectFourEngine | ChessEngine | RPSEngine | PokerEngine | BlockchainGameEngine;

function generateId(): string {
  return `game-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function generateTeeAttestation(data: string): string {
  return `0x${keccak256(toHex(data + Date.now() + Math.random())).slice(2, 66)}`;
}

export class GameEngineService {
  private games: Map<string, GameState> = new Map();
  private engines: Map<GameType, AnyEngine>;
  private opponentModeler: OpponentModeler;
  public evolution: EvolutionEngine;
  private agentStats: Map<number, AgentGameStats> = new Map();

  constructor() {
    this.engines = new Map<GameType, AnyEngine>([
      ["tic-tac-toe", new TicTacToeEngine()],
      ["connect-four", new ConnectFourEngine()],
      ["chess", new ChessEngine()],
      ["rock-paper-scissors", new RPSEngine()],
      ["poker", new PokerEngine()],
      ["blockchain-game", new BlockchainGameEngine()],
    ]);
    this.opponentModeler = new OpponentModeler();
    this.evolution = new EvolutionEngine();
  }

  getStats(agentId: number): AgentGameStats {
    return this.agentStats.get(agentId) || {
      gamesPlayed: 0,
      gamesWon: 0,
      gamesLost: 0,
      draws: 0,
      winRate: 0,
      currentWinStreak: 0,
      bestWinStreak: 0,
      evolutionGeneration: 1,
      totalMovesMade: 0,
    };
  }

  async createGame(request: GameCreateRequest): Promise<GameState> {
    const engine = this.engines.get(request.gameType);
    if (!engine) throw new Error(`Unknown game type: ${request.gameType}`);

    const gameId = generateId();
    const board = engine.createBoard();

    const game: GameState = {
      gameId,
      gameType: request.gameType,
      board,
      players: [
        { id: "agent", name: "GameMaster" },
        { id: "human", name: "Player", address: request.humanPlayer },
      ],
      currentPlayer: "human",
      moveHistory: [],
      agentModel: this.opponentModeler.createInitialModel(request.humanPlayer || "human"),
      status: "active",
      agentId: request.agentId,
      timestamp: Date.now(),
    };

    this.games.set(gameId, game);
    return game;
  }

  getGame(gameId: string): GameState | undefined {
    return this.games.get(gameId);
  }

  async makeMove(gameId: string, player: PlayerId, action: Record<string, unknown>): Promise<MoveResult> {
    const game = this.games.get(gameId);
    if (!game) throw new Error("Game not found");
    if (game.status !== "active") throw new Error("Game is not active");
    if (game.currentPlayer !== player) throw new Error(`It's ${game.currentPlayer}'s turn`);

    const engine = this.engines.get(game.gameType)!;

    if (game.gameType === "rock-paper-scissors") {
      const rpsEngine = engine as RPSEngine;
      if (!rpsEngine.isValidMove(game.board as RPSBoard, action)) throw new Error("Invalid move");

      const humanChoice = action.choice as RPSChoice;
      game.moveHistory.push({ player: "human", action, timestamp: Date.now() });
      game.board = rpsEngine.applyMove(game.board as RPSBoard, action, "human");

      const agentResult = this.generateAgentMoveSync(game);
      game.moveHistory.push({
        player: "agent", action: agentResult.action, timestamp: Date.now(),
        reasoning: agentResult.reasoning, strategy: agentResult.strategy, confidence: agentResult.confidence,
      });

      const roundWinner = rpsEngine.checkRoundWinner(agentResult.action.choice as RPSChoice, humanChoice as RPSChoice);
      if (roundWinner === "agent") (game.board as any).scores.agent++;
      else if (roundWinner === "human") (game.board as any).scores.human++;

      game.reasoning = agentResult.reasoning;
      game.strategy = agentResult.strategy;
      game.confidence = agentResult.confidence;

      const matchWinner = rpsEngine.checkWinner(game.board as any);
      if (matchWinner) {
        game.status = "completed";
        game.winner = matchWinner;
      }

      game.agentModel = this.opponentModeler.analyzeOpponent(game.moveHistory, game.gameType);
      this.updateStats(game);
      return { gameState: game, agentMove: agentResult };
    }

    if (!engine.isValidMove(game.board as never, action, player)) throw new Error("Invalid move");

    game.board = engine.applyMove(game.board as never, action, player);
    game.moveHistory.push({ player, action, timestamp: Date.now() });

    let winner = engine.checkWinner(game.board as never);
    if (winner) {
      game.status = "completed";
      game.winner = winner;
      this.updateStats(game);
      return { gameState: game };
    }

    game.currentPlayer = "agent";
    const agentResult = this.generateAgentMoveSync(game);
    game.moveHistory.push({
      player: "agent", action: agentResult.action, timestamp: Date.now(),
      reasoning: agentResult.reasoning, strategy: agentResult.strategy, confidence: agentResult.confidence,
    });
    game.board = engine.applyMove(game.board as never, agentResult.action, "agent");
    game.reasoning = agentResult.reasoning;
    game.strategy = agentResult.strategy;
    game.confidence = agentResult.confidence;

    winner = engine.checkWinner(game.board as never);
    if (winner) {
      game.status = "completed";
      game.winner = winner;
    } else {
      game.currentPlayer = "human";
    }

    game.agentModel = this.opponentModeler.analyzeOpponent(game.moveHistory, game.gameType);
    this.updateStats(game);
    return { gameState: game, agentMove: agentResult };
  }

  private generateAgentMoveSync(game: GameState): { action: Record<string, unknown>; reasoning: string; confidence: number; strategy: string } {
    const engine = this.engines.get(game.gameType)!;

    if (game.gameType === "chess") {
      const chessEngine = engine as ChessEngine;
      return chessEngine.generateAgentMove((game.board as any).fen, game.moveHistory.length, game.agentModel);
    }
    if (game.gameType === "tic-tac-toe") {
      const tttEngine = engine as TicTacToeEngine;
      const r = tttEngine.generateAgentMove(game.board as any, game.agentModel);
      return { ...r, strategy: "balanced" };
    }
    if (game.gameType === "connect-four") {
      const cfEngine = engine as ConnectFourEngine;
      const r = cfEngine.generateAgentMove(game.board as any, game.agentModel);
      return { ...r, strategy: "balanced" };
    }
    if (game.gameType === "rock-paper-scissors") {
      const rpsEngine = engine as RPSEngine;
      const humanMoves = game.moveHistory.filter((m) => m.player === "human").map((m) => m.action.choice as RPSChoice);
      const r = rpsEngine.generateAgentMove(game.board as any, humanMoves.map(c => ({ player: "human" as PlayerId, choice: c })));
      return { ...r, strategy: "frequency-exploitation" };
    }
    if (game.gameType === "poker") {
      const pokerEngine = engine as PokerEngine;
      const r = pokerEngine.generateAgentMove(game.board as any, game.agentModel);
      return { ...r, strategy: "hand-strength" };
    }
    if (game.gameType === "blockchain-game") {
      const bcEngine = engine as BlockchainGameEngine;
      const r = bcEngine.generateAgentMove(game.board as any, game.agentModel);
      return { ...r, strategy: "territorial" };
    }
    throw new Error("Unknown game type");
  }

  private updateStats(game: GameState): void {
    const stats = this.getStats(game.agentId);
    stats.gamesPlayed++;
    stats.totalMovesMade += game.moveHistory.length;

    if (game.winner === "agent") {
      stats.gamesWon++;
      stats.currentWinStreak++;
      if (stats.currentWinStreak > stats.bestWinStreak) {
        stats.bestWinStreak = stats.currentWinStreak;
      }
    } else if (game.winner === "human") {
      stats.gamesLost++;
      stats.currentWinStreak = 0;
    } else if (game.winner === "draw") {
      stats.draws++;
    }

    stats.winRate = stats.gamesPlayed > 0 ? stats.gamesWon / stats.gamesPlayed : 0;
    this.agentStats.set(game.agentId, stats);
  }

  getEngine(gameType: GameType): AnyEngine {
    const engine = this.engines.get(gameType);
    if (!engine) throw new Error(`Unknown game type: ${gameType}`);
    return engine;
  }
}
