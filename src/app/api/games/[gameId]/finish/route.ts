import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { finishSchema } from '@/lib/validations/game';
import { validateWinningHand } from '@/lib/game/validation';
import { Tile } from '@/lib/game/types';

// POST /api/games/[gameId]/finish - Declare win
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
    const parsed = finishSchema.safeParse(body);

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
      include: { players: { include: { user: true } } },
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
    type GamePlayerType = { id: string; position: number; userId: string | null; tiles: unknown };
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

    const playerTiles = (currentPlayer.tiles as unknown as Tile[]) || [];

    // Find the discard tile
    const discardTile = playerTiles.find((t: Tile) => t.id === discardTileId);
    if (!discardTile) {
      return NextResponse.json(
        { error: 'Atacak taş elinizde bulunamadı' },
        { status: 400 }
      );
    }

    // Get okey tile for validation
    const okeyTile = game.okeyTile as unknown as Tile;
    if (!okeyTile) {
      return NextResponse.json(
        { error: 'Oyun durumu geçersiz' },
        { status: 400 }
      );
    }

    // Validate the hand
    const validation = validateWinningHand(playerTiles, okeyTile, discardTile);

    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.errorMessage || 'Geçersiz el - kazanma koşullarını sağlamıyor' },
        { status: 400 }
      );
    }

    const tileIndex = playerTiles.findIndex((t: Tile) => t.id === discardTileId);

    // Calculate scores
    const scores = game.players.map((player: GamePlayerType) => {
      const tiles = (player.tiles as unknown as Tile[]) || [];
      let score = 0;

      // Simple scoring: sum of tile values for losers
      if (player.id !== currentPlayer.id) {
        for (const tile of tiles) {
          score += tile.number;
        }
      }

      return {
        playerId: player.id,
        score: player.id === currentPlayer.id ? 0 : -score,
        isWinner: player.id === currentPlayer.id,
      };
    });

    // Update game and players
    await prisma.$transaction([
      prisma.game.update({
        where: { id: gameId },
        data: {
          status: 'FINISHED',
          winnerId: currentPlayer.userId || currentPlayer.id,
          finishedAt: new Date(),
        },
      }),
      prisma.gamePlayer.update({
        where: { id: currentPlayer.id },
        data: {
          isWinner: true,
          score: 0,
          finishOrder: 1,
        },
      }),
      prisma.move.create({
        data: {
          gameId,
          playerId: currentPlayer.id,
          type: 'FINISH',
          tile: playerTiles[tileIndex] as object,
        },
      }),
      // Update winner's stats
      ...(currentPlayer.userId
        ? [
            prisma.userStats.upsert({
              where: { userId: currentPlayer.userId },
              create: {
                userId: currentPlayer.userId,
                gamesPlayed: 1,
                gamesWon: 1,
                winStreak: 1,
                bestWinStreak: 1,
              },
              update: {
                gamesPlayed: { increment: 1 },
                gamesWon: { increment: 1 },
                winStreak: { increment: 1 },
                bestWinStreak: {
                  increment: 0, // Will be handled separately
                },
              },
            }),
          ]
        : []),
    ]);

    // Update bestWinStreak if needed
    if (currentPlayer.userId) {
      const stats = await prisma.userStats.findUnique({
        where: { userId: currentPlayer.userId },
      });
      if (stats && stats.winStreak > stats.bestWinStreak) {
        await prisma.userStats.update({
          where: { userId: currentPlayer.userId },
          data: { bestWinStreak: stats.winStreak },
        });
      }
    }

    // Update loser stats
    for (const player of game.players) {
      if (player.id !== currentPlayer.id && player.userId) {
        await prisma.userStats.upsert({
          where: { userId: player.userId },
          create: {
            userId: player.userId,
            gamesPlayed: 1,
            gamesLost: 1,
            winStreak: 0,
          },
          update: {
            gamesPlayed: { increment: 1 },
            gamesLost: { increment: 1 },
            winStreak: 0, // Reset win streak
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      winner: currentPlayer.userId || currentPlayer.id,
      scores,
    });
  } catch (error) {
    console.error('Finish game error:', error);
    return NextResponse.json(
      { error: 'Oyun bitirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
