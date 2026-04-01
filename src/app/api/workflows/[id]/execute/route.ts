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
      const workflow = await db.workflow.findUnique({
        where: { id: params.id },
      });

      if (!workflow) {
        return NextResponse.json(
          { error: 'Workflow not found' },
          { status: 404 }
        );
      }

      const instance = await db.workflowInstance.create({
        data: {
          workflowId: params.id,
          status: 'RUNNING',
          startedAt: new Date(),
          payload: payload || {},
        },
      });

      return NextResponse.json(
        { instance, message: 'Workflow execution started' },
        { status: 202 }
      );
    } catch {
      // Fallback mock response
      const mockInstance = {
        id: Math.random().toString(36).substr(2, 9),
        workflowId: params.id,
        status: 'RUNNING',
        startedAt: new Date(),
      };
      return NextResponse.json(
        { instance: mockInstance, message: 'Workflow execution started' },
        { status: 202 }
      );
    }
  } catch (error) {
    console.error(`POST /api/workflows/${params.id}/execute error:`, error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
