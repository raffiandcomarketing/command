import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { handle, parseBody } from '@/lib/api/http';
import { requireAdmin, getClientIp } from '@/lib/api/guard';
import { notFound } from '@/lib/api/errors';
import { writeAudit } from '@/lib/api/audit';
import { updateWebhookSchema } from '@/lib/validate';

export const PATCH = handle(async (req: NextRequest, { params }) => {
  const admin = await requireAdmin();

  const data = await parseBody(req, updateWebhookSchema);

  const webhook = await db.webhook.update({
    where: { id: params.id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.url !== undefined && { url: data.url }),
      ...(data.events !== undefined && { events: data.events }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
      ...(data.integrationId !== undefined && { integrationId: data.integrationId }),
    },
    select: { id: true, name: true, url: true, events: true, isActive: true },
  });

  void writeAudit({
    userId: admin.id,
    action: 'update',
    entity: 'Webhook',
    entityId: webhook.id,
    changes: data,
    ipAddress: getClientIp(req),
  });

  return NextResponse.json({ webhook });
});

export const DELETE = handle(async (req: NextRequest, { params }) => {
  const admin = await requireAdmin();

  const webhook = await db.webhook.findUnique({ where: { id: params.id } });
  if (!webhook) throw notFound('Webhook not found');

  await db.webhook.delete({ where: { id: params.id } });

  void writeAudit({
    userId: admin.id,
    action: 'delete',
    entity: 'Webhook',
    entityId: params.id,
    changes: { name: webhook.name },
    ipAddress: getClientIp(req),
  });

  return NextResponse.json({ success: true });
});
