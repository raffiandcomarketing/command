import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { handle, parseBody } from '@/lib/api/http';
import { requireAdmin, getClientIp } from '@/lib/api/guard';
import { notFound } from '@/lib/api/errors';
import { writeAudit } from '@/lib/api/audit';
import { updateIntegrationSchema } from '@/lib/validate';

export const GET = handle(async (_req: NextRequest, { params }) => {
  await requireAdmin();
  const integration = await db.integration.findUnique({
    where: { id: params.id },
    include: { webhooks: { select: { id: true, name: true, url: true, isActive: true } } },
  });
  if (!integration) throw notFound('Integration not found');
  return NextResponse.json({
    integration: { ...integration, config: undefined, status: integration.isActive ? 'configured' : 'inactive', syncAvailable: false },
  });
});

export const PATCH = handle(async (req: NextRequest, { params }) => {
  const admin = await requireAdmin();

  const data = await parseBody(req, updateIntegrationSchema);

  const integration = await db.integration.update({
    where: { id: params.id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.type !== undefined && { type: data.type }),
      ...(data.provider !== undefined && { provider: data.provider }),
      ...(data.config !== undefined && { config: data.config as object }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
      ...(data.departmentId !== undefined && { departmentId: data.departmentId }),
    },
  });

  void writeAudit({
    userId: admin.id,
    action: 'update',
    entity: 'Integration',
    entityId: integration.id,
    changes: { ...data, config: data.config ? '[updated]' : undefined },
    ipAddress: getClientIp(req),
  });

  return NextResponse.json({
    integration: { ...integration, config: undefined, status: integration.isActive ? 'configured' : 'inactive', syncAvailable: false },
  });
});

export const DELETE = handle(async (req: NextRequest, { params }) => {
  const admin = await requireAdmin();

  const integration = await db.integration.findUnique({ where: { id: params.id } });
  if (!integration) throw notFound('Integration not found');

  await db.integration.delete({ where: { id: params.id } });

  void writeAudit({
    userId: admin.id,
    action: 'delete',
    entity: 'Integration',
    entityId: params.id,
    changes: { name: integration.name },
    ipAddress: getClientIp(req),
  });

  return NextResponse.json({ success: true });
});
