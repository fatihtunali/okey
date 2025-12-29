import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/friends - List friends
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get accepted friendships where user is sender or receiver
    const friendships = await prisma.friendship.findMany({
      where: {
        status: 'ACCEPTED',
        OR: [
          { senderId: session.user.id },
          { receiverId: session.user.id },
        ],
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
        receiver: {
          select: {
            id: true,
            name: true,
            image: true,
            rating: true,
            vipUntil: true,
          },
        },
      },
    });

    // Transform to friend list
    const friends = friendships.map((f) => {
      const friend = f.senderId === session.user.id ? f.receiver : f.sender;
      return {
        id: f.id,
        user: {
          id: friend.id,
          name: friend.name,
          image: friend.image,
          rating: friend.rating,
          isVip: friend.vipUntil ? new Date(friend.vipUntil) > new Date() : false,
        },
        isOnline: false, // TODO: Implement online status with Socket.io
        currentGameId: null, // TODO: Check if in joinable game
      };
    });

    return NextResponse.json(friends);
  } catch (error) {
    console.error('List friends error:', error);
    return NextResponse.json(
      { error: 'Bir hata oluştu' },
      { status: 500 }
    );
  }
}
