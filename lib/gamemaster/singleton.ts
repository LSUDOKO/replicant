import { GameEngineService } from "./engine";

// Singleton instance that persists across API requests
let gameEngineInstance: GameEngineService | null = null;

export function getGameEngine(): GameEngineService {
  if (!gameEngineInstance) {
    gameEngineInstance = new GameEngineService();
  }
  return gameEngineInstance;
}
