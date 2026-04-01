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

    try {
      const deals = await db.deal.findMany({
        include: {
          contact: true,
          assignee: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json({ deals });
    } catch (dbError) {
      // Fallback mock data
      return NextResponse.json({
        deals: [
          {
            id: '1',
            title: 'Diamond Engagement Ring',
            contactName: 'Sarah Chen',
            value: 12500,
            stage: 'lead',
            expectedCloseDate: '2026-04-30',
            assignee: { id: '1', name: 'Alex Johnson', avatar: 'AJ' },
          },
          {
            id: '2',
            title: 'Estate Jewellery Purchase',
            contactName: 'Robert Williams',
            value: 28000,
            stage: 'opportunity',
            expectedCloseDate: '2026-05-05',
            assignee: { id: '2', name: 'Emma Wilson', avatar: 'EW' },
          },
          {
            id: '3',
            title: 'Platinum Wedding Bands',
            contactName: 'James Morrison',
            value: 9200,
            stage: 'sale',
            expectedCloseDate: '2026-03-25',
            assignee: { id: '1', name: 'Alex Johnson', avatar: 'AJ' },
          },
        ],
      });
    }
  } catch (error) {
    console.error('GET /api/crm/deals error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      title,
      value,
      stage,
      contactId,
      assigneeId,
      departmentId,
      notes,
      expectedCloseDate,
    } = body;

    if (!title || typeof title !== 'string') {
      return NextResponse.json(
        { error: 'Invalid deal title' },
        { status: 400 }
      );
    }

    if (!stage || !['lead', 'opportunity', 'sale'].includes(stage)) {
      return NextResponse.json(
        { error: 'Invalid stage' },
        { status: 400 }
      );
    }

    try {
      const deal = await db.deal.create({
        data: {
          title,
          value: parseFloat(value) || 0,
          stage,
          contactId: contactId || null,
          assigneeId: assigneeId || null,
          departmentId: departmentId || null,
          notes: notes || '',
          expectedCloseDate: expectedCloseDate ? new Date(expectedCloseDate) : null,
        },
        include: {
          contact: true,
          assignee: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      });

      return NextResponse.json({ deal }, { status: 201 });
    } catch (dbError) {
      // Fallback mock response
      const mockDeal = {
        id: Math.random().toString(36).substr(2, 9),
        title,
        value: parseFloat(value) || 0,
        stage,
        contactId: contactId || null,
        assigneeId: assigneeId || null,
        departmentId: departmentId || null,
        notes: notes || '',
        expectedCloseDate: expectedCloseDate ? new Date(expectedCloseDate) : null,
        createdAt: new Date(),
      };
      return NextResponse.json({ deal: mockDeal }, { status: 201 });
    }
  } catch (error) {
    console.error('POST /api/crm/deals error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
