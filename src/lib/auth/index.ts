import { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { db } from '@/lib/db';
import { SessionUser } from '@/types';
import { verifyPassword } from '@/lib/security/password';
import { rateLimit, resetRateLimit } from '@/lib/api/rate-limit';
import { writeAudit } from '@/lib/api/audit';
import { log } from '@/lib/log';

declare module 'next-auth' {
  interface Session {
    user: SessionUser;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
    avatar?: string | null;
    departmentSlugs: string[];
  }
}

/** 5 failed attempts per identity+IP per 15 minutes (assessment R8). */
const LOGIN_ATTEMPT_LIMIT = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email.trim().toLowerCase();
        const xff = (req?.headers?.['x-forwarded-for'] as string) || '';
        const ip = xff.split(',')[0]?.trim() || 'unknown';
        const rlKey = `login:${ip}:${email}`;

        const rl = rateLimit(rlKey, LOGIN_ATTEMPT_LIMIT, LOGIN_WINDOW_MS);
        if (!rl.allowed) {
          log.warn('Login rate limit exceeded', { email, ip });
          // NextAuth surfaces this as a failed sign-in without user enumeration.
          return null;
        }

        try {
          const user = await db.user.findUnique({ where: { email } });

          if (!user || !user.isActive) {
            return null;
          }

          const passwordMatch = await verifyPassword(credentials.password, user.passwordHash);
          if (!passwordMatch) {
            return null;
          }

          resetRateLimit(rlKey);

          await db.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
          });

          const userDepts = await db.userDepartment.findMany({
            where: { userId: user.id },
            include: { department: { select: { slug: true } } },
          });

          void writeAudit({
            userId: user.id,
            action: 'login',
            entity: 'User',
            entityId: user.id,
            ipAddress: ip,
          });

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.avatar,
            role: user.role,
            departmentSlugs: userDepts.map((ud) => ud.department.slug),
          };
        } catch (error) {
          log.error('Auth error', { err: error as Error });
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as unknown as { role: string }).role;
        token.avatar = (user as unknown as { image?: string | null }).image;
        token.departmentSlugs =
          (user as unknown as { departmentSlugs?: string[] }).departmentSlugs || [];
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role as SessionUser['role'];
        session.user.avatar = token.avatar;
        session.user.isActive = true;
        session.user.departmentSlugs = token.departmentSlugs;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
    // Hardened from 30 days to 12 hours (assessment R8/TD15).
    maxAge: 12 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
};
