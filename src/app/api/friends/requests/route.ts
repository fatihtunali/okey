import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/friends/requests - List pending friend requests
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get pending requests sent to user
    const requests = await prisma.friendship.findMany({
      where: {
        receiverId: session.user.id,
        status: 'PENDING',
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
            rating: true,
            vipUntil: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Transform to friend request format
    const friendRequests = requests.map((r) => ({
      id: r.id,
      sender: {
        id: r.sender.id,
        name: r.sender.name,
        image: r.sender.image,
        rating: r.sender.rating,
        isVip: r.sender.vipUntil ? new Date(r.sender.vipUntil) > new Date() : false,
      },
      createdAt: r.createdAt,
    }));

    return NextResponse.json(friendRequests);
  } catch (error) {
    console.error('List friend requests error:', error);
    return NextResponse.json(
      { error: 'Bir hata oluştu' },
      { status: 500 }
    );
  }
}
