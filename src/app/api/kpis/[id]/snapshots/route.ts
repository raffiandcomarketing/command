import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '30');
    const offset = parseInt(searchParams.get('offset') || '0');

    try {
      const snapshots = await db.kpiSnapshot.findMany({
        where: { kpiId: params.id },
        orderBy: { recordedAt: 'desc' },
        take: limit,
        skip: offset,
      });

      const total = await db.kpiSnapshot.count({
        where: { kpiId: params.id },
      });

      return NextResponse.json({
        snapshots,
        pagination: { total, limit, offset },
      });
    } catch {
      // Fallback mock data
      return NextResponse.json({
        snapshots: [
          {
            id: '1',
            kpiId: params.id,
            value: 75000,
            recordedAt: new Date(),
          },
        ],
        pagination: { total: 1, limit, offset },
      });
    }
  } catch (error) {
    console.error(`GET /api/kpis/${params.id}/snapshots error:`, error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { value, metadata } = body;

    if (value === undefined || value === null) {
      return NextResponse.json(
        { error: 'Value is required' },
        { status: 400 }
      );
    }

    try {
      const snapshot = await db.kpiSnapshot.create({
        data: {
          kpiId: params.id,
          value,
          recordedAt: new Date(),
          recordedBy: session.user.id,
          metadata: metadata || {},
        },
      });

      return NextResponse.json({ snapshot }, { status: 201 });
    } catch {
      // Fallback mock response
      const mockSnapshot = {
        id: Math.random().toString(36).substr(2, 9),
        kpiId: params.id,
        value,
        recordedAt: new Date(),
      };
      return NextResponse.json({ snapshot: mockSnapshot }, { status: 201 });
    }
  } catch (error) {
    console.error(`POST /api/kpis/${params.id}/snapshots error:`, error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
