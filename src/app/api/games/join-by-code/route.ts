import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { joinByCodeSchema } from '@/lib/validations/game';

// POST /api/games/join-by-code - Join a private game by room code
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = joinByCodeSchema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return NextResponse.json(
        { error: firstIssue?.message || 'Geçersiz veri' },
        { status: 400 }
      );
    }

    const { roomCode } = parsed.data;

    const game = await prisma.game.findUnique({
      where: { roomCode: roomCode.toUpperCase() },
      include: {
        players: true,
      },
    });

    if (!game) {
      return NextResponse.json(
        { error: 'Geçersiz oda kodu' },
        { status: 404 }
      );
    }

    if (game.status !== 'WAITING') {
      return NextResponse.json(
        { error: 'Oyun zaten başlamış' },
        { status: 400 }
      );
    }

    // Check if already in game
    const existingPlayer = game.players.find(
      (p) => p.userId === session.user.id
    );
    if (existingPlayer) {
      return NextResponse.json({
        success: true,
        gameId: game.id,
        message: 'Zaten bu oyundasınız',
      });
    }

    // Check if game is full
    const humanPlayers = game.players.filter((p) => !p.isAI);
    if (humanPlayers.length >= game.maxPlayers) {
      return NextResponse.json(
        { error: 'Oyun dolu' },
        { status: 400 }
      );
    }

    // Find next available position
    const takenPositions = new Set(game.players.map((p) => p.position));
    let nextPosition = 0;
    while (takenPositions.has(nextPosition)) {
      nextPosition++;
    }

    // Add player to game
    await prisma.gamePlayer.create({
      data: {
        gameId: game.id,
        userId: session.user.id,
        position: nextPosition,
        isAI: false,
        isReady: false,
      },
    });

    return NextResponse.json({
      success: true,
      gameId: game.id,
      position: nextPosition,
    });
  } catch (error) {
    console.error('Join by code error:', error);
    return NextResponse.json(
      { error: 'Oyuna katılırken bir hata oluştu' },
      { status: 500 }
    );
  }
}
