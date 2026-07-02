import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { handle, parseBody, getPagination } from '@/lib/api/http';
import { requireSession, requireRole } from '@/lib/api/guard';
import { notFound } from '@/lib/api/errors';
import { createSnapshotSchema } from '@/lib/validate';

export const GET = handle(async (req: NextRequest, { params }) => {
  await requireSession();
  const p = getPagination(req, 30);

  const [snapshots, total] = await Promise.all([
    db.kpiSnapshot.findMany({
      where: { kpiId: params.id },
      orderBy: { recordedAt: 'desc' },
      skip: p.skip,
      take: p.take,
    }),
    db.kpiSnapshot.count({ where: { kpiId: params.id } }),
  ]);

  return NextResponse.json({
    snapshots,
    pagination: { total, page: p.page, pageSize: p.pageSize, pages: Math.max(1, Math.ceil(total / p.pageSize)) },
  });
});

/** Manual snapshot entry (for 'manual' dataSource KPIs). Manager+. */
export const POST = handle(async (req: NextRequest, { params }) => {
  const user = await requireSession();
  requireRole(user, 'ADMIN', 'EXECUTIVE', 'MANAGER');

  const kpi = await db.kpiDefinition.findUnique({ where: { id: params.id } });
  if (!kpi) throw notFound('KPI not found');

  const data = await parseBody(req, createSnapshotSchema);

  const snapshot = await db.kpiSnapshot.create({
    data: {
      kpiId: params.id,
      value: data.value,
      period: data.period ?? new Date().toISOString().slice(0, 10),
      metadata: { ...(data.metadata as object), recordedBy: user.id },
    },
  });

  return NextResponse.json({ snapshot }, { status: 201 });
});
