import crypto from 'crypto';
import { db } from '@/lib/db';

/**
 * Webhook event types
 */
export enum WebhookEventType {
  TASK_CREATED = 'task.created',
  TASK_UPDATED = 'task.updated',
  TASK_COMPLETED = 'task.completed',
  APPROVAL_REQUESTED = 'approval.requested',
  APPROVAL_APPROVED = 'approval.approved',
  APPROVAL_REJECTED = 'approval.rejected',
  WORKFLOW_STARTED = 'workflow.started',
  WORKFLOW_COMPLETED = 'workflow.completed',
  AUTOMATION_TRIGGERED = 'automation.triggered',
  NOTIFICATION_SENT = 'notification.sent',
}

/**
 * Webhook payload structure
 */
export interface WebhookPayload {
  event: WebhookEventType;
  timestamp: string;
  data: Record<string, any>;
}

/**
 * Webhook signature for verification
 */
export interface WebhookSignature {
  signature: string;
  timestamp: string;
}

/**
 * Generate HMAC signature for webhook
 */
export function generateWebhookSignature(
  payload: string,
  secret: string,
  timestamp: string
): string {
  const message = `${timestamp}.${payload}`;
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(message);
  return hmac.digest('hex');
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string,
  timestamp: string,
  tolerance: number = 300000 // 5 minutes
): boolean {
  // Check timestamp to prevent replay attacks
  const now = Date.now();
  const payloadTime = parseInt(timestamp, 10);

  if (isNaN(payloadTime) || Math.abs(now - payloadTime) > tolerance) {
    return false;
  }

  // Verify signature
  const expectedSignature = generateWebhookSignature(payload, secret, timestamp);
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

/**
 * Retry configuration for failed webhooks
 */
export interface RetryConfig {
  maxAttempts?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
}

/**
 * Send a webhook to a URL with HMAC signing
 */
export async function sendWebhook(
  url: string,
  secret: string,
  event: WebhookEventType,
  data: Record<string, any>,
  retryConfig: RetryConfig = {}
): Promise<{
  success: boolean;
  statusCode?: number;
  error?: string;
}> {
  const {
    maxAttempts = 3,
    initialDelayMs = 1000,
    maxDelayMs = 30000,
    backoffMultiplier = 2,
  } = retryConfig;

  const payload: WebhookPayload = {
    event,
    timestamp: new Date().toISOString(),
    data,
  };

  const payloadString = JSON.stringify(payload);
  const timestamp = Date.now().toString();
  const signature = generateWebhookSignature(payloadString, secret, timestamp);

  let lastError: Error | null = null;
  let lastStatusCode: number | undefined;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Webhook-Timestamp': timestamp,
          'User-Agent': 'CommandCentre/1.0',
        },
        body: payloadString,
      });

      lastStatusCode = response.status;

      if (response.ok) {
        return { success: true, statusCode: response.status };
      }

      // Don't retry on client errors (4xx)
      if (response.status >= 400 && response.status < 500) {
        return {
          success: false,
          statusCode: response.status,
          error: `Client error: ${response.statusText}`,
        };
      }

      lastError = new Error(`Server error: ${response.statusText}`);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
    }

    // Calculate backoff delay for next attempt
    if (attempt < maxAttempts - 1) {
      const delay = Math.min(
        initialDelayMs * Math.pow(backoffMultiplier, attempt),
        maxDelayMs
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  return {
    success: false,
    statusCode: lastStatusCode,
    error: lastError?.message || 'Unknown error',
  };
}

/**
 * Retry a failed webhook
 */
export async function retryWebhook(
  webhookId: string,
  retryConfig: RetryConfig = {}
): Promise<boolean> {
  const webhook = await db.webhook.findUnique({
    where: { id: webhookId },
  });

  if (!webhook) {
    console.error(`Webhook ${webhookId} not found`);
    return false;
  }

  // Get the last webhook log to retry
  const lastLog = await db.webhookLog.findFirst({
    where: { webhookId },
    orderBy: { createdAt: 'desc' },
  });

  if (!lastLog) {
    console.error(`No webhook log found for webhook ${webhookId}`);
    return false;
  }

  const event = lastLog.event as WebhookEventType;
  const payload = lastLog.payload as Record<string, any>;

  const result = await sendWebhook(
    webhook.url,
    webhook.secret,
    event,
    payload,
    retryConfig
  );

  // Log the retry attempt
  await db.webhookLog.create({
    data: {
      webhookId,
      event: lastLog.event,
      payload: lastLog.payload,
      response: result.success ? { message: 'Retry successful' } : { error: result.error },
      statusCode: result.statusCode,
      success: result.success,
    },
  });

  // Update webhook failure count
  if (result.success) {
    await db.webhook.update({
      where: { id: webhookId },
      data: {
        failureCount: 0,
        lastTriggeredAt: new Date(),
      },
    });
  } else {
    await db.webhook.update({
      where: { id: webhookId },
      data: {
        failureCount: { increment: 1 },
      },
    });
  }

  return result.success;
}

/**
 * Send webhook and log the attempt
 */
export async function sendWebhookWithLogging(
  webhookId: string,
  event: WebhookEventType,
  data: Record<string, any>,
  retryConfig: RetryConfig = {}
): Promise<boolean> {
  const webhook = await db.webhook.findUnique({
    where: { id: webhookId },
  });

  if (!webhook) {
    console.error(`Webhook ${webhookId} not found`);
    return false;
  }

  const result = await sendWebhook(
    webhook.url,
    webhook.secret,
    event,
    data,
    retryConfig
  );

  // Log the webhook attempt
  await db.webhookLog.create({
    data: {
      webhookId,
      event: event,
      payload: data as any,
      response: result.success ? { message: 'Success' } : { error: result.error },
      statusCode: result.statusCode,
      success: result.success,
    },
  });

  // Update webhook metrics
  if (result.success) {
    await db.webhook.update({
      where: { id: webhookId },
      data: {
        failureCount: 0,
        lastTriggeredAt: new Date(),
      },
    });
  } else {
    await db.webhook.update({
      where: { id: webhookId },
      data: {
        failureCount: { increment: 1 },
      },
    });

    // If too many failures, disable webhook
    if (webhook.failureCount + 1 >= 10) {
      await db.webhook.update({
        where: { id: webhookId },
        data: { isActive: false },
      });

      console.warn(`Webhook ${webhookId} disabled due to repeated failures`);
    }
  }

  return result.success;
}
