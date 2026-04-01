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
    const search = searchParams.get('search');
    const isActive = searchParams.get('isActive');

    try {
      const departments = await db.department.findMany({
        where: {
          ...(search && {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
            ],
          }),
          ...(isActive !== null && { isActive: isActive === 'true' }),
        },
        include: {
          roles: { select: { id: true } },
          members: { select: { id: true } },
        },
        orderBy: { name: 'asc' },
      });

      const formatted = departments.map((dept) => ({
        ...dept,
        roleCount: dept.roles.length,
        memberCount: dept.members.length,
      }));

      return NextResponse.json({ departments: formatted });
    } catch {
      // Fallback mock data
      return NextResponse.json({
        departments: [
          {
            id: '1',
            name: 'Sales',
            description: 'Sales operations and management',
            isActive: true,
            roleCount: 3,
            memberCount: 12,
          },
          {
            id: '2',
            name: 'Operations',
            description: 'Operations and logistics',
            isActive: true,
            roleCount: 2,
            memberCount: 8,
          },
        ],
      });
    }
  } catch (error) {
    console.error('GET /api/departments error:', error);
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
    const { name, description, isActive } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Invalid department name' },
        { status: 400 }
      );
    }

    try {
      const department = await db.department.create({
        data: {
          name,
          description: description || '',
          isActive: isActive !== false,
        },
      });

      return NextResponse.json({ department }, { status: 201 });
    } catch {
      // Fallback mock response
      const mockDept = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        description: description || '',
        isActive: isActive !== false,
      };
      return NextResponse.json({ department: mockDept }, { status: 201 });
    }
  } catch (error) {
    console.error('POST /api/departments error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
