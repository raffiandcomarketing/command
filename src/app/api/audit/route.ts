import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { handle, getPagination } from '@/lib/api/http';
import { requireSession, requireRole } from '@/lib/api/guard';

/** Audit trail queries - admin/executive only. */
export const GET = handle(async (req: NextRequest) => {
  const user = await requireSession();
  requireRole(user, 'ADMIN', 'EXECUTIVE');

  const sp = req.nextUrl.searchParams;
  const entity = sp.get('entity') || undefined;
  const entityId = sp.get('entityId') || undefined;
  const userId = sp.get('userId') || undefined;
  const action = sp.get('action') || undefined;
  const p = getPagination(req, 50);

  const where: Prisma.AuditLogWhereInput = {
    ...(entity && { entity }),
    ...(entityId && { entityId }),
    ...(userId && { userId }),
    ...(action && { action }),
  };

  const [logs, total] = await Promise.all([
    db.auditLog.findMany({
      where,
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      skip: p.skip,
      take: p.take,
    }),
    db.auditLog.count({ where }),
  ]);

  return NextResponse.json({
    logs,
    pagination: { total, page: p.page, pageSize: p.pageSize, pages: Math.max(1, Math.ceil(total / p.pageSize)) },
  });
});
