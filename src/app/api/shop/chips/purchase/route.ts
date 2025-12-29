import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const purchaseSchema = z.object({
  packageId: z.string().min(1, 'Paket ID gerekli'),
});

// Chip packages
const CHIP_PACKAGES: Record<string, { chips: number; price: number }> = {
  chips_1000: { chips: 1000, price: 9.99 },
  chips_5000: { chips: 5000, price: 39.99 },
  chips_10000: { chips: 10000, price: 69.99 },
  chips_50000: { chips: 50000, price: 299.99 },
  chips_100000: { chips: 100000, price: 499.99 },
};

// POST /api/shop/chips/purchase - Purchase chips
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
    const parsed = purchaseSchema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return NextResponse.json(
        { error: firstIssue?.message || 'Geçersiz veri' },
        { status: 400 }
      );
    }

    const { packageId } = parsed.data;
    const pkg = CHIP_PACKAGES[packageId];

    if (!pkg) {
      return NextResponse.json(
        { error: 'Geçersiz paket' },
        { status: 400 }
      );
    }

    // In production, integrate with payment provider (Stripe, iyzico, etc.)
    // For now, just simulate a successful purchase

    // Create pending transaction
    const transaction = await prisma.transaction.create({
      data: {
        userId: session.user.id,
        type: 'CHIPS_PURCHASE',
        status: 'PENDING',
        amount: pkg.chips,
        price: pkg.price,
        currency: 'TRY',
        description: `${pkg.chips} chip satın alımı`,
      },
    });

    // TODO: Redirect to payment provider
    // For demo purposes, auto-complete the transaction
    await prisma.$transaction([
      prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: 'COMPLETED' },
      }),
      prisma.user.update({
        where: { id: session.user.id },
        data: { chips: { increment: pkg.chips } },
      }),
    ]);

    return NextResponse.json({
      success: true,
      transactionId: transaction.id,
      chips: pkg.chips,
      message: 'Satın alma başarılı',
    });
  } catch (error) {
    console.error('Purchase chips error:', error);
    return NextResponse.json(
      { error: 'Satın alma sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
}
