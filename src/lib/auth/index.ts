import { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import bcryptjs from 'bcryptjs';
import { db } from '@/lib/db';
import { UserRole, SessionUser } from '@/types';

declare module 'next-auth' {
  interface Session {
    user: SessionUser;
  }

  interface JWT {
    id: string;
    role: UserRole;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'user@example.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error('User not found');
        }

        if (!user.isActive) {
          throw new Error('User account is inactive');
        }

        const passwordMatch = await bcryptjs.compare(
          credentials.password,
          user.passwordHash
        );

        if (!passwordMatch) {
          throw new Error('Invalid password');
        }

        // Update last login
        await db.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatar,
        };
      },
    }),
  ],
  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const dbUser = await db.user.findUnique({
          where: { id: user.id },
        });

        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;

        const dbUser = await db.user.findUnique({
          where: { id: token.id as string },
        });

        if (dbUser) {
          session.user.isActive = dbUser.isActive;
          session.user.avatar = dbUser.avatar;
        }
      }

      return session;
    },

    async signIn({ user }) {
      if (!user?.id) {
        return false;
      }

      const dbUser = await db.user.findUnique({
        where: { id: user.id },
      });

      return !!(dbUser && dbUser.isActive);
    },

    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  events: {
    async signOut({ user }) {
      if (user?.id) {
        // Log the sign-out event if needed
        await db.activityLog.create({
          data: {
            userId: user.id,
            type: 'AUTH',
            description: 'User signed out',
          },
        });
      }
    },

    async signIn({ user }) {
      if (user?.id) {
        // Log the sign-in event
        await db.activityLog.create({
          data: {
            userId: user.id,
            type: 'AUTH',
            description: 'User signed in',
          },
        });
      }
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};
