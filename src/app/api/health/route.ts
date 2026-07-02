import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * Dedicated health endpoint (assessment R15/TD21).
 * Railway's health-check points here; returns 503 when the DB is down
 * instead of the old misleading 302-on-"/" signal.
 */
export async function GET() {
  try {
    await db.$queryRaw`SELECT 1`;
    return NextResponse.json({
      status: 'ok',
      db: 'up',
      time: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { status: 'degraded', db: 'down', time: new Date().toISOString() },
      { status: 503 }
    );
  }
}
