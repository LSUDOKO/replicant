import type { GameType, PlayerId } from "./types";

type Suit = "h" | "d" | "c" | "s";
type Rank = "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";

interface Card {
  suit: Suit;
  rank: Rank;
}

interface PokerAction {
  type: "fold" | "check" | "call" | "raise";
  amount?: number;
}

export interface PokerBoard {
  deck: Card[];
  agentHand: Card[];
  humanHand: Card[];
  communityCards: Card[];
  pot: number;
  currentBet: number;
  phase: "preflop" | "flop" | "turn" | "river" | "showdown";
  scores: Record<PlayerId, number>;
  round: number;
  lastAction?: { player: PlayerId; action: PokerAction };
}

const SUITS: Suit[] = ["h", "d", "c", "s"];
const RANKS: Rank[] = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function evaluateHand(hand: Card[], community: Card[]): { rank: number; name: string } {
  const allCards = [...hand, ...community];
  const rankCounts: Record<string, number> = {};
  const suits: Record<string, number> = {};
  for (const c of allCards) {
    rankCounts[c.rank] = (rankCounts[c.rank] || 0) + 1;
    suits[c.suit] = (suits[c.suit] || 0) + 1;
  }

  const values = allCards.map((c) => RANKS.indexOf(c.rank)).sort((a, b) => b - a);
  const isFlush = Object.values(suits).some((v) => v >= 5);
  const isStraight = (() => {
    const unique = [...new Set(values)].sort((a, b) => b - a);
    for (let i = 0; i <= unique.length - 5; i++) {
      if (unique[i] - unique[i + 4] === 4) return true;
    }
    if (unique.includes(12) && unique.includes(0) && unique.includes(1) && unique.includes(2) && unique.includes(3)) return true;
    return false;
  })();

  const counts = Object.values(rankCounts).sort((a, b) => b - a);

  if (isFlush && isStraight) {
    if (values.includes(12) && values.includes(0)) return { rank: 9, name: "Royal Flush" };
    return { rank: 8, name: "Straight Flush" };
  }
  if (counts[0] === 4) return { rank: 7, name: "Four of a Kind" };
  if (counts[0] === 3 && counts[1] === 2) return { rank: 6, name: "Full House" };
  if (isFlush) return { rank: 5, name: "Flush" };
  if (isStraight) return { rank: 4, name: "Straight" };
  if (counts[0] === 3) return { rank: 3, name: "Three of a Kind" };
  if (counts[0] === 2 && counts[1] === 2) return { rank: 2, name: "Two Pair" };
  if (counts[0] === 2) return { rank: 1, name: "One Pair" };
  return { rank: 0, name: "High Card" };
}

export class PokerEngine {
  readonly gameType: GameType = "poker";
  readonly MAX_BET = 100;

  createBoard(): PokerBoard {
    const deck = shuffle(SUITS.flatMap((s) => RANKS.map((r) => ({ suit: s, rank: r }))));
    return {
      deck,
      agentHand: [deck[0], deck[1]],
      humanHand: [deck[2], deck[3]],
      communityCards: [],
      pot: 0,
      currentBet: 0,
      phase: "preflop",
      scores: { agent: 0, human: 0 },
      round: 0,
    };
  }

  getValidMoves(board: PokerBoard): PokerAction[] {
    const moves: PokerAction[] = [{ type: "fold" }, { type: "check" }, { type: "call" }];
    if (board.currentBet < this.MAX_BET) {
      const minRaise = Math.min(board.currentBet + 10, this.MAX_BET);
      moves.push({ type: "raise", amount: minRaise });
    }
    return moves;
  }

  isValidMove(board: PokerBoard, action: Record<string, unknown>): boolean {
    const type = action.type as string;
    if (!["fold", "check", "call", "raise"].includes(type)) return false;
    if (type === "raise") {
      const amount = action.amount as number;
      return amount > board.currentBet && amount <= this.MAX_BET;
    }
    return true;
  }

  applyMove(board: PokerBoard, action: Record<string, unknown>, player: PlayerId): PokerBoard {
    const a = action as unknown as PokerAction;
    const newBoard = JSON.parse(JSON.stringify(board));

    if (a.type === "fold") {
      const winner: PlayerId = player === "agent" ? "human" : "agent";
      newBoard.scores[winner] += 1;
      return newBoard;
    }

    if (a.type === "call" || a.type === "raise") {
      const amount = a.type === "raise" ? (a.amount || board.currentBet) : board.currentBet;
      newBoard.pot += amount;
    }

    if (a.type === "raise") {
      newBoard.currentBet = a.amount || board.currentBet;
    }

    newBoard.lastAction = { player, action: a };

    return newBoard;
  }

  advancePhase(board: PokerBoard): PokerBoard {
    const phases: PokerBoard["phase"][] = ["preflop", "flop", "turn", "river", "showdown"];
    const idx = phases.indexOf(board.phase);
    const newBoard = JSON.parse(JSON.stringify(board));

    if (idx < phases.length - 1) {
      newBoard.phase = phases[idx + 1];
      newBoard.currentBet = 0;
      newBoard.lastAction = undefined;

      if (newBoard.phase === "flop") {
        newBoard.communityCards = board.deck.slice(4, 7);
      } else if (newBoard.phase === "turn") {
        newBoard.communityCards = board.deck.slice(4, 8);
      } else if (newBoard.phase === "river") {
        newBoard.communityCards = board.deck.slice(4, 9);
      } else if (newBoard.phase === "showdown") {
        const agentRank = evaluateHand(board.agentHand, newBoard.communityCards);
        const humanRank = evaluateHand(board.humanHand, newBoard.communityCards);
        if (agentRank.rank > humanRank.rank) {
          newBoard.scores.agent += 1;
        } else if (humanRank.rank > agentRank.rank) {
          newBoard.scores.human += 1;
        }
        newBoard.round++;
      }
    }

    return newBoard;
  }

  checkWinner(board: PokerBoard): PlayerId | "draw" | null {
    if (board.scores.agent >= 5) return "agent";
    if (board.scores.human >= 5) return "human";
    return null;
  }

  generateAgentMove(
    board: PokerBoard,
    _opponentModel: unknown
  ): { action: Record<string, unknown>; reasoning: string; confidence: number } {
    const agentRank = evaluateHand(board.agentHand, board.communityCards);
    const handStrength = agentRank.rank / 9;

    if (handStrength > 0.7) {
      return {
        action: { type: "raise", amount: Math.min(board.currentBet + 20, this.MAX_BET) },
        reasoning: `Strong hand (${agentRank.name}), raising for value`,
        confidence: 0.8,
      };
    }

    if (handStrength > 0.4) {
      return {
        action: { type: "call" },
        reasoning: `Decent hand (${agentRank.name}), calling to see next card`,
        confidence: 0.6,
      };
    }

    if (board.currentBet > 20) {
      return {
        action: { type: "fold" },
        reasoning: `Weak hand (${agentRank.name}) facing high bet, folding`,
        confidence: 0.7,
      };
    }

    return {
      action: { type: "check" },
      reasoning: `Marginal hand (${agentRank.name}), checking to see free card`,
      confidence: 0.4,
    };
  }

  handToString(hand: Card[]): string {
    return hand.map((c) => `${c.rank}${c.suit}`).join(" ");
  }
}
