import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { drawSchema } from '@/lib/validations/game';

// POST /api/games/[gameId]/draw - Draw a tile
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
    const parsed = drawSchema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return NextResponse.json(
        { error: firstIssue?.message || 'Geçersiz veri' },
        { status: 400 }
      );
    }

    const { source } = parsed.data;

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
    type GamePlayerType = { position: number; userId: string | null; tiles: unknown };
    const currentPlayer = game.players.find((p: GamePlayerType) => p.position === game.currentTurn);
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

    // Get game state
    const tileBag = (game.tileBag as unknown[]) || [];
    const discardPile = (game.discardPile as unknown[]) || [];
    const playerTiles = (currentPlayer.tiles as unknown[]) || [];

    // Check if already drew (has 15 tiles for dealer, 15 for others after draw)
    // Dealer starts with 15, others with 14. After draw, should have 15.
    if (playerTiles.length >= 15) {
      return NextResponse.json(
        { error: 'Zaten taş çektiniz, atmanız gerekiyor' },
        { status: 400 }
      );
    }

    let drawnTile;

    if (source === 'pile') {
      if (tileBag.length === 0) {
        return NextResponse.json(
          { error: 'Taş destesi boş' },
          { status: 400 }
        );
      }
      drawnTile = tileBag.pop();
    } else {
      if (discardPile.length === 0) {
        return NextResponse.json(
          { error: 'Atık destesi boş' },
          { status: 400 }
        );
      }
      drawnTile = discardPile.shift(); // Take from top (most recent discard)
    }

    // Add tile to player's hand
    playerTiles.push(drawnTile);

    // Update database
    await prisma.$transaction([
      prisma.game.update({
        where: { id: gameId },
        data: {
          tileBag: tileBag as object,
          discardPile: discardPile as object,
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
          type: source === 'pile' ? 'DRAW_PILE' : 'DRAW_DISCARD',
          tile: drawnTile as object,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      tile: drawnTile,
      tileBagCount: tileBag.length,
    });
  } catch (error) {
    console.error('Draw tile error:', error);
    return NextResponse.json(
      { error: 'Taş çekilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
