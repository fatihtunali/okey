import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { validateHandSchema } from '@/lib/validations/game';
import { validateWinningHand } from '@/lib/game/validation';
import { Tile } from '@/lib/game/types';

// POST /api/games/[gameId]/validate-hand - Validate hand without finishing
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
    const parsed = validateHandSchema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return NextResponse.json(
        { error: firstIssue?.message || 'Geçersiz veri' },
        { status: 400 }
      );
    }

    const { discardTileId } = parsed.data;

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

    // Find player
    type GamePlayerType = { userId: string | null; tiles: unknown };
    const player = game.players.find((p: GamePlayerType) => p.userId === session.user.id);
    if (!player) {
      return NextResponse.json(
        { error: 'Bu oyunda değilsiniz' },
        { status: 400 }
      );
    }

    const playerTiles = (player.tiles as unknown as Tile[]) || [];

    // Get okey tile
    const okeyTile = game.okeyTile as unknown as Tile;
    if (!okeyTile) {
      return NextResponse.json(
        { error: 'Oyun durumu geçersiz' },
        { status: 400 }
      );
    }

    // Find discard tile if specified
    let discardTile: Tile | undefined;
    if (discardTileId) {
      discardTile = playerTiles.find((t: Tile) => t.id === discardTileId);
    }

    // Validate the hand
    const validation = validateWinningHand(playerTiles, okeyTile, discardTile);

    return NextResponse.json({
      isValid: validation.isValid,
      groups: validation.groups,
      remainingTiles: validation.remainingTiles,
      errorMessage: validation.errorMessage || null,
    });
  } catch (error) {
    console.error('Validate hand error:', error);
    return NextResponse.json(
      { error: 'El doğrulanırken bir hata oluştu' },
      { status: 500 }
    );
  }
}
