import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { handle, parseBody } from '@/lib/api/http';
import { requireAdmin, getClientIp } from '@/lib/api/guard';
import { writeAudit } from '@/lib/api/audit';
import { createIntegrationSchema } from '@/lib/validate';
import { slugify } from '@/lib/utils';

/**
 * Integrations are configuration records only until real adapters ship
 * (roadmap Sprint 9). Statuses returned here are HONEST: an integration is
 * 'configured' or 'inactive' - never a fake 'connected/synced'.
 */
export const GET = handle(async (_req: NextRequest) => {
  await requireAdmin();

  const integrations = await db.integration.findMany({
    include: { department: { select: { id: true, name: true, slug: true } } },
    orderBy: { name: 'asc' },
  });

  return NextResponse.json({
    integrations: integrations.map((i) => ({
      ...i,
      config: undefined, // never leak credentials/config to the list view
      status: i.isActive ? 'configured' : 'inactive',
      syncAvailable: false, // real adapters land in roadmap Sprint 9
    })),
  });
});

export const POST = handle(async (req: NextRequest) => {
  const admin = await requireAdmin();

  const data = await parseBody(req, createIntegrationSchema);

  const integration = await db.integration.create({
    data: {
      name: data.name,
      slug: data.slug ?? slugify(data.name),
      type: data.type,
      provider: data.provider,
      config: (data.config as object) ?? {},
      isActive: data.isActive ?? true,
      departmentId: data.departmentId ?? null,
    },
  });

  void writeAudit({
    userId: admin.id,
    action: 'create',
    entity: 'Integration',
    entityId: integration.id,
    changes: { name: integration.name, provider: integration.provider },
    ipAddress: getClientIp(req),
  });

  return NextResponse.json(
    { integration: { ...integration, config: undefined, status: integration.isActive ? 'configured' : 'inactive', syncAvailable: false } },
    { status: 201 }
  );
});
