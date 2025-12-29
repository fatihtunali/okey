import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const purchaseSchema = z.object({
  packageId: z.string(),
});

// VIP packages configuration
const VIP_PACKAGES: Record<string, { tier: string; durationDays: number; priceChips: number }> = {
  'bronze-7': { tier: 'bronze', durationDays: 7, priceChips: 500 },
  'bronze-30': { tier: 'bronze', durationDays: 30, priceChips: 1500 },
  'silver-7': { tier: 'silver', durationDays: 7, priceChips: 1000 },
  'silver-30': { tier: 'silver', durationDays: 30, priceChips: 3000 },
  'gold-7': { tier: 'gold', durationDays: 7, priceChips: 2000 },
  'gold-30': { tier: 'gold', durationDays: 30, priceChips: 6000 },
};

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = purchaseSchema.parse(body);

    const vipPackage = VIP_PACKAGES[data.packageId];
    if (!vipPackage) {
      return NextResponse.json({ error: 'Invalid package' }, { status: 400 });
    }

    // Get user's current chips
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { chips: true, vipUntil: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.chips < vipPackage.priceChips) {
      return NextResponse.json({ error: 'Not enough chips' }, { status: 400 });
    }

    // Calculate new VIP expiry
    const now = new Date();
    let newVipExpiry: Date;

    if (user.vipUntil && user.vipUntil > now) {
      // Extend existing VIP
      newVipExpiry = new Date(user.vipUntil);
      newVipExpiry.setDate(newVipExpiry.getDate() + vipPackage.durationDays);
    } else {
      // New VIP subscription
      newVipExpiry = new Date(now);
      newVipExpiry.setDate(newVipExpiry.getDate() + vipPackage.durationDays);
    }

    // Update user
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        chips: { decrement: vipPackage.priceChips },
        vipUntil: newVipExpiry,
      },
    });

    // Record transaction
    await prisma.transaction.create({
      data: {
        userId: session.user.id,
        type: 'VIP_PURCHASE',
        amount: -vipPackage.priceChips,
        description: `VIP ${vipPackage.tier} - ${vipPackage.durationDays} gün`,
      },
    });

    return NextResponse.json({
      success: true,
      vipExpiry: newVipExpiry.toISOString(),
      tier: vipPackage.tier,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.issues }, { status: 400 });
    }
    console.error('VIP purchase error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
