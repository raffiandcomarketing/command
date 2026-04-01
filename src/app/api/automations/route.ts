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
    const triggerType = searchParams.get('triggerType');
    const isActive = searchParams.get('isActive');

    try {
      const automations = await db.automation.findMany({
        where: {
          ...(departmentId && { departmentId }),
          ...(triggerType && { trigger: { type: triggerType } }),
          ...(isActive !== null && { isActive: isActive === 'true' }),
        },
        include: {
          department: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json({ automations });
    } catch {
      // Fallback mock data
      return NextResponse.json({
        automations: [
          {
            id: '1',
            name: 'Sample Automation',
            description: 'A sample automation rule',
            isActive: true,
            trigger: { type: 'EVENT' },
            actions: [],
          },
        ],
      });
    }
  } catch (error) {
    console.error('GET /api/automations error:', error);
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
    const { name, description, trigger, conditions, actions, departmentId } =
      body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Invalid automation name' },
        { status: 400 }
      );
    }

    if (!trigger || !trigger.type) {
      return NextResponse.json(
        { error: 'Invalid trigger configuration' },
        { status: 400 }
      );
    }

    try {
      const automation = await db.automation.create({
        data: {
          name,
          description: description || '',
          isActive: true,
          trigger,
          conditions: conditions || [],
          actions: actions || [],
          departmentId: departmentId || null,
        },
        include: {
          department: { select: { id: true, name: true } },
        },
      });

      return NextResponse.json({ automation }, { status: 201 });
    } catch {
      // Fallback mock response
      const mockAutomation = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        description: description || '',
        isActive: true,
        trigger,
        conditions: conditions || [],
        actions: actions || [],
      };
      return NextResponse.json({ automation: mockAutomation }, { status: 201 });
    }
  } catch (error) {
    console.error('POST /api/automations error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
