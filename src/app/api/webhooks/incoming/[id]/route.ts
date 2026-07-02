import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { handle } from '@/lib/api/http';
import { notFound, unauthorized, badRequest } from '@/lib/api/errors';
import { decryptSecret } from '@/lib/security/crypto';
import { log } from '@/lib/log';

/**
 * Verified inbound webhook receiver. The payload is recorded in WebhookLog;
 * signature verification uses the stored (encrypted) secret with HMAC-SHA256.
 */
export const POST = handle(async (req: NextRequest, { params }) => {
  const body = await req.text();
  const signature = req.headers.get('x-webhook-signature');

  const webhook = await db.webhook.findUnique({ where: { id: params.id } });
  if (!webhook || !webhook.isActive) throw notFound('Webhook not found');

  if (!signature) throw unauthorized('Missing x-webhook-signature header');

  let secret: string;
  try {
    secret = decryptSecret(webhook.secret);
  } catch {
    log.error('Webhook secret cannot be decrypted - APP_ENCRYPTION_KEY missing or changed', { webhookId: webhook.id });
    throw badRequest('Webhook signing secret unavailable');
  }

  const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');
  const provided = signature.replace(/^sha256=/, '');

  const expectedBuf = Buffer.from(expected, 'hex');
  let providedBuf: Buffer;
  try {
    providedBuf = Buffer.from(provided, 'hex');
  } catch {
    throw unauthorized('Invalid signature');
  }
  if (expectedBuf.length !== providedBuf.length || !crypto.timingSafeEqual(expectedBuf, providedBuf)) {
    await db.webhookLog.create({
      data: {
        webhookId: webhook.id,
        event: 'incoming.rejected',
        payload: { reason: 'invalid-signature' },
        success: false,
      },
    });
    throw unauthorized('Invalid signature');
  }

  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    payload = { raw: body.slice(0, 10_000) };
  }

  await db.webhookLog.create({
    data: {
      webhookId: webhook.id,
      event: 'incoming.received',
      payload: payload as object,
      success: true,
      statusCode: 200,
    },
  });

  await db.webhook.update({
    where: { id: webhook.id },
    data: { lastTriggeredAt: new Date() },
  });

  return NextResponse.json({ received: true });
});
