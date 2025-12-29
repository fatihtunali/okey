import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createGameSchema } from '@/lib/validations/game';
import { nanoid } from 'nanoid';

// GET /api/games - List available games
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'WAITING';
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const games = await prisma.game.findMany({
      where: {
        status: status as 'WAITING' | 'STARTING' | 'PLAYING' | 'FINISHED' | 'CANCELLED',
        isPrivate: false,
      },
      select: {
        id: true,
        status: true,
        maxPlayers: true,
        turnTimeLimit: true,
        createdAt: true,
        players: {
          select: {
            id: true,
            position: true,
            isAI: true,
            isReady: true,
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
      orderBy: { createdAt: 'desc' },
      take: Math.min(limit, 50),
    });

    // Transform to lobby format
    type PlayerWithUser = { position: number; isAI: boolean; user: { id: string; name: string | null; image: string | null; rating: number; vipUntil: Date | null } | null };
    const lobbyGames = games.map((game: { id: string; maxPlayers: number; players: PlayerWithUser[] }) => {
      const host = game.players.find((p: PlayerWithUser) => p.position === 0);
      const hostUser = host?.user;

      return {
        id: game.id,
        mode: 'regular', // TODO: Add mode to Game model
        maxPlayers: game.maxPlayers,
        currentPlayers: game.players.filter((p: PlayerWithUser) => !p.isAI).length,
        host: hostUser
          ? {
              id: hostUser.id,
              name: hostUser.name,
              image: hostUser.image,
              rating: hostUser.rating,
              isVip: hostUser.vipUntil ? new Date(hostUser.vipUntil) > new Date() : false,
            }
          : null,
      };
    });

    return NextResponse.json(lobbyGames);
  } catch (error) {
    console.error('List games error:', error);
    return NextResponse.json(
      { error: 'Bir hata oluştu' },
      { status: 500 }
    );
  }
}

// POST /api/games - Create a new game
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
    const parsed = createGameSchema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return NextResponse.json(
        { error: firstIssue?.message || 'Geçersiz veri' },
        { status: 400 }
      );
    }

    const { maxPlayers, isPrivate, turnTimeLimit, fillWithAI, stake } = parsed.data;

    // Check if user has enough chips for stake
    if (stake?.entryFee && stake.entryFee > 0) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { chips: true },
      });

      if (!user || user.chips < stake.entryFee) {
        return NextResponse.json(
          { error: 'Yeterli chip yok' },
          { status: 400 }
        );
      }
    }

    // Generate room code for private games
    const roomCode = isPrivate ? nanoid(6).toUpperCase() : null;

    // Create game with the creator as first player
    const game = await prisma.game.create({
      data: {
        status: fillWithAI ? 'STARTING' : 'WAITING',
        maxPlayers,
        isPrivate,
        roomCode,
        turnTimeLimit,
        currentTurn: 0,
        players: {
          create: {
            userId: session.user.id,
            position: 0,
            isAI: false,
            isReady: true,
          },
        },
      },
      include: {
        players: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
                rating: true,
              },
            },
          },
        },
      },
    });

    // If fillWithAI, add AI players and start the game
    if (fillWithAI) {
      const aiPlayersNeeded = maxPlayers - 1;
      const aiPlayers = [];

      for (let i = 1; i <= aiPlayersNeeded; i++) {
        aiPlayers.push({
          gameId: game.id,
          position: i,
          isAI: true,
          aiDifficulty: 'medium',
          isReady: true,
        });
      }

      await prisma.gamePlayer.createMany({
        data: aiPlayers,
      });

      // Update game status to PLAYING
      await prisma.game.update({
        where: { id: game.id },
        data: { status: 'PLAYING', startedAt: new Date() },
      });
    }

    // Deduct entry fee if applicable
    if (stake?.entryFee && stake.entryFee > 0) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { chips: { decrement: stake.entryFee } },
      });

      await prisma.transaction.create({
        data: {
          userId: session.user.id,
          type: 'CHIPS_GAME_LOSS',
          status: 'COMPLETED',
          amount: -stake.entryFee,
          description: `Oyun girişi: ${game.id}`,
        },
      });
    }

    // Fetch updated game
    const updatedGame = await prisma.game.findUnique({
      where: { id: game.id },
      include: {
        players: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
                rating: true,
              },
            },
          },
          orderBy: { position: 'asc' },
        },
      },
    });

    return NextResponse.json(updatedGame, { status: 201 });
  } catch (error) {
    console.error('Create game error:', error);
    return NextResponse.json(
      { error: 'Oyun oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
}
