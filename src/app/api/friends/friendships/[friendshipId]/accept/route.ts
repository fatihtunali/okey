import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/friends/[friendshipId]/accept - Accept friend request
export async function POST(
  request: Request,
  { params }: { params: Promise<{ friendshipId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { friendshipId } = await params;

    const friendship = await prisma.friendship.findUnique({
      where: { id: friendshipId },
    });

    if (!friendship) {
      return NextResponse.json(
        { error: 'Arkadaşlık isteği bulunamadı' },
        { status: 404 }
      );
    }

    // Only receiver can accept
    if (friendship.receiverId !== session.user.id) {
      return NextResponse.json(
        { error: 'Bu isteği kabul etme yetkiniz yok' },
        { status: 403 }
      );
    }

    if (friendship.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Bu istek zaten işlenmiş' },
        { status: 400 }
      );
    }

    await prisma.friendship.update({
      where: { id: friendshipId },
      data: { status: 'ACCEPTED' },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Accept friend request error:', error);
    return NextResponse.json(
      { error: 'Bir hata oluştu' },
      { status: 500 }
    );
  }
}
