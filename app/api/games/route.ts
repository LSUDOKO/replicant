import { NextRequest, NextResponse } from "next/server";
import { getGameEngine } from "@/lib/gamemaster/singleton";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { gameType, agentId } = body;

    if (!gameType) {
      return NextResponse.json(
        { success: false, error: "gameType is required" },
        { status: 400 }
      );
    }

    const gameEngine = getGameEngine();
    const game = await gameEngine.createGame({
      gameType,
      agentId: agentId || 1,
      humanPlayer: "player-1",
    });

    return NextResponse.json({
      success: true,
      game,
    });
  } catch (error) {
    console.error("Game creation error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to create game" 
      },
      { status: 500 }
    );
  }
}
