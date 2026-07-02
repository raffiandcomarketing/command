import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { handle, getPagination } from '@/lib/api/http';
import { requireSession } from '@/lib/api/guard';

/** Recent activity feed for the dashboard. */
export const GET = handle(async (req: NextRequest) => {
  await requireSession();
  const p = getPagination(req, 10);

  const [activities, total] = await Promise.all([
    db.activityLog.findMany({
      include: { user: { select: { id: true, name: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
      skip: p.skip,
      take: p.take,
    }),
    db.activityLog.count(),
  ]);

  return NextResponse.json({
    activities,
    pagination: { total, page: p.page, pageSize: p.pageSize, pages: Math.max(1, Math.ceil(total / p.pageSize)) },
  });
});
