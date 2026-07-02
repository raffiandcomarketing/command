import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { handle, parseBody, getPagination } from '@/lib/api/http';
import { requireSession, assertCanWrite, getClientIp } from '@/lib/api/guard';
import { writeAudit, logActivity } from '@/lib/api/audit';
import { createDealSchema, CrmStageEnum } from '@/lib/validate';

const dealInclude = {
  contact: true,
  assignee: { select: { id: true, name: true, email: true, avatar: true } },
  department: { select: { id: true, name: true, slug: true } },
} satisfies Prisma.CrmDealInclude;

export const GET = handle(async (req: NextRequest) => {
  await requireSession();

  const sp = req.nextUrl.searchParams;
  const stageParam = CrmStageEnum.safeParse(sp.get('stage')?.toUpperCase());
  const assigneeId = sp.get('assigneeId') || undefined;
  const search = sp.get('search')?.trim() || undefined;
  const p = getPagination(req, 100);

  const where: Prisma.CrmDealWhereInput = {
    ...(stageParam.success && { stage: stageParam.data }),
    ...(assigneeId && { assigneeId }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { contact: { name: { contains: search, mode: 'insensitive' } } },
      ],
    }),
  };

  // Fixed (assessment R4/TD2): this endpoint previously queried `db.deal`,
  // which does not exist (model is CrmDeal), so it always returned mock data.
  const [deals, total] = await Promise.all([
    db.crmDeal.findMany({
      where,
      include: dealInclude,
      orderBy: { createdAt: 'desc' },
      skip: p.skip,
      take: p.take,
    }),
    db.crmDeal.count({ where }),
  ]);

  return NextResponse.json({
    deals,
    pagination: { total, page: p.page, pageSize: p.pageSize, pages: Math.max(1, Math.ceil(total / p.pageSize)) },
  });
});

export const POST = handle(async (req: NextRequest) => {
  const user = await requireSession();
  assertCanWrite(user);

  const data = await parseBody(req, createDealSchema);

  // Resolve the contact: connect an existing one or create inline by name.
  let contactId = data.contactId;
  if (!contactId && data.contactName) {
    const existing = await db.crmContact.findFirst({
      where: { name: { equals: data.contactName, mode: 'insensitive' } },
    });
    contactId =
      existing?.id ??
      (
        await db.crmContact.create({
          data: {
            name: data.contactName,
            createdById: user.id,
            departmentId: data.departmentId ?? null,
          },
        })
      ).id;
  }

  const deal = await db.crmDeal.create({
    data: {
      title: data.title,
      value: data.value ?? 0,
      stage: data.stage ?? 'LEAD',
      contactId: contactId!,
      assigneeId: data.assigneeId ?? user.id,
      departmentId: data.departmentId ?? null,
      notes: data.notes ?? null,
      expectedCloseDate: data.expectedCloseDate ?? null,
      ...(data.stage === 'SALE' && { closedAt: new Date() }),
    },
    include: dealInclude,
  });

  void writeAudit({
    userId: user.id,
    action: 'create',
    entity: 'CrmDeal',
    entityId: deal.id,
    changes: { title: deal.title, value: deal.value, stage: deal.stage },
    ipAddress: getClientIp(req),
  });
  void logActivity({
    userId: user.id,
    type: 'crm.deal.created',
    description: `added deal "${deal.title}" (${deal.stage.toLowerCase()})`,
    entityType: 'CrmDeal',
    entityId: deal.id,
    departmentId: deal.departmentId,
  });

  return NextResponse.json({ deal }, { status: 201 });
});
