import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';
import { loginSchema } from './validations/auth';

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/',
    error: '/',
  },
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            name: true,
            password: true,
            image: true,
            chips: true,
            rating: true,
            vipUntil: true,
            locale: true,
          },
        });

        if (!user || !user.password) {
          return null;
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
      }

      // Handle session updates
      if (trigger === 'update' && session) {
        return { ...token, ...session };
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;

        // Fetch additional user data
        const userData = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: {
            chips: true,
            rating: true,
            vipUntil: true,
            locale: true,
            avatarId: true,
          },
        });

        if (userData) {
          (session.user as any).chips = userData.chips;
          (session.user as any).rating = userData.rating;
          (session.user as any).isVip = userData.vipUntil ? new Date(userData.vipUntil) > new Date() : false;
          (session.user as any).locale = userData.locale;
          (session.user as any).avatarId = userData.avatarId;
        }
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      // Create UserStats when a new user is created
      await prisma.userStats.create({
        data: {
          userId: user.id!,
        },
      });
    },
  },
});

// Type augmentation for session
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image?: string;
      chips?: number;
      rating?: number;
      isVip?: boolean;
      locale?: string;
      avatarId?: string;
    };
  }
}
