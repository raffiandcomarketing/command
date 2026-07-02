import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { handle } from '@/lib/api/http';
import { requireSession } from '@/lib/api/guard';

/**
 * Minimal internal staff directory (id + name + avatar) for assignee
 * pickers. Available to all authenticated users; full user admin data
 * stays admin-only under /api/users.
 */
export const GET = handle(async () => {
  await requireSession();
  const users = await db.user.findMany({
    where: { isActive: true },
    select: { id: true, name: true, avatar: true, role: true },
    orderBy: { name: 'asc' },
    take: 500,
  });
  return NextResponse.json({ users });
});
