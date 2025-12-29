import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/users/me/achievements - Get current user's achievements
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId: session.user.id },
      include: {
        achievement: true,
      },
      orderBy: { unlockedAt: 'desc' },
    });

    // Transform to response format
    type AchievementType = { id: string; code: string; nameKey: string; descKey: string; icon: string | null; reward: number };
    type UserAchievementType = { achievement: AchievementType; unlockedAt: Date };
    const response = userAchievements.map((ua: UserAchievementType) => ({
      achievement: {
        id: ua.achievement.id,
        code: ua.achievement.code,
        name: ua.achievement.nameKey,
        description: ua.achievement.descKey,
        icon: ua.achievement.icon,
        reward: ua.achievement.reward,
      },
      unlockedAt: ua.unlockedAt,
    }));

    return NextResponse.json(response);
  } catch (error) {
    console.error('Get user achievements error:', error);
    return NextResponse.json(
      { error: 'Bir hata oluştu' },
      { status: 500 }
    );
  }
}
