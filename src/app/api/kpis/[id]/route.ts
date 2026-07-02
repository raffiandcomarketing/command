import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { handle, parseBody } from '@/lib/api/http';
import { requireSession, requireRole, getClientIp } from '@/lib/api/guard';
import { notFound } from '@/lib/api/errors';
import { writeAudit } from '@/lib/api/audit';
import { updateKpiSchema } from '@/lib/validate';

export const GET = handle(async (_req: NextRequest, { params }) => {
  await requireSession();
  const kpi = await db.kpiDefinition.findUnique({
    where: { id: params.id },
    include: {
      department: { select: { id: true, name: true, slug: true } },
      snapshots: { orderBy: { recordedAt: 'desc' }, take: 60 },
    },
  });
  if (!kpi) throw notFound('KPI not found');
  return NextResponse.json({ kpi });
});

export const PATCH = handle(async (req: NextRequest, { params }) => {
  const user = await requireSession();
  requireRole(user, 'ADMIN', 'EXECUTIVE');

  const data = await parseBody(req, updateKpiSchema);

  const kpi = await db.kpiDefinition.update({
    where: { id: params.id },
    data,
    include: { department: { select: { id: true, name: true, slug: true } } },
  });

  void writeAudit({
    userId: user.id,
    action: 'update',
    entity: 'KpiDefinition',
    entityId: kpi.id,
    changes: data,
    ipAddress: getClientIp(req),
  });

  return NextResponse.json({ kpi });
});

export const DELETE = handle(async (req: NextRequest, { params }) => {
  const user = await requireSession();
  requireRole(user, 'ADMIN');

  await db.kpiDefinition.delete({ where: { id: params.id } });

  void writeAudit({
    userId: user.id,
    action: 'delete',
    entity: 'KpiDefinition',
    entityId: params.id,
    ipAddress: getClientIp(req),
  });

  return NextResponse.json({ success: true });
});
