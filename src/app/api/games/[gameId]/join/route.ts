import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/games/[gameId]/join - Join an existing game
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
        { error: 'Oyun zaten başlamış' },
        { status: 400 }
      );
    }

    // Check if already in game
    type GamePlayerType = { userId: string | null; isAI: boolean; position: number };
    const existingPlayer = game.players.find(
      (p: GamePlayerType) => p.userId === session.user.id
    );
    if (existingPlayer) {
      return NextResponse.json(
        { error: 'Zaten bu oyundasınız' },
        { status: 400 }
      );
    }

    // Check if game is full
    const humanPlayers = game.players.filter((p: GamePlayerType) => !p.isAI);
    if (humanPlayers.length >= game.maxPlayers) {
      return NextResponse.json(
        { error: 'Oyun dolu' },
        { status: 400 }
      );
    }

    // Find next available position
    const takenPositions = new Set(game.players.map((p: GamePlayerType) => p.position));
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

    return NextResponse.json({ success: true, position: nextPosition });
  } catch (error) {
    console.error('Join game error:', error);
    return NextResponse.json(
      { error: 'Oyuna katılırken bir hata oluştu' },
      { status: 500 }
    );
  }
}
