# GameMaster & Global Fonts - Implementation Plan

## Current Status

### GameMaster Games ✅ Already Functional
All 6 games are already implemented and working:

1. **Tic Tac Toe** - Minimax AI, perfect play
2. **Connect Four** - Column-based strategy
3. **Chess** - Basic chess engine with FEN notation
4. **Rock Paper Scissors** - Pattern detection
5. **Poker** - Texas Hold'em with betting
6. **Blockchain Game** - Territory control strategy

**How They Work**:
- API endpoints at `/api/games` handle game creation
- Each game has its own engine in `lib/gamemaster/`
- Agent makes moves using strategy algorithms
- Move history and reasoning displayed
- Stats tracked (wins, losses, streaks)

### What Needs to Be Done

## 1. Add Global Fonts (Roboto & Syne)

**Current**: Project uses default system fonts

**Required**: 
- **Roboto** for body text (400, 500, 700 weights)
- **Syne** for headings (600, 700, 800 weights)

**Implementation**:

### Step 1: Update `app/layout.tsx`
```typescript
import { Roboto, Syne } from 'next/font/google';

const roboto = Roboto({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-roboto',
  display: 'swap',
});

const syne = Syne({
  weight: ['600', '700', '800'],
  subsets: ['latin'],
  variable: '--font-syne',
  display: 'swap',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${roboto.variable} ${syne.variable}`}>
      <body className="font-roboto">
        {children}
      </body>
    </html>
  );
}
```

### Step 2: Update `tailwind.config.ts`
```typescript
theme: {
  extend: {
    fontFamily: {
      roboto: ['var(--font-roboto)', 'sans-serif'],
      syne: ['var(--font-syne)', 'sans-serif'],
    },
  },
}
```

### Step 3: Update `app/globals.css`
```css
body {
  font-family: var(--font-roboto), sans-serif;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-syne), sans-serif;
}
```

## 2. Remove Seed Demo Button

**Location**: `components/dashboard/SeedDemoButton.tsx`

**Used In**: 
- `app/dashboard/page.tsx` (main dashboard)
- Possibly other dashboard pages

**Action**:
1. Remove import from dashboard pages
2. Remove component rendering
3. Delete `components/dashboard/SeedDemoButton.tsx` file
4. Delete `/api/demo/seed` endpoint if exists

## 3. Make Game Cards Larger (Modal View)

**Current**: Games display in small cards inline

**Required**: Click game to open in larger modal/popup

**Implementation**:

### Create GameModal Component
```typescript
// components/gamemaster/GameModal.tsx
"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";

export function GameModal({ 
  open, 
  onClose, 
  children 
}: { 
  open: boolean; 
  onClose: () => void; 
  children: React.ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-black border-white/10">
        {children}
      </DialogContent>
    </Dialog>
  );
}
```

### Update GameArena.tsx
```typescript
const [modalOpen, setModalOpen] = useState(false);

// When starting game
const startGame = async () => {
  // ... existing code
  setModalOpen(true); // Open modal when game starts
};

// Render
return (
  <>
    {/* Game selection UI */}
    
    <GameModal open={modalOpen} onClose={() => { setModalOpen(false); resetGame(); }}>
      {/* Render game board here - larger size */}
      <div className="p-8">
        {renderBoard()}
      </div>
    </GameModal>
  </>
);
```

## 4. Ensure All Games Work

### API Endpoints Required

#### `/api/games` (POST) - Create Game
```typescript
{
  gameType: "tic-tac-toe" | "connect-four" | "chess" | "rock-paper-scissors" | "poker" | "blockchain-game",
  agentId: number
}
```

#### `/api/games/[gameId]` (POST) - Make Move
```typescript
{
  move: { /* game-specific action */ },
  player: "human" | "agent"
}
```

#### `/api/agents/game-stats` (GET) - Get Stats
```typescript
?agentId=1
```

### Game-Specific Move Formats

**Tic Tac Toe**:
```json
{ "row": 0, "col": 1 }
```

**Connect Four**:
```json
{ "column": 3 }
```

**Chess**:
```json
{ "from": "e2", "to": "e4" }
```

**Rock Paper Scissors**:
```json
{ "choice": "rock" | "paper" | "scissors" }
```

**Poker**:
```json
{ "type": "check" | "call" | "raise" | "fold", "amount"?: number }
```

**Blockchain Game**:
```json
{ "type": "attack" | "reinforce", "fromRow": 0, "fromCol": 1, "toRow": 0, "toCol": 2 }
```

## 5. Font Usage Guidelines

### Headings (Syne)
- Page titles: `className="font-syne text-2xl font-bold"`
- Section headers: `className="font-syne text-lg font-semibold"`
- Card titles: `className="font-syne text-base font-medium"`

### Body Text (Roboto)
- Paragraphs: `className="font-roboto text-sm"`
- Descriptions: `className="font-roboto text-xs text-white/60"`
- Labels: `className="font-roboto text-xs uppercase tracking-wider"`

### Monospace (Keep for code/hashes)
- Transaction hashes: `className="font-mono"`
- Agent IDs: `className="font-mono"`
- Addresses: `className="font-mono"`

## Testing Checklist

- [ ] Roboto font loads on all pages
- [ ] Syne font loads for all headings
- [ ] Seed Demo button removed from dashboard
- [ ] Game modal opens when starting game
- [ ] Game board displays larger in modal
- [ ] All 6 games playable
- [ ] Agent makes moves automatically
- [ ] Move history displays
- [ ] Stats update after games
- [ ] Fonts consistent across entire app

## Files to Modify

1. `app/layout.tsx` - Add font imports
2. `tailwind.config.ts` - Add font variables
3. `app/globals.css` - Set default fonts
4. `app/dashboard/page.tsx` - Remove SeedDemoButton
5. `components/gamemaster/GameArena.tsx` - Add modal
6. `components/gamemaster/GameModal.tsx` - Create new file
7. Delete: `components/dashboard/SeedDemoButton.tsx`

## Priority Order

1. **High**: Add global fonts (affects entire app)
2. **High**: Remove seed button (cleanup)
3. **Medium**: Add game modal (UX improvement)
4. **Low**: Verify all games work (already functional)

## Notes

- Games are already fully functional via API
- Agent AI already implemented for all games
- Stats tracking already working
- Just need UI/UX improvements (fonts, modal)
- No backend changes needed for games
