import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/shop/cosmetics - List available cosmetics
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    const whereClause: { type?: string } = {};
    if (type) {
      whereClause.type = type;
    }

    const cosmetics = await prisma.cosmetic.findMany({
      where: whereClause,
      orderBy: [{ type: 'asc' }, { price: 'asc' }],
    });

    // If user is logged in, check owned cosmetics
    let ownedCosmeticIds: Set<string> = new Set();
    if (session?.user?.id) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { avatarId: true, tileThemeId: true, tableThemeId: true },
      });

      if (user) {
        if (user.avatarId) ownedCosmeticIds.add(user.avatarId);
        if (user.tileThemeId) ownedCosmeticIds.add(user.tileThemeId);
        if (user.tableThemeId) ownedCosmeticIds.add(user.tableThemeId);
      }

      // Get purchased cosmetics from transactions
      const purchases = await prisma.transaction.findMany({
        where: {
          userId: session.user.id,
          type: 'COSMETIC_PURCHASE',
          status: 'COMPLETED',
          itemId: { not: null },
        },
        select: { itemId: true },
      });

      purchases.forEach((p) => {
        if (p.itemId) ownedCosmeticIds.add(p.itemId);
      });
    }

    // Transform to response format
    const response = cosmetics.map((c) => ({
      id: c.id,
      type: c.type,
      code: c.code,
      name: c.nameKey, // In production, translate based on locale
      previewUrl: c.previewUrl,
      price: c.price,
      isVipOnly: c.isVipOnly,
      isOwned: ownedCosmeticIds.has(c.id),
    }));

    return NextResponse.json(response);
  } catch (error) {
    console.error('List cosmetics error:', error);
    return NextResponse.json(
      { error: 'Bir hata oluştu' },
      { status: 500 }
    );
  }
}
