import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { discardSchema } from '@/lib/validations/game';

interface Tile {
  id: string;
  number: number;
  color: string;
  tileType?: string;
}

// POST /api/games/[gameId]/discard - Discard a tile
export async function POST(
  request: Request,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { gameId } = await params;
    const body = await request.json();
    const parsed = discardSchema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return NextResponse.json(
        { error: firstIssue?.message || 'Geçersiz veri' },
        { status: 400 }
      );
    }

    const { tileId } = parsed.data;

    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: { players: true },
    });

    if (!game) {
      return NextResponse.json(
        { error: 'Oyun bulunamadı' },
        { status: 404 }
      );
    }

    if (game.status !== 'PLAYING') {
      return NextResponse.json(
        { error: 'Oyun aktif değil' },
        { status: 400 }
      );
    }

    // Find current player
    const currentPlayer = game.players.find((p) => p.position === game.currentTurn);
    if (!currentPlayer) {
      return NextResponse.json(
        { error: 'Oyuncu bulunamadı' },
        { status: 400 }
      );
    }

    // Check if it's user's turn
    if (currentPlayer.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Sıra sizde değil' },
        { status: 400 }
      );
    }

    const playerTiles = (currentPlayer.tiles as unknown as Tile[]) || [];
    const discardPile = (game.discardPile as unknown as Tile[]) || [];

    // Find the tile to discard
    const tileIndex = playerTiles.findIndex((t) => t.id === tileId);
    if (tileIndex === -1) {
      return NextResponse.json(
        { error: 'Taş elinizde bulunamadı' },
        { status: 400 }
      );
    }

    // Check if player has enough tiles to discard
    // After discard, player should have 14 tiles
    if (playerTiles.length < 15) {
      return NextResponse.json(
        { error: 'Önce taş çekmeniz gerekiyor' },
        { status: 400 }
      );
    }

    // Remove tile from hand and add to discard pile
    const [discardedTile] = playerTiles.splice(tileIndex, 1);
    discardPile.unshift(discardedTile); // Add to top of discard pile

    // Calculate next turn
    const nextTurn = (game.currentTurn + 1) % game.maxPlayers;

    // Update database
    await prisma.$transaction([
      prisma.game.update({
        where: { id: gameId },
        data: {
          discardPile: discardPile as object,
          currentTurn: nextTurn,
          turnStartedAt: new Date(),
        },
      }),
      prisma.gamePlayer.update({
        where: { id: currentPlayer.id },
        data: {
          tiles: playerTiles as object,
        },
      }),
      prisma.move.create({
        data: {
          gameId,
          playerId: currentPlayer.id,
          type: 'DISCARD',
          tile: discardedTile as object,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      discardedTile,
      nextTurn,
    });
  } catch (error) {
    console.error('Discard tile error:', error);
    return NextResponse.json(
      { error: 'Taş atılırken bir hata oluştu' },
      { status: 500 }
    );
  }
}
