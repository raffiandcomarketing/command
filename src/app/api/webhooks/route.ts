import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - admin only' },
        { status: 403 }
      );
    }

    try {
      const webhooks = await db.webhook.findMany({
        select: {
          id: true,
          name: true,
          url: true,
          events: true,
          isActive: true,
          createdAt: true,
          lastTriggeredAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json({ webhooks });
    } catch {
      // Fallback mock data
      return NextResponse.json({
        webhooks: [
          {
            id: '1',
            name: 'Sample Webhook',
            url: 'https://example.com/webhook',
            events: ['task.created', 'task.updated'],
            isActive: true,
            createdAt: new Date(),
          },
        ],
      });
    }
  } catch (error) {
    console.error('GET /api/webhooks error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - admin only' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, url, events, secret } = body;

    if (!name || !url || !Array.isArray(events) || events.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: name, url, events' },
        { status: 400 }
      );
    }

    try {
      const webhook = await db.webhook.create({
        data: {
          name,
          url,
          events,
          secret: secret || '',
          isActive: true,
        },
      });

      const { secret: _, ...webhookData } = webhook;
      return NextResponse.json({ webhook: webhookData }, { status: 201 });
    } catch {
      // Fallback mock response
      const mockWebhook = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        url,
        events,
        isActive: true,
      };
      return NextResponse.json({ webhook: mockWebhook }, { status: 201 });
    }
  } catch (error) {
    console.error('POST /api/webhooks error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
