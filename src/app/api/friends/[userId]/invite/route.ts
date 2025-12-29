import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const inviteSchema = z.object({
  gameId: z.string().min(1, 'Oyun ID gerekli'),
});

// POST /api/friends/[userId]/invite - Invite friend to game
export async function POST(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { userId } = await params;
    const body = await request.json();
    const parsed = inviteSchema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return NextResponse.json(
        { error: firstIssue?.message || 'Geçersiz veri' },
        { status: 400 }
      );
    }

    const { gameId } = parsed.data;

    // Check if they are friends
    const friendship = await prisma.friendship.findFirst({
      where: {
        status: 'ACCEPTED',
        OR: [
          { senderId: session.user.id, receiverId: userId },
          { senderId: userId, receiverId: session.user.id },
        ],
      },
    });

    if (!friendship) {
      return NextResponse.json(
        { error: 'Bu kullanıcı arkadaşınız değil' },
        { status: 400 }
      );
    }

    // Check if game exists and user is in it
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

    const isPlayerInGame = game.players.some(
      (p) => p.userId === session.user.id
    );
    if (!isPlayerInGame) {
      return NextResponse.json(
        { error: 'Bu oyunda değilsiniz' },
        { status: 400 }
      );
    }

    if (game.status !== 'WAITING') {
      return NextResponse.json(
        { error: 'Oyun zaten başlamış' },
        { status: 400 }
      );
    }

    // Check if friend is already in game
    const friendInGame = game.players.some((p) => p.userId === userId);
    if (friendInGame) {
      return NextResponse.json(
        { error: 'Arkadaşınız zaten oyunda' },
        { status: 400 }
      );
    }

    // TODO: Send real-time notification via Socket.io
    // For now, just return success
    // In production, you would emit a socket event to the friend

    return NextResponse.json({
      success: true,
      message: 'Davet gönderildi',
      roomCode: game.roomCode,
    });
  } catch (error) {
    console.error('Invite friend error:', error);
    return NextResponse.json(
      { error: 'Bir hata oluştu' },
      { status: 500 }
    );
  }
}
