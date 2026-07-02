import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { handle } from '@/lib/api/http';
import { requireSession } from '@/lib/api/guard';
import { notFound } from '@/lib/api/errors';

export const DELETE = handle(async (_req: NextRequest, { params }) => {
  const user = await requireSession();

  // Scoped delete: users can only delete their own notifications.
  const result = await db.notification.deleteMany({
    where: { id: params.id, userId: user.id },
  });
  if (result.count === 0) throw notFound('Notification not found');

  return NextResponse.json({ success: true });
});
