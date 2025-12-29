import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/games/[gameId]/replay - Get replay data
export async function GET(
  request: Request,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;

    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: {
        players: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
                rating: true,
              },
            },
          },
          orderBy: { position: 'asc' },
        },
      },
    });

    if (!game) {
      return NextResponse.json(
        { error: 'Oyun bulunamadı' },
        { status: 404 }
      );
    }

    if (game.status !== 'FINISHED') {
      return NextResponse.json(
        { error: 'Oyun henüz bitmedi' },
        { status: 400 }
      );
    }

    // Get all moves
    const moves = await prisma.move.findMany({
      where: { gameId },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        gameId: true,
        type: true,
        playerId: true,
        tile: true,
        createdAt: true,
      },
    });

    // Transform moves to events
    type MoveType = { id: string; gameId: string; type: string; playerId: string; tile: unknown; createdAt: Date };
    const events = moves.map((move: MoveType) => ({
      id: move.id,
      gameId: move.gameId,
      type: move.type,
      actorPlayerId: move.playerId,
      payload: { tile: move.tile },
      createdAt: move.createdAt,
    }));

    // Build game response
    type PlayerType = { id: string; position: number; isAI: boolean; user: { id: string; name: string | null; image: string | null; rating: number } | null; score: number; isWinner: boolean; finishOrder: number | null };
    const players = game.players.map((player: PlayerType) => ({
      id: player.id,
      position: player.position,
      name: player.isAI ? `Bot ${player.position}` : player.user?.name,
      avatar: player.user?.image,
      isAI: player.isAI,
      score: player.score,
      isWinner: player.isWinner,
      finishOrder: player.finishOrder,
    }));

    const gameResponse = {
      id: game.id,
      status: game.status,
      maxPlayers: game.maxPlayers,
      players,
      indicatorTile: game.indicatorTile,
      okeyTile: game.okeyTile,
      turnTimeLimit: game.turnTimeLimit,
      winnerId: game.winnerId,
      createdAt: game.createdAt,
      startedAt: game.startedAt,
      finishedAt: game.finishedAt,
    };

    // Initial state would include the initial tile distribution
    // For now, we'll reconstruct from first moves
    const initialState = {
      indicatorTile: game.indicatorTile,
      okeyTile: game.okeyTile,
      // Initial hands would need to be stored separately
      // For now this is a placeholder
    };

    return NextResponse.json({
      game: gameResponse,
      initialState,
      events,
    });
  } catch (error) {
    console.error('Get replay error:', error);
    return NextResponse.json(
      { error: 'Bir hata oluştu' },
      { status: 500 }
    );
  }
}
