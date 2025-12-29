import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const sendRequestSchema = z.object({
  userId: z.string().min(1, 'Kullanıcı ID gerekli'),
});

// POST /api/friends/request - Send friend request
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
    const parsed = sendRequestSchema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return NextResponse.json(
        { error: firstIssue?.message || 'Geçersiz veri' },
        { status: 400 }
      );
    }

    const { userId } = parsed.data;

    // Can't send request to yourself
    if (userId === session.user.id) {
      return NextResponse.json(
        { error: 'Kendinize arkadaşlık isteği gönderemezsiniz' },
        { status: 400 }
      );
    }

    // Check if user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // Check for existing friendship
    const existing = await prisma.friendship.findFirst({
      where: {
        OR: [
          { senderId: session.user.id, receiverId: userId },
          { senderId: userId, receiverId: session.user.id },
        ],
      },
    });

    if (existing) {
      if (existing.status === 'ACCEPTED') {
        return NextResponse.json(
          { error: 'Zaten arkadaşsınız' },
          { status: 400 }
        );
      }
      if (existing.status === 'PENDING') {
        return NextResponse.json(
          { error: 'Bekleyen bir istek zaten var' },
          { status: 400 }
        );
      }
      if (existing.status === 'BLOCKED') {
        return NextResponse.json(
          { error: 'Bu kullanıcıyla arkadaş olamazsınız' },
          { status: 400 }
        );
      }
    }

    // Create friend request
    const friendship = await prisma.friendship.create({
      data: {
        senderId: session.user.id,
        receiverId: userId,
        status: 'PENDING',
      },
    });

    return NextResponse.json({ success: true, id: friendship.id }, { status: 201 });
  } catch (error) {
    console.error('Send friend request error:', error);
    return NextResponse.json(
      { error: 'Arkadaşlık isteği gönderilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
