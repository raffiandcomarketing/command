import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { handle, parseBody } from '@/lib/api/http';
import { requireSession, requireRole, getClientIp } from '@/lib/api/guard';
import { writeAudit } from '@/lib/api/audit';
import { createKpiSchema } from '@/lib/validate';
import { slugify } from '@/lib/utils';

export const GET = handle(async (req: NextRequest) => {
  await requireSession();

  const sp = req.nextUrl.searchParams;
  const departmentId = sp.get('departmentId') || undefined;
  const includeInactive = sp.get('includeInactive') === 'true';

  // Fixed: the old route queried a non-existent `db.kpi` model.
  const where: Prisma.KpiDefinitionWhereInput = {
    ...(departmentId && { departmentId }),
    ...(!includeInactive && { isActive: true }),
  };

  const kpis = await db.kpiDefinition.findMany({
    where,
    include: {
      department: { select: { id: true, name: true, slug: true } },
      snapshots: { orderBy: { recordedAt: 'desc' }, take: 12 },
    },
    orderBy: { name: 'asc' },
  });

  return NextResponse.json({ kpis });
});

export const POST = handle(async (req: NextRequest) => {
  const user = await requireSession();
  requireRole(user, 'ADMIN', 'EXECUTIVE');

  const data = await parseBody(req, createKpiSchema);

  const kpi = await db.kpiDefinition.create({
    data: {
      name: data.name,
      slug: data.slug ?? slugify(data.name),
      description: data.description ?? null,
      departmentId: data.departmentId ?? null,
      roleId: data.roleId ?? null,
      unit: data.unit,
      targetValue: data.targetValue,
      warningThreshold: data.warningThreshold,
      criticalThreshold: data.criticalThreshold,
      direction: data.direction,
      dataSource: data.dataSource,
      isActive: data.isActive ?? true,
    },
    include: { department: { select: { id: true, name: true, slug: true } } },
  });

  void writeAudit({
    userId: user.id,
    action: 'create',
    entity: 'KpiDefinition',
    entityId: kpi.id,
    changes: { name: kpi.name, dataSource: kpi.dataSource },
    ipAddress: getClientIp(req),
  });

  return NextResponse.json({ kpi }, { status: 201 });
});
