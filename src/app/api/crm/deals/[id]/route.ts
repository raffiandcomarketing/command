import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { handle, parseBody } from '@/lib/api/http';
import { requireSession, assertCanWrite, assertOwnershipOr, getClientIp } from '@/lib/api/guard';
import { notFound } from '@/lib/api/errors';
import { writeAudit, logActivity } from '@/lib/api/audit';
import { updateDealSchema } from '@/lib/validate';

const dealInclude = {
  contact: true,
  assignee: { select: { id: true, name: true, email: true, avatar: true } },
  department: { select: { id: true, name: true, slug: true } },
};

export const GET = handle(async (_req: NextRequest, { params }) => {
  await requireSession();
  const deal = await db.crmDeal.findUnique({ where: { id: params.id }, include: dealInclude });
  if (!deal) throw notFound('Deal not found');
  return NextResponse.json({ deal });
});

export const PATCH = handle(async (req: NextRequest, { params }) => {
  const user = await requireSession();
  assertCanWrite(user);

  const existing = await db.crmDeal.findUnique({ where: { id: params.id } });
  if (!existing) throw notFound('Deal not found');
  assertOwnershipOr(user, [existing.assigneeId], 'Only the deal owner or a manager can modify this deal');

  const data = await parseBody(req, updateDealSchema);
  const movingToSale = data.stage === 'SALE' && existing.stage !== 'SALE';

  const deal = await db.crmDeal.update({
    where: { id: params.id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.value !== undefined && { value: data.value }),
      ...(data.stage !== undefined && { stage: data.stage }),
      ...(data.contactId !== undefined && { contactId: data.contactId }),
      ...(data.assigneeId !== undefined && { assigneeId: data.assigneeId }),
      ...(data.departmentId !== undefined && { departmentId: data.departmentId }),
      ...(data.notes !== undefined && { notes: data.notes }),
      ...(data.expectedCloseDate !== undefined && { expectedCloseDate: data.expectedCloseDate }),
      ...(movingToSale && { closedAt: new Date() }),
    },
    include: dealInclude,
  });

  void writeAudit({
    userId: user.id,
    action: 'update',
    entity: 'CrmDeal',
    entityId: deal.id,
    changes: data,
    ipAddress: getClientIp(req),
  });
  if (data.stage !== undefined && data.stage !== existing.stage) {
    void logActivity({
      userId: user.id,
      type: 'crm.deal.stage_changed',
      description: `moved "${deal.title}" to ${deal.stage.toLowerCase()}`,
      entityType: 'CrmDeal',
      entityId: deal.id,
      departmentId: deal.departmentId,
    });
  }

  return NextResponse.json({ deal });
});

export const DELETE = handle(async (req: NextRequest, { params }) => {
  const user = await requireSession();
  assertCanWrite(user);

  const existing = await db.crmDeal.findUnique({ where: { id: params.id } });
  if (!existing) throw notFound('Deal not found');
  assertOwnershipOr(user, [existing.assigneeId], 'Only the deal owner or a manager can delete this deal');

  await db.crmDeal.delete({ where: { id: params.id } });

  void writeAudit({
    userId: user.id,
    action: 'delete',
    entity: 'CrmDeal',
    entityId: params.id,
    changes: { title: existing.title },
    ipAddress: getClientIp(req),
  });

  return NextResponse.json({ success: true });
});
