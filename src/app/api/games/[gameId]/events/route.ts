import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/games/[gameId]/events - Get game event log
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;
    const { searchParams } = new URL(request.url);
    const after = searchParams.get('after');

    const game = await prisma.game.findUnique({
      where: { id: gameId },
      select: { id: true },
    });

    if (!game) {
      return NextResponse.json(
        { error: 'Oyun bulunamadı' },
        { status: 404 }
      );
    }

    // Build query
    const whereClause: {
      gameId: string;
      createdAt?: { gt: Date };
    } = { gameId };

    if (after) {
      // Find the event to get its timestamp
      const afterEvent = await prisma.move.findUnique({
        where: { id: after },
        select: { createdAt: true },
      });
      if (afterEvent) {
        whereClause.createdAt = { gt: afterEvent.createdAt };
      }
    }

    const moves = await prisma.move.findMany({
      where: whereClause,
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

    // Transform to GameEvent format
    type MoveType = { id: string; gameId: string; type: string; playerId: string; tile: unknown; createdAt: Date };
    const events = moves.map((move: MoveType) => ({
      id: move.id,
      gameId: move.gameId,
      type: move.type,
      actorPlayerId: move.playerId,
      payload: { tile: move.tile },
      createdAt: move.createdAt,
    }));

    return NextResponse.json(events);
  } catch (error) {
    console.error('Get game events error:', error);
    return NextResponse.json(
      { error: 'Bir hata oluştu' },
      { status: 500 }
    );
  }
}
