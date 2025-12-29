import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/leaderboard - Get leaderboard
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'rating';
    const limit = Math.min(parseInt(searchParams.get('limit') || '100', 10), 100);

    let orderBy: object;
    let valueField: string;

    switch (type) {
      case 'wins':
        orderBy = { stats: { gamesWon: 'desc' } };
        valueField = 'gamesWon';
        break;
      case 'streak':
        orderBy = { stats: { bestWinStreak: 'desc' } };
        valueField = 'bestWinStreak';
        break;
      case 'rating':
      default:
        orderBy = { rating: 'desc' };
        valueField = 'rating';
        break;
    }

    const users = await prisma.user.findMany({
      where: {
        // Only include users who have played at least one game
        stats: type !== 'rating' ? { gamesPlayed: { gt: 0 } } : undefined,
      },
      select: {
        id: true,
        name: true,
        image: true,
        rating: true,
        vipUntil: true,
        stats: {
          select: {
            gamesWon: true,
            bestWinStreak: true,
          },
        },
      },
      orderBy,
      take: limit,
    });

    // Transform to leaderboard format
    type UserType = { id: string; name: string | null; image: string | null; rating: number; vipUntil: Date | null; stats: { gamesWon: number; bestWinStreak: number } | null };
    const leaderboard = users.map((user: UserType, index: number) => {
      let value: number;
      switch (valueField) {
        case 'gamesWon':
          value = user.stats?.gamesWon || 0;
          break;
        case 'bestWinStreak':
          value = user.stats?.bestWinStreak || 0;
          break;
        default:
          value = user.rating;
      }

      return {
        rank: index + 1,
        user: {
          id: user.id,
          name: user.name,
          image: user.image,
          rating: user.rating,
          isVip: user.vipUntil ? new Date(user.vipUntil) > new Date() : false,
        },
        value,
      };
    });

    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error('Get leaderboard error:', error);
    return NextResponse.json(
      { error: 'Bir hata oluştu' },
      { status: 500 }
    );
  }
}
