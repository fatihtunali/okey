import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/games/[gameId] - Get game details
export async function GET(
  request: Request,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const session = await auth();
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
                vipUntil: true,
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

    // Transform players - hide tiles from other players
    type GamePlayerType = { id: string; position: number; isAI: boolean; isConnected: boolean; isReady: boolean; userId: string | null; tiles: unknown; user: { id: string; name: string | null; image: string | null; rating: number; vipUntil: Date | null } | null };
    const players = game.players.map((player: GamePlayerType) => {
      const isCurrentUser = session?.user?.id && player.userId === session.user.id;
      const tiles = player.tiles as unknown[] | null;

      return {
        id: player.id,
        position: player.position,
        name: player.isAI ? `Bot ${player.position}` : player.user?.name,
        avatar: player.user?.image,
        isAI: player.isAI,
        isConnected: player.isConnected,
        isReady: player.isReady,
        tileCount: tiles?.length || 0,
        tiles: isCurrentUser ? tiles : undefined, // Only show tiles to owner
        rating: player.user?.rating,
        isVip: player.user?.vipUntil ? new Date(player.user.vipUntil) > new Date() : false,
      };
    });

    // Build response
    const response = {
      id: game.id,
      status: game.status,
      mode: 'regular', // TODO: Add mode to schema
      maxPlayers: game.maxPlayers,
      isPrivate: game.isPrivate,
      roomCode: game.roomCode,
      players,
      currentTurn: game.currentTurn,
      turnPhase: game.currentTurn === 0 ? 'discard' : 'draw', // Dealer starts with discard
      indicatorTile: game.indicatorTile,
      okeyTile: game.okeyTile,
      discardPileTop: game.discardPile ? (game.discardPile as unknown[])?.[0] : null,
      tileBagCount: game.tileBag ? (game.tileBag as unknown[])?.length : 0,
      turnTimeLimit: game.turnTimeLimit,
      turnStartedAt: game.turnStartedAt,
      winnerId: game.winnerId,
      createdAt: game.createdAt,
      startedAt: game.startedAt,
      finishedAt: game.finishedAt,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Get game error:', error);
    return NextResponse.json(
      { error: 'Bir hata oluştu' },
      { status: 500 }
    );
  }
}
