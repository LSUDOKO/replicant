# GameMaster API - Complete Implementation

## What Was Fixed

### Issue: "Game not found" Error
**Problem**: API endpoints for games didn't exist, causing all game operations to fail

**Solution**: Created 3 API endpoints:

## API Endpoints Created

### 1. `/api/games` (POST) - Create New Game
**Purpose**: Initialize a new game session

**Request**:
```json
{
  "gameType": "poker" | "tic-tac-toe" | "connect-four" | "chess" | "rock-paper-scissors" | "blockchain-game",
  "agentId": 1
}
```

**Response**:
```json
{
  "success": true,
  "game": {
    "gameId": "game-1234567890-abc123",
    "gameType": "poker",
    "board": { /* game-specific board state */ },
    "players": [
      { "id": "agent", "name": "GameMaster" },
      { "id": "human", "name": "Player" }
    ],
    "currentPlayer": "human",
    "moveHistory": [],
    "status": "active",
    "agentId": 1,
    "timestamp": 1234567890
  }
}
```

### 2. `/api/games/[gameId]` (POST) - Make Move
**Purpose**: Submit a move and get agent's response

**Request**:
```json
{
  "move": { /* game-specific move */ },
  "player": "human"
}
```

**Example Moves by Game**:

**Poker**:
```json
{
  "move": { "type": "call" },
  "player": "human"
}
```

**Tic Tac Toe**:
```json
{
  "move": { "row": 1, "col": 1 },
  "player": "human"
}
```

**Connect Four**:
```json
{
  "move": { "column": 3 },
  "player": "human"
}
```

**Chess**:
```json
{
  "move": { "from": "e2", "to": "e4" },
  "player": "human"
}
```

**Rock Paper Scissors**:
```json
{
  "move": { "choice": "rock" },
  "player": "human"
}
```

**Blockchain Game**:
```json
{
  "move": { "type": "attack", "fromRow": 0, "fromCol": 1, "toRow": 0, "toCol": 2 },
  "player": "human"
}
```

**Response**:
```json
{
  "success": true,
  "gameState": {
    "gameId": "game-1234567890-abc123",
    "board": { /* updated board */ },
    "currentPlayer": "human",
    "moveHistory": [
      {
        "player": "human",
        "action": { "type": "call" },
        "timestamp": 1234567890
      },
      {
        "player": "agent",
        "action": { "type": "raise", "amount": 20 },
        "timestamp": 1234567891,
        "reasoning": "Strong hand detected, applying pressure",
        "strategy": "aggressive",
        "confidence": 0.85
      }
    ],
    "status": "active",
    "reasoning": "Strong hand detected, applying pressure",
    "strategy": "aggressive",
    "confidence": 0.85
  },
  "agentMove": {
    "action": { "type": "raise", "amount": 20 },
    "reasoning": "Strong hand detected, applying pressure",
    "confidence": 0.85,
    "strategy": "aggressive"
  }
}
```

### 3. `/api/agents/game-stats` (GET) - Get Agent Stats
**Purpose**: Retrieve agent's game performance statistics

**Request**:
```
GET /api/agents/game-stats?agentId=1
```

**Response**:
```json
{
  "success": true,
  "stats": {
    "gamesPlayed": 15,
    "gamesWon": 8,
    "gamesLost": 6,
    "draws": 1,
    "winRate": 0.533,
    "currentWinStreak": 2,
    "bestWinStreak": 4,
    "evolutionGeneration": 1,
    "totalMovesMade": 245
  },
  "evolution": {
    "shouldEvolve": false,
    "reason": null
  }
}
```

## Game Flow

### 1. Start Game
```typescript
const response = await fetch("/api/games", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    gameType: "poker",
    agentId: 1
  })
});

const { game } = await response.json();
// game.gameId = "game-1234567890-abc123"
```

### 2. Make Move
```typescript
const response = await fetch(`/api/games/${game.gameId}`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    move: { type: "call" },
    player: "human"
  })
});

const { gameState, agentMove } = await response.json();
// Agent automatically responds with its move
```

### 3. Check Stats
```typescript
const response = await fetch(`/api/agents/game-stats?agentId=1`);
const { stats, evolution } = await response.json();
// stats.winRate, stats.gamesWon, etc.
```

## Game Engines

Each game has its own engine in `lib/gamemaster/`:

1. **TicTacToeEngine** (`tic-tac-toe.ts`)
   - Minimax algorithm
   - Perfect play
   - Win/block detection

2. **ConnectFourEngine** (`connect-four.ts`)
   - Column-based strategy
   - Threat detection
   - Positional evaluation

3. **ChessEngine** (`chess.ts`)
   - FEN notation
   - Basic piece values
   - Material evaluation

4. **RPSEngine** (`rps.ts`)
   - Pattern detection
   - Frequency analysis
   - Counter-strategy

5. **PokerEngine** (`poker.ts`)
   - Texas Hold'em rules
   - Hand strength evaluation
   - Betting strategy

6. **BlockchainGameEngine** (`blockchain-game.ts`)
   - Territory control
   - Resource management
   - Attack/defense strategy

## Agent AI Features

### Strategy Selection
- **Aggressive**: High-risk, high-reward plays
- **Defensive**: Conservative, safe plays
- **Balanced**: Mix of both
- **Adaptive**: Changes based on opponent

### Reasoning Display
Every agent move includes:
- **Action**: What the agent did
- **Reasoning**: Why it made that move
- **Confidence**: How sure it is (0-1)
- **Strategy**: Current strategy being used

### Opponent Modeling
Agent tracks:
- Move patterns
- Preferred strategies
- Weaknesses
- Tendencies

### Evolution Trigger
Agent evolves when:
- Win rate < 40% after 10+ games
- Suggests strategy improvement needed

## Testing

### Test Poker Game
```bash
# 1. Create game
curl -X POST http://localhost:3000/api/games \
  -H "Content-Type: application/json" \
  -d '{"gameType":"poker","agentId":1}'

# 2. Make move (use gameId from response)
curl -X POST http://localhost:3000/api/games/game-xxx \
  -H "Content-Type: application/json" \
  -d '{"move":{"type":"call"},"player":"human"}'

# 3. Check stats
curl http://localhost:3000/api/agents/game-stats?agentId=1
```

### Test All Games
1. **Tic Tac Toe**: Click center square
2. **Connect Four**: Drop in column 3
3. **Chess**: Move e2 to e4
4. **RPS**: Choose rock
5. **Poker**: Click "Call" button
6. **Blockchain**: Click adjacent tile

## Files Created

1. `app/api/games/route.ts` - Game creation endpoint
2. `app/api/games/[gameId]/route.ts` - Move submission endpoint
3. `app/api/agents/game-stats/route.ts` - Stats retrieval endpoint

## How It Works

### In-Memory Storage
```typescript
const gameEngine = new GameEngineService();
// Stores games in Map<string, GameState>
// In production, use Redis or database
```

### Game State Management
```typescript
interface GameState {
  gameId: string;
  gameType: GameType;
  board: any; // Game-specific board
  players: Player[];
  currentPlayer: PlayerId;
  moveHistory: GameMove[];
  agentModel: OpponentModel;
  status: "active" | "completed";
  winner?: PlayerId | "draw";
  reasoning?: string;
  strategy?: string;
  confidence?: number;
  agentId: number;
  timestamp: number;
}
```

### Move Processing
1. Validate move is legal
2. Apply move to board
3. Check for winner
4. Generate agent move
5. Apply agent move
6. Check for winner again
7. Update stats
8. Return updated state

## Next Steps

To make games look more professional:

1. **Add Animations**
   - Piece movements
   - Card flips
   - Winning celebrations

2. **Better Visuals**
   - Larger game boards
   - Better card designs
   - Smooth transitions

3. **Sound Effects**
   - Move sounds
   - Win/loss sounds
   - Background music

4. **Modal View**
   - Open games in larger modal
   - Better focus on gameplay
   - Easier to see details

5. **Real-time Updates**
   - WebSocket for live updates
   - Spectator mode
   - Multiplayer support

## Current Status

✅ All 6 games fully functional
✅ API endpoints working
✅ Agent AI making moves
✅ Stats tracking
✅ Move history
✅ Reasoning display
✅ Strategy adaptation
✅ Evolution triggers

The games are now fully playable and professional!
