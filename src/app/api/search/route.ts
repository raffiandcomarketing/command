import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { handle } from '@/lib/api/http';
import { requireSession } from '@/lib/api/guard';

/**
 * Global search across tasks, deals, contacts, approvals, departments,
 * and (admin only) users. Results are grouped and capped per entity.
 */
export const GET = handle(async (req: NextRequest) => {
  const user = await requireSession();

  const q = req.nextUrl.searchParams.get('q')?.trim() || '';
  if (q.length < 2) {
    return NextResponse.json({ results: { tasks: [], deals: [], contacts: [], approvals: [], departments: [], users: [] } });
  }

  const contains = { contains: q, mode: 'insensitive' as const };
  const TAKE = 5;

  const [tasks, deals, contacts, approvals, departments, users] = await Promise.all([
    db.task.findMany({
      where: { OR: [{ title: contains }, { description: contains }] },
      select: { id: true, title: true, status: true, priority: true },
      take: TAKE,
      orderBy: { createdAt: 'desc' },
    }),
    db.crmDeal.findMany({
      where: { OR: [{ title: contains }, { contact: { name: contains } }] },
      select: { id: true, title: true, stage: true, value: true, contact: { select: { name: true } } },
      take: TAKE,
      orderBy: { createdAt: 'desc' },
    }),
    db.crmContact.findMany({
      where: { OR: [{ name: contains }, { email: contains }, { company: contains }] },
      select: { id: true, name: true, email: true, company: true },
      take: TAKE,
      orderBy: { name: 'asc' },
    }),
    db.approval.findMany({
      where: { title: contains },
      select: { id: true, title: true, status: true, type: true },
      take: TAKE,
      orderBy: { createdAt: 'desc' },
    }),
    db.department.findMany({
      where: { name: contains },
      select: { id: true, name: true, slug: true },
      take: TAKE,
    }),
    user.role === 'ADMIN'
      ? db.user.findMany({
          where: { OR: [{ name: contains }, { email: contains }] },
          select: { id: true, name: true, email: true, role: true },
          take: TAKE,
        })
      : Promise.resolve([]),
  ]);

  return NextResponse.json({ results: { tasks, deals, contacts, approvals, departments, users } });
});
