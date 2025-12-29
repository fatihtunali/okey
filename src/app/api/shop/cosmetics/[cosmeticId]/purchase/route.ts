import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/shop/cosmetics/[cosmeticId]/purchase - Purchase cosmetic
export async function POST(
  request: Request,
  { params }: { params: Promise<{ cosmeticId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { cosmeticId } = await params;

    // Get cosmetic
    const cosmetic = await prisma.cosmetic.findUnique({
      where: { id: cosmeticId },
    });

    if (!cosmetic) {
      return NextResponse.json(
        { error: 'Kozmetik bulunamadı' },
        { status: 404 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { chips: true, vipUntil: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // Check if VIP only
    if (cosmetic.isVipOnly) {
      const isVip = user.vipUntil && new Date(user.vipUntil) > new Date();
      if (!isVip) {
        return NextResponse.json(
          { error: 'Bu kozmetik sadece VIP üyeler için' },
          { status: 400 }
        );
      }
    }

    // Check if already owned
    const existingPurchase = await prisma.transaction.findFirst({
      where: {
        userId: session.user.id,
        type: 'COSMETIC_PURCHASE',
        status: 'COMPLETED',
        itemId: cosmeticId,
      },
    });

    if (existingPurchase) {
      return NextResponse.json(
        { error: 'Bu kozmetiğe zaten sahipsiniz' },
        { status: 400 }
      );
    }

    // Check if user has enough chips
    if (user.chips < cosmetic.price) {
      return NextResponse.json(
        { error: 'Yeterli chip yok' },
        { status: 400 }
      );
    }

    // Purchase cosmetic
    await prisma.$transaction([
      prisma.user.update({
        where: { id: session.user.id },
        data: { chips: { decrement: cosmetic.price } },
      }),
      prisma.transaction.create({
        data: {
          userId: session.user.id,
          type: 'COSMETIC_PURCHASE',
          status: 'COMPLETED',
          amount: -cosmetic.price,
          itemId: cosmeticId,
          description: `Kozmetik satın alımı: ${cosmetic.code}`,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      cosmetic: {
        id: cosmetic.id,
        type: cosmetic.type,
        code: cosmetic.code,
      },
    });
  } catch (error) {
    console.error('Purchase cosmetic error:', error);
    return NextResponse.json(
      { error: 'Satın alma sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
}
