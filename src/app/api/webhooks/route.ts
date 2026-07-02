import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { handle, parseBody } from '@/lib/api/http';
import { requireAdmin, getClientIp } from '@/lib/api/guard';
import { badRequest } from '@/lib/api/errors';
import { writeAudit } from '@/lib/api/audit';
import { createWebhookSchema } from '@/lib/validate';
import { encryptSecret, encryptionAvailable } from '@/lib/security/crypto';

export const GET = handle(async (_req: NextRequest) => {
  await requireAdmin();

  const webhooks = await db.webhook.findMany({
    select: {
      id: true,
      name: true,
      url: true,
      events: true,
      isActive: true,
      createdAt: true,
      lastTriggeredAt: true,
      failureCount: true,
      integrationId: true,
      // secret intentionally excluded
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ webhooks });
});

export const POST = handle(async (req: NextRequest) => {
  const admin = await requireAdmin();

  if (!encryptionAvailable()) {
    throw badRequest(
      'APP_ENCRYPTION_KEY is not configured. Set it in the environment before creating webhooks so signing secrets can be stored encrypted (assessment R7).'
    );
  }

  const data = await parseBody(req, createWebhookSchema);

  // Server-generated signing secret, returned exactly once.
  const plainSecret = crypto.randomBytes(32).toString('hex');

  const webhook = await db.webhook.create({
    data: {
      name: data.name,
      url: data.url,
      secret: encryptSecret(plainSecret),
      events: data.events,
      isActive: data.isActive ?? true,
      integrationId: data.integrationId ?? null,
    },
    select: { id: true, name: true, url: true, events: true, isActive: true, createdAt: true },
  });

  void writeAudit({
    userId: admin.id,
    action: 'create',
    entity: 'Webhook',
    entityId: webhook.id,
    changes: { name: webhook.name, url: webhook.url },
    ipAddress: getClientIp(req),
  });

  return NextResponse.json(
    {
      webhook,
      secret: plainSecret,
      note: 'Store this signing secret now - it is shown only once and saved encrypted.',
    },
    { status: 201 }
  );
});
