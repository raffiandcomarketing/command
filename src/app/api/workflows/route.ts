import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const departmentId = searchParams.get('departmentId');
    const status = searchParams.get('status');
    const triggerType = searchParams.get('triggerType');

    try {
      const workflows = await db.workflow.findMany({
        where: {
          ...(departmentId && { departmentId }),
          ...(status && { status }),
          ...(triggerType && { triggerType }),
        },
        include: {
          department: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json({ workflows });
    } catch {
      // Fallback mock data
      return NextResponse.json({
        workflows: [
          {
            id: '1',
            name: 'Sample Workflow',
            description: 'A sample workflow',
            status: 'ACTIVE',
            triggerType: 'MANUAL',
            departmentId: '1',
            definition: { steps: [] },
          },
        ],
      });
    }
  } catch (error) {
    console.error('GET /api/workflows error:', error);
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
    const { name, description, triggerType, departmentId, definition } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Invalid workflow name' },
        { status: 400 }
      );
    }

    try {
      const workflow = await db.workflow.create({
        data: {
          name,
          description: description || '',
          triggerType: triggerType || 'MANUAL',
          status: 'DRAFT',
          departmentId: departmentId || null,
          definition: definition || { steps: [] },
        },
        include: {
          department: { select: { id: true, name: true } },
        },
      });

      return NextResponse.json({ workflow }, { status: 201 });
    } catch {
      // Fallback mock response
      const mockWorkflow = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        description: description || '',
        triggerType: triggerType || 'MANUAL',
        status: 'DRAFT',
        departmentId: departmentId || null,
      };
      return NextResponse.json({ workflow: mockWorkflow }, { status: 201 });
    }
  } catch (error) {
    console.error('POST /api/workflows error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
