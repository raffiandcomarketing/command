import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { handle, parseBody } from '@/lib/api/http';
import { requireSession } from '@/lib/api/guard';
import { markReadSchema } from '@/lib/validate';

export const PATCH = handle(async (req: NextRequest) => {
  const user = await requireSession();
  const data = await parseBody(req, markReadSchema);

  const where = data.markAllAsRead
    ? { userId: user.id, isRead: false }
    : { id: { in: data.notificationIds! }, userId: user.id };

  const result = await db.notification.updateMany({
    where,
    data: { isRead: true, readAt: new Date() },
  });

  return NextResponse.json({ count: result.count });
});
