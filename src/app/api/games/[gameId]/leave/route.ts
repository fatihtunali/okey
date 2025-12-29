import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/games/[gameId]/leave - Leave a game (before it starts)
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

    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: {
        players: true,
      },
    });

    if (!game) {
      return NextResponse.json(
        { error: 'Oyun bulunamadı' },
        { status: 404 }
      );
    }

    // Find player
    type GamePlayerType = { id: string; userId: string | null; position: number; isAI: boolean };
    const player = game.players.find((p: GamePlayerType) => p.userId === session.user.id);
    if (!player) {
      return NextResponse.json(
        { error: 'Bu oyunda değilsiniz' },
        { status: 400 }
      );
    }

    // Can't leave if game has started
    if (game.status === 'PLAYING') {
      return NextResponse.json(
        { error: 'Oyun başladıktan sonra ayrılamazsınız' },
        { status: 400 }
      );
    }

    // Remove player from game
    await prisma.gamePlayer.delete({
      where: { id: player.id },
    });

    // If host left, cancel the game or transfer ownership
    const isHost = player.position === 0;
    const remainingPlayers = game.players.filter(
      (p: GamePlayerType) => p.id !== player.id && !p.isAI
    );

    if (isHost && remainingPlayers.length === 0) {
      // Cancel the game if host leaves and no other players
      await prisma.game.update({
        where: { id: gameId },
        data: { status: 'CANCELLED' },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Leave game error:', error);
    return NextResponse.json(
      { error: 'Oyundan ayrılırken bir hata oluştu' },
      { status: 500 }
    );
  }
}
