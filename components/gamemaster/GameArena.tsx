"use client";

import { useState, useEffect, useCallback } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { ActionButton } from "@/components/ui/action-button";
import {
  Gamepad2, Trophy, Swords, Brain, Zap, AlertTriangle, Loader2,
  ChevronRight, RotateCcw, Target, Shield, Sparkles,
} from "lucide-react";
import type { GameState, GameType, AgentGameStats, GameMove } from "@/lib/gamemaster";

const GAME_OPTIONS: { type: GameType; label: string; icon: string; desc: string }[] = [
  { type: "tic-tac-toe", label: "Tic Tac Toe", icon: "⊞", desc: "Perfect info · Quick match" },
  { type: "connect-four", label: "Connect Four", icon: "⬇", desc: "Strategy depth · Easy viz" },
  { type: "chess", label: "Chess", icon: "♚", desc: "Classic benchmark · ELO" },
  { type: "rock-paper-scissors", label: "RPS", icon: "✊", desc: "Pattern detection demo" },
  { type: "poker", label: "Poker", icon: "🃏", desc: "Bluff detection · Risk" },
  { type: "blockchain-game", label: "Blockchain", icon: "⛓", desc: "On-chain territory war" },
];

interface GameArenaProps {
  agentId: string;
}

// ─── Tic Tac Toe Board ───────────────────────────────────────────
function TicTacToeBoard({
  board, onMove, gameOver,
}: {
  board: (string | null)[][];
  onMove: (action: Record<string, unknown>) => void;
  gameOver: boolean;
}) {
  return (
    <div className="grid grid-cols-3 gap-1.5 mx-auto max-w-[260px]">
      {board.map((row, r) =>
        row.map((cell, c) => (
          <button
            key={`${r}-${c}`}
            onClick={() => !cell && !gameOver && onMove({ row: r, col: c })}
            disabled={!!cell || gameOver}
            className="aspect-square rounded-lg border border-border bg-surface/40 text-2xl font-bold
              hover:bg-accent/10 hover:border-accent/30 transition-all
              disabled:opacity-80 disabled:cursor-not-allowed
              flex items-center justify-center"
          >
            <span className={cell === "X" ? "text-accent" : cell === "O" ? "text-destructive" : ""}>
              {cell || ""}
            </span>
          </button>
        ))
      )}
    </div>
  );
}

// ─── Connect Four Board ────────────────────────────────────────────
function ConnectFourBoard({
  board, onMove, gameOver,
}: {
  board: (string | null)[][];
  onMove: (action: Record<string, unknown>) => void;
  gameOver: boolean;
}) {
  const [hoverCol, setHoverCol] = useState<number | null>(null);
  return (
    <div className="mx-auto max-w-[320px]">
      <div className="flex gap-1 mb-2 justify-center">
        {board[0].map((_, c) => (
          <button
            key={c}
            onClick={() => !gameOver && onMove({ column: c })}
            onMouseEnter={() => setHoverCol(c)}
            onMouseLeave={() => setHoverCol(null)}
            disabled={gameOver || board[0][c] !== null}
            className="w-9 h-9 rounded-t-lg border-x border-t border-border bg-surface/20
              hover:bg-accent/20 hover:border-accent/50 transition-all
              disabled:opacity-30 disabled:cursor-not-allowed
              flex items-center justify-center text-[10px] text-muted-foreground"
          >
            {hoverCol === c ? "▼" : c + 1}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 p-2 rounded-xl bg-surface/30 border border-border">
        {board.map((row, r) =>
          row.map((cell, c) => (
            <div
              key={`${r}-${c}`}
              className={`aspect-square rounded-full border ${
                cell === "agent" ? "bg-accent border-accent/50 shadow-[0_0_8px_rgba(168,85,247,0.4)]" :
                cell === "human" ? "bg-destructive border-destructive/50 shadow-[0_0_8px_rgba(239,68,68,0.4)]" :
                "bg-surface/60 border-border/30"
              }`}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ─── Chess Board ────────────────────────────────────────────────────
function ChessBoard({
  fen, onMove, gameOver, isCheck,
}: {
  fen: string;
  onMove: (action: Record<string, unknown>) => void;
  gameOver: boolean;
  isCheck: boolean;
}) {
  const [selected, setSelected] = useState<string | null>(null);

  const PIECES: Record<string, string> = {
    K: "♔", Q: "♕", R: "♖", B: "♗", N: "♘", P: "♙",
    k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟",
  };

  const rows = fen.split(" ")[0];
  const squares: { piece: string; color: "w" | "b" }[][] = [];
  for (const row of rows.split("/")) {
    const sqRow: { piece: string; color: "w" | "b" }[] = [];
    for (const ch of row) {
      if (/[1-8]/.test(ch)) {
        for (let i = 0; i < parseInt(ch); i++) sqRow.push({ piece: "", color: "w" });
      } else {
        sqRow.push({ piece: ch, color: ch === ch.toUpperCase() ? "w" : "b" });
      }
    }
    squares.push(sqRow);
  }

  const files = "abcdefgh";
  const rankToRow = (rank: number) => 8 - rank;
  const fileToCol = (file: string) => files.indexOf(file);

  function handleSquareClick(row: number, col: number) {
    if (gameOver) return;
    const piece = squares[row]?.[col]?.piece || "";

    if (!selected && piece && piece === piece.toUpperCase()) {
      setSelected(`${files[col]}${8 - row}`);
      return;
    }
    if (selected) {
      onMove({ from: selected, to: `${files[col]}${8 - row}` });
      setSelected(null);
    }
  }

  return (
    <div className="mx-auto max-w-[300px]">
      {isCheck && (
        <div className="flex items-center gap-1.5 mb-2 px-3 py-1.5 rounded-lg bg-destructive/10 border border-destructive/30 text-xs text-destructive">
          <AlertTriangle size={12} />
          Check!
        </div>
      )}
      <div className="grid grid-cols-8 gap-0 border border-border rounded-lg overflow-hidden">
        {squares.map((row, r) =>
          row.map((sq, c) => {
            const isSelected = selected === `${files[c]}${8 - r}`;
            const isLight = (r + c) % 2 === 0;
            return (
              <button
                key={`${r}-${c}`}
                onClick={() => handleSquareClick(r, c)}
                className={`aspect-square flex items-center justify-center text-sm sm:text-base
                  ${isLight ? "bg-surface/60" : "bg-surface/20"}
                  ${isSelected ? "ring-2 ring-accent ring-inset" : ""}
                  hover:ring-1 hover:ring-accent/50 hover:ring-inset transition-all`}
              >
                <span className={sq.color === "w" ? "text-foreground" : "text-foreground/40"}>
                  {PIECES[sq.piece] || ""}
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

// ─── Rock Paper Scissors ───────────────────────────────────────────
function RPSBoard({
  onMove, board, gameOver,
}: {
  onMove: (action: Record<string, unknown>) => void;
  board: any;
  gameOver: boolean;
}) {
  const choices = [
    { choice: "rock", emoji: "✊", label: "Rock" },
    { choice: "paper", emoji: "✋", label: "Paper" },
    { choice: "scissors", emoji: "✌️", label: "Scissors" },
  ];
  return (
    <div className="space-y-4">
      <div className="flex justify-center gap-3">
        {choices.map((c) => (
          <button
            key={c.choice}
            onClick={() => !gameOver && onMove({ choice: c.choice })}
            disabled={gameOver}
            className="flex flex-col items-center gap-1 p-4 rounded-xl border border-border bg-surface/40
              hover:border-accent/50 hover:bg-accent/10 transition-all disabled:opacity-40"
          >
            <span className="text-3xl">{c.emoji}</span>
            <span className="text-[10px] text-muted-foreground">{c.label}</span>
          </button>
        ))}
      </div>
      <div className="flex justify-center gap-6 text-sm">
        <div className="text-center">
          <p className="text-muted-foreground text-xs">Agent</p>
          <p className="text-lg font-bold text-accent">{board?.scores?.agent || 0}</p>
        </div>
        <div className="text-center">
          <p className="text-muted-foreground text-xs">You</p>
          <p className="text-lg font-bold text-destructive">{board?.scores?.human || 0}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Poker Table ────────────────────────────────────────────────────
function PokerTable({
  board, onMove, gameOver,
}: {
  board: any;
  onMove: (action: Record<string, unknown>) => void;
  gameOver: boolean;
}) {
  const ranks = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
  const suits: Record<string, string> = { h: "♥", d: "♦", c: "♣", s: "♠" };
  const suitColors: Record<string, string> = { h: "text-destructive", d: "text-destructive", c: "text-foreground", s: "text-foreground" };

  function renderCard(card: { suit: string; rank: string }) {
    return (
      <div className="inline-flex items-center gap-0.5 px-2 py-1 rounded border border-border bg-surface/60 text-xs font-mono">
        <span className={suitColors[card.suit]}>{card.rank}{suits[card.suit]}</span>
      </div>
    );
  }

  return (
    <div className="space-y-3 text-center">
      <div className="space-y-1">
        <p className="text-[10px] text-muted-foreground uppercase">Your Hand</p>
        <div className="flex justify-center gap-2">
          {board?.humanHand?.map((c: any, i: number) => <span key={i}>{renderCard(c)}</span>)}
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-[10px] text-muted-foreground uppercase">Community Cards</p>
        <div className="flex justify-center gap-2">
          {board?.communityCards?.length > 0
            ? board.communityCards.map((c: any, i: number) => <span key={i}>{renderCard(c)}</span>)
            : <span className="text-xs text-muted-foreground/50">—</span>}
        </div>
      </div>

      <div className="flex justify-center gap-2 text-xs">
        <span className="text-muted-foreground">Pot: <span className="text-accent font-bold">{board?.pot || 0}</span></span>
        <span className="text-muted-foreground">Phase: <span className="font-medium capitalize">{board?.phase || "preflop"}</span></span>
      </div>

      <div className="flex justify-center gap-2">
        <ActionButton type="button" variant="outline" size="sm" onClick={() => onMove({ type: "check" })} disabled={gameOver}>
          Check
        </ActionButton>
        <ActionButton type="button" variant="outline" size="sm" onClick={() => onMove({ type: "call" })} disabled={gameOver}>
          Call ({board?.currentBet || 0})
        </ActionButton>
        <ActionButton type="button" variant="outline" size="sm" onClick={() => onMove({ type: "raise", amount: Math.min((board?.currentBet || 0) + 10, 100) })} disabled={gameOver}>
          Raise
        </ActionButton>
        <ActionButton type="button" variant="outline" size="sm" onClick={() => onMove({ type: "fold" })} disabled={gameOver}>
          Fold
        </ActionButton>
      </div>

      <div className="flex justify-center gap-4 text-xs">
        <span>Agent: <span className="text-accent font-bold">{board?.scores?.agent || 0}</span></span>
        <span>You: <span className="text-destructive font-bold">{board?.scores?.human || 0}</span></span>
      </div>
    </div>
  );
}

// ─── Blockchain Game Board ──────────────────────────────────────────
function BlockchainBoard({
  board, onMove, gameOver,
}: {
  board: any;
  onMove: (action: Record<string, unknown>) => void;
  gameOver: boolean;
}) {
  const grid = board?.grid || [];

  function tileColor(tile: any): string {
    if (tile.owner === "agent") return "bg-accent/20 border-accent/50";
    if (tile.owner === "human") return "bg-destructive/20 border-destructive/50";
    return "bg-surface/40 border-border/30";
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-center gap-4 text-xs">
        <span className="flex items-center gap-1"><Shield size={10} className="text-accent" /> Agent: {board?.agentResources || 0}</span>
        <span className="flex items-center gap-1"><Shield size={10} className="text-destructive" /> You: {board?.humanResources || 0}</span>
        <span>Round: {board?.round || 0}</span>
      </div>
      <div className="grid grid-cols-5 gap-1 mx-auto max-w-[260px]">
        {grid.map((row: any[], r: number) =>
          row.map((tile: any, c: number) => (
            <button
              key={`${r}-${c}`}
              onClick={() => {
                if (gameOver) return;
                const neighbors = [[-1,0],[1,0],[0,-1],[0,1]];
                for (const [dr, dc] of neighbors) {
                  const nr = r + dr, nc = c + dc;
                  if (nr >= 0 && nr < 5 && nc >= 0 && nc < 5 && grid[nr]?.[nc]?.owner === "agent") {
                    onMove({ type: "attack", fromRow: nr, fromCol: nc, toRow: r, toCol: c });
                    return;
                  }
                }
                if (tile.owner === "agent") {
                  onMove({ type: "reinforce", row: r, col: c });
                }
              }}
              className={`aspect-square rounded-lg border text-[10px] flex flex-col items-center justify-center
                ${tileColor(tile)}
                hover:brightness-125 transition-all disabled:opacity-40`}
            >
              <span className="font-bold">{tile.owner === "agent" ? "A" : tile.owner === "human" ? "H" : ""}</span>
              <span className="text-[8px] opacity-60">D:{tile.defense} R:{tile.resources}</span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

// ─── Main GameArena Component ──────────────────────────────────────
export function GameArena({ agentId }: GameArenaProps) {
  const [game, setGame] = useState<GameState | null>(null);
  const [selectedGame, setSelectedGame] = useState<GameType>("connect-four");
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<AgentGameStats | null>(null);
  const [evolutionMsg, setEvolutionMsg] = useState<string | null>(null);

  const numericAgentId = parseInt(agentId) || 1;

  useEffect(() => {
    fetch(`/api/agents/game-stats?agentId=${numericAgentId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setStats(d.stats);
          if (d.evolution?.shouldEvolve) {
            setEvolutionMsg(d.evolution.reason);
          }
        }
      })
      .catch(() => {});
  }, [numericAgentId]);

  const startGame = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameType: selectedGame, agentId: numericAgentId }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to create game");
      setGame(data.game);
      setIsPlaying(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start game");
    } finally {
      setLoading(false);
    }
  }, [selectedGame, numericAgentId]);

  const makeMove = useCallback(
    async (action: Record<string, unknown>) => {
      if (!game || game.status !== "active") return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/games/${game.gameId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ move: action, player: "human" }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || "Invalid move");
        setGame(data.gameState);
        if (data.gameState.status === "completed") {
          await refreshStats();
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Move failed");
      } finally {
        setLoading(false);
      }
    },
    [game]
  );

  const refreshStats = useCallback(async () => {
    try {
      const res = await fetch(`/api/agents/game-stats?agentId=${numericAgentId}`);
      const data = await res.json();
      if (data.success) setStats(data.stats);
    } catch {}
  }, [numericAgentId]);

  const resetGame = useCallback(() => {
    setGame(null);
    setIsPlaying(false);
    setError(null);
  }, []);

  const winner = game?.winner;
  const isCheck = false;

  function renderBoard() {
    if (!game) return null;
    const board = game.board as any;
    const gameOver = game.status === "completed";

    switch (game.gameType) {
      case "tic-tac-toe":
        return <TicTacToeBoard board={board} onMove={makeMove} gameOver={gameOver} />;
      case "connect-four":
        return <ConnectFourBoard board={board} onMove={makeMove} gameOver={gameOver} />;
      case "chess":
        return <ChessBoard fen={board?.fen || ""} onMove={makeMove} gameOver={gameOver} isCheck={isCheck} />;
      case "rock-paper-scissors":
        return <RPSBoard board={board} onMove={makeMove} gameOver={gameOver} />;
      case "poker":
        return <PokerTable board={board} onMove={makeMove} gameOver={gameOver} />;
      case "blockchain-game":
        return <BlockchainBoard board={board} onMove={makeMove} gameOver={gameOver} />;
      default:
        return <p className="text-center text-muted-foreground text-sm">Unknown game type</p>;
    }
  }

  return (
    <div className="space-y-4">
      <GlassCard className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border-bright bg-surface">
              <Gamepad2 size={20} className="text-accent" />
            </div>
            <div>
              <h2 className="text-base font-medium">GameMaster Arena</h2>
              <p className="text-xs text-muted-foreground">Evolving strategy AI — play to test its adaptation</p>
            </div>
          </div>
          {stats && (
            <div className="flex items-center gap-2 text-xs">
              <Trophy size={14} className="text-destructive" />
              <span className="text-destructive font-bold">{(stats.winRate * 100).toFixed(0)}% WR</span>
              <Sparkles size={14} className="text-accent" />
              <span className="text-accent font-bold">Gen-{stats.evolutionGeneration}</span>
            </div>
          )}
        </div>

        {evolutionMsg && (
          <div className="mt-3 flex items-start gap-2 rounded-xl border border-accent/30 bg-accent/10 p-3">
            <Brain size={14} className="mt-0.5 shrink-0 text-accent" />
            <p className="text-xs text-accent">{evolutionMsg}</p>
          </div>
        )}
      </GlassCard>

      {stats && (
        <GlassCard className="p-4">
          <div className="grid grid-cols-5 gap-2 text-center">
            {[
              { label: "Played", value: stats.gamesPlayed, color: "text-foreground" },
              { label: "Won", value: stats.gamesWon, color: "text-accent" },
              { label: "Lost", value: stats.gamesLost, color: "text-destructive" },
              { label: "Streak", value: stats.currentWinStreak, color: "text-amber" },
              { label: "Best", value: stats.bestWinStreak, color: "text-destructive" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-border bg-surface/50 p-2">
                <p className="text-lg font-bold tracking-tight ${s.color}">{s.value}</p>
                <p className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {!isPlaying ? (
        <GlassCard className="p-6">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Select Game</p>
          <div className="grid grid-cols-3 gap-2">
            {GAME_OPTIONS.map((opt) => (
              <button
                key={opt.type}
                onClick={() => setSelectedGame(opt.type)}
                className={`p-3 rounded-xl border transition-all ${
                  selectedGame === opt.type
                    ? "border-accent bg-accent/10 text-foreground"
                    : "border-border bg-surface/30 text-muted-foreground hover:bg-surface/50"
                }`}
              >
                <span className="block text-xl mb-1">{opt.icon}</span>
                <p className="text-xs font-medium">{opt.label}</p>
                <p className="text-[9px] text-muted-foreground/60 mt-0.5">{opt.desc}</p>
              </button>
            ))}
          </div>
          <ActionButton
            type="button"
            onClick={startGame}
            disabled={loading}
            className="w-full mt-4"
          >
            {loading ? <><Loader2 size={14} className="mr-1 animate-spin" /> Creating game...</> : <><Swords size={14} className="mr-1" /> Challenge GameMaster</>}
          </ActionButton>
          {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
        </GlassCard>
      ) : game ? (
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium uppercase ${
                game.status === "active"
                  ? "bg-accent/20 text-accent"
                  : winner === "agent"
                    ? "bg-destructive/20 text-destructive"
                    : winner === "draw"
                      ? "bg-amber/20 text-amber"
                      : "bg-violet-500/20 text-violet-400"
              }`}>
                {game.status === "active" ? "In Progress" : winner === "agent" ? "Agent Wins" : winner === "draw" ? "Draw" : "You Win"}
              </span>
              <span className="text-xs text-muted-foreground">
                Turn: {game.currentPlayer === "agent" ? "GameMaster" : "You"}
              </span>
            </div>
            <ActionButton type="button" variant="outline" size="sm" onClick={resetGame}>
              <RotateCcw size={12} className="mr-1" /> New
            </ActionButton>
          </div>

          {renderBoard()}

          {game.moveHistory.length > 0 && game.moveHistory[game.moveHistory.length - 1]?.player === "agent" && (
            <div className="mt-3 p-3 rounded-xl border border-accent/30 bg-gradient-to-r from-accent/10 to-transparent">
              <div className="flex items-center gap-1.5 mb-1">
                <Brain size={13} className="text-accent" />
                <span className="text-xs font-medium text-accent">GameMaster's Strategy</span>
              </div>
              <p className="text-sm">{game.reasoning || game.moveHistory[game.moveHistory.length - 1]?.reasoning || "Analyzing position..."}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] rounded-full border border-destructive/30 text-destructive px-2 py-0.5">
                  {game.strategy || game.moveHistory[game.moveHistory.length - 1]?.strategy || "adaptive"}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Confidence: {((game.confidence || game.moveHistory[game.moveHistory.length - 1]?.confidence || 0) * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          )}

          {game.moveHistory.length > 0 && (
            <div className="mt-3 max-h-[120px] overflow-y-auto space-y-1">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Move History</p>
              {game.moveHistory.slice(-6).map((move: GameMove, i: number) => (
                <div key={i} className="flex items-center justify-between p-1.5 rounded-lg bg-surface/20">
                  <div className="flex items-center gap-1.5">
                    <Zap size={10} className={move.player === "agent" ? "text-accent" : "text-destructive"} />
                    <span className="text-xs">{move.player === "agent" ? "GameMaster" : "You"}</span>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {JSON.stringify(move.action).slice(0, 28)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
        </GlassCard>
      ) : null}
    </div>
  );
}
