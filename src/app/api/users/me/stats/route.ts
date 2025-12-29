import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/users/me/stats - Get current user statistics
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const stats = await prisma.userStats.findUnique({
      where: { userId: session.user.id },
      select: {
        gamesPlayed: true,
        gamesWon: true,
        gamesLost: true,
        winStreak: true,
        bestWinStreak: true,
        totalScore: true,
        rank: true,
        rankUpdatedAt: true,
      },
    });

    if (!stats) {
      // Create stats if they don't exist
      const newStats = await prisma.userStats.create({
        data: {
          userId: session.user.id,
        },
        select: {
          gamesPlayed: true,
          gamesWon: true,
          gamesLost: true,
          winStreak: true,
          bestWinStreak: true,
          totalScore: true,
          rank: true,
          rankUpdatedAt: true,
        },
      });
      return NextResponse.json(newStats);
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Get stats error:', error);
    return NextResponse.json(
      { error: 'Bir hata oluştu' },
      { status: 500 }
    );
  }
}
