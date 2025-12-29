import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/games/[gameId]/ready - Mark yourself as ready
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

    if (game.status !== 'WAITING') {
      return NextResponse.json(
        { error: 'Oyun başlamış veya sona ermiş' },
        { status: 400 }
      );
    }

    // Find player
    const player = game.players.find((p) => p.userId === session.user.id);
    if (!player) {
      return NextResponse.json(
        { error: 'Bu oyunda değilsiniz' },
        { status: 400 }
      );
    }

    // Toggle ready status
    const newReadyStatus = !player.isReady;
    await prisma.gamePlayer.update({
      where: { id: player.id },
      data: { isReady: newReadyStatus },
    });

    // Check if all players are ready
    const updatedGame = await prisma.game.findUnique({
      where: { id: gameId },
      include: { players: true },
    });

    const humanPlayers = updatedGame?.players.filter((p) => !p.isAI) || [];
    const allReady = humanPlayers.every((p) =>
      p.id === player.id ? newReadyStatus : p.isReady
    );

    // If all players are ready and game is full, start the game
    if (allReady && humanPlayers.length === game.maxPlayers) {
      await prisma.game.update({
        where: { id: gameId },
        data: { status: 'STARTING' },
      });
    }

    return NextResponse.json({
      success: true,
      isReady: newReadyStatus,
      allReady,
    });
  } catch (error) {
    console.error('Ready game error:', error);
    return NextResponse.json(
      { error: 'Hazır durumu güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
