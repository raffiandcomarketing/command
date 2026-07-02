import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { handle, parseBody, getPagination } from '@/lib/api/http';
import { requireSession, requireRole } from '@/lib/api/guard';
import { createNotificationSchema } from '@/lib/validate';

export const GET = handle(async (req: NextRequest) => {
  const user = await requireSession();

  const sp = req.nextUrl.searchParams;
  const unreadOnly = sp.get('unreadOnly') === 'true';
  const p = getPagination(req, 50);

  const where = { userId: user.id, ...(unreadOnly && { isRead: false }) };

  const [notifications, total, unreadCount] = await Promise.all([
    db.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: p.skip,
      take: p.take,
    }),
    db.notification.count({ where }),
    db.notification.count({ where: { userId: user.id, isRead: false } }),
  ]);

  return NextResponse.json({
    notifications,
    unreadCount,
    pagination: { total, page: p.page, pageSize: p.pageSize, pages: Math.max(1, Math.ceil(total / p.pageSize)) },
  });
});

/** Creating notifications for other users is a manager+ capability. */
export const POST = handle(async (req: NextRequest) => {
  const user = await requireSession();

  const data = await parseBody(req, createNotificationSchema);
  if (data.userId !== user.id) {
    requireRole(user, 'ADMIN', 'EXECUTIVE', 'MANAGER');
  }

  const notification = await db.notification.create({
    data: {
      userId: data.userId,
      type: data.type ?? 'INFO',
      title: data.title,
      message: data.message,
      link: data.link ?? null,
      metadata: (data.metadata as object) ?? undefined,
    },
  });

  return NextResponse.json({ notification }, { status: 201 });
});
