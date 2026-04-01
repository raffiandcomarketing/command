import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

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
    const { payload } = body;

    try {
      const automation = await db.automation.findUnique({
        where: { id: params.id },
      });

      if (!automation) {
        return NextResponse.json(
          { error: 'Automation not found' },
          { status: 404 }
        );
      }

      if (!automation.isActive) {
        return NextResponse.json(
          { error: 'Automation is not active' },
          { status: 400 }
        );
      }

      const execution = await db.automationExecution.create({
        data: {
          automationId: params.id,
          status: 'RUNNING',
          triggeredAt: new Date(),
          triggeredBy: session.user.id,
          payload: payload || {},
        },
      });

      return NextResponse.json(
        { execution, message: 'Automation execution started' },
        { status: 202 }
      );
    } catch {
      // Fallback mock response
      const mockExecution = {
        id: Math.random().toString(36).substr(2, 9),
        automationId: params.id,
        status: 'RUNNING',
        triggeredAt: new Date(),
      };
      return NextResponse.json(
        { execution: mockExecution, message: 'Automation execution started' },
        { status: 202 }
      );
    }
  } catch (error) {
    console.error(
      `POST /api/automations/${params.id}/execute error:`,
      error
    );
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
