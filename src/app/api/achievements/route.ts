import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/achievements - List all achievements
export async function GET() {
  try {
    const achievements = await prisma.achievement.findMany({
      orderBy: { code: 'asc' },
    });

    // Transform to response format
    const response = achievements.map((a: { id: string; code: string; nameKey: string; descKey: string; icon: string | null; reward: number }) => ({
      id: a.id,
      code: a.code,
      name: a.nameKey, // In production, translate based on locale
      description: a.descKey, // In production, translate based on locale
      icon: a.icon,
      reward: a.reward,
    }));

    return NextResponse.json(response);
  } catch (error) {
    console.error('List achievements error:', error);
    return NextResponse.json(
      { error: 'Bir hata oluştu' },
      { status: 500 }
    );
  }
}
