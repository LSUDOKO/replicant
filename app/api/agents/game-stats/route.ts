import { NextRequest, NextResponse } from "next/server";
import { getGameEngine } from "@/lib/gamemaster/singleton";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const agentId = parseInt(searchParams.get("agentId") || "1");

    const gameEngine = getGameEngine();
    const stats = gameEngine.getStats(agentId);
    
    // Check if agent should evolve (win rate < 40% after 10+ games)
    const shouldEvolve = stats.gamesPlayed >= 10 && stats.winRate < 0.4;
    const evolution = shouldEvolve
      ? {
          shouldEvolve: true,
          reason: `Win rate ${(stats.winRate * 100).toFixed(0)}% below threshold. Evolution recommended to improve strategy.`,
        }
      : null;

    return NextResponse.json({
      success: true,
      stats,
      evolution,
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to get stats" 
      },
      { status: 500 }
    );
  }
}
