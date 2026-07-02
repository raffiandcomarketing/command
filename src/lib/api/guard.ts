import { getServerSession } from 'next-auth/next';
import { NextRequest } from 'next/server';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { forbidden, unauthorized } from './errors';
import type { SessionUser, UserRoleName } from '@/types';

export type { SessionUser };

/** Roles allowed to act across other users' records. */
const ELEVATED: UserRoleName[] = ['ADMIN', 'EXECUTIVE', 'MANAGER'];

/**
 * Central API authorization guard (assessment R1/TD5).
 * Every route calls requireSession(); mutating routes additionally use
 * requireRole / assertOwnershipOr to enforce who may act.
 */
export async function requireSession(): Promise<SessionUser> {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser | undefined;
  if (!user?.id) throw unauthorized();
  return user;
}

export function requireRole(user: SessionUser, ...roles: UserRoleName[]): void {
  if (!roles.includes(user.role)) {
    throw forbidden('You do not have permission to perform this action');
  }
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireSession();
  requireRole(user, 'ADMIN');
  return user;
}

export function isElevated(user: SessionUser): boolean {
  return ELEVATED.includes(user.role);
}

/**
 * Allow when the actor owns the record (id match on any provided owner id)
 * or holds an elevated role. Otherwise 403.
 */
export function assertOwnershipOr(
  user: SessionUser,
  ownerIds: Array<string | null | undefined>,
  message = 'You can only modify your own records'
): void {
  if (isElevated(user)) return;
  if (ownerIds.some((id) => id && id === user.id)) return;
  throw forbidden(message);
}

/** Writers (VIEWER may read but never mutate). */
export function assertCanWrite(user: SessionUser): void {
  if (user.role === 'VIEWER') {
    throw forbidden('Viewers have read-only access');
  }
}

/** Resolve department ids for the user's memberships (for scoping). */
export async function userDepartmentIds(user: SessionUser): Promise<string[]> {
  const rows = await db.userDepartment.findMany({
    where: { userId: user.id },
    select: { departmentId: true },
  });
  return rows.map((r) => r.departmentId);
}

export function getClientIp(req: NextRequest): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return req.headers.get('x-real-ip') || 'unknown';
}
