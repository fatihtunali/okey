import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/users/[userId] - Get public user profile
export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        image: true,
        rating: true,
        vipUntil: true,
        createdAt: true,
        stats: {
          select: {
            gamesPlayed: true,
            gamesWon: true,
            winStreak: true,
            bestWinStreak: true,
            rank: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // Transform to public profile
    const publicProfile = {
      id: user.id,
      name: user.name,
      image: user.image,
      rating: user.rating,
      isVip: user.vipUntil ? new Date(user.vipUntil) > new Date() : false,
      stats: user.stats,
      memberSince: user.createdAt,
    };

    return NextResponse.json(publicProfile);
  } catch (error) {
    console.error('Get user profile error:', error);
    return NextResponse.json(
      { error: 'Bir hata oluştu' },
      { status: 500 }
    );
  }
}
