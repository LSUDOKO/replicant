import { NextRequest, NextResponse } from "next/server";
import { getGameEngine } from "@/lib/gamemaster/singleton";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;
    const body = await req.json();
    const { move, player } = body;

    if (!move || !player) {
      return NextResponse.json(
        { success: false, error: "move and player are required" },
        { status: 400 }
      );
    }

    const gameEngine = getGameEngine();
    const result = await gameEngine.makeMove(gameId, player, move);

    return NextResponse.json({
      success: true,
      gameState: result.gameState,
      agentMove: result.agentMove,
    });
  } catch (error) {
    console.error("Move error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to make move" 
      },
      { status: 500 }
    );
  }
}
