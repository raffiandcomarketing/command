import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { handle, parseBody } from '@/lib/api/http';
import { requireSession, assertCanWrite, assertOwnershipOr, getClientIp } from '@/lib/api/guard';
import { notFound, badRequest } from '@/lib/api/errors';
import { writeAudit } from '@/lib/api/audit';
import { updateContactSchema } from '@/lib/validate';

export const GET = handle(async (_req: NextRequest, { params }) => {
  await requireSession();
  const contact = await db.crmContact.findUnique({
    where: { id: params.id },
    include: { deals: { orderBy: { createdAt: 'desc' } } },
  });
  if (!contact) throw notFound('Contact not found');
  return NextResponse.json({ contact });
});

export const PATCH = handle(async (req: NextRequest, { params }) => {
  const user = await requireSession();
  assertCanWrite(user);

  const existing = await db.crmContact.findUnique({ where: { id: params.id } });
  if (!existing) throw notFound('Contact not found');
  assertOwnershipOr(user, [existing.createdById], 'Only the contact owner or a manager can modify this contact');

  const data = await parseBody(req, updateContactSchema);

  const contact = await db.crmContact.update({
    where: { id: params.id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.email !== undefined && { email: data.email }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.company !== undefined && { company: data.company }),
      ...(data.notes !== undefined && { notes: data.notes }),
      ...(data.departmentId !== undefined && { departmentId: data.departmentId }),
    },
  });

  void writeAudit({
    userId: user.id,
    action: 'update',
    entity: 'CrmContact',
    entityId: contact.id,
    changes: data,
    ipAddress: getClientIp(req),
  });

  return NextResponse.json({ contact });
});

export const DELETE = handle(async (req: NextRequest, { params }) => {
  const user = await requireSession();
  assertCanWrite(user);

  const existing = await db.crmContact.findUnique({
    where: { id: params.id },
    include: { _count: { select: { deals: true } } },
  });
  if (!existing) throw notFound('Contact not found');
  assertOwnershipOr(user, [existing.createdById], 'Only the contact owner or a manager can delete this contact');
  if (existing._count.deals > 0) {
    throw badRequest('This contact has deals attached. Reassign or delete the deals first.');
  }

  await db.crmContact.delete({ where: { id: params.id } });

  void writeAudit({
    userId: user.id,
    action: 'delete',
    entity: 'CrmContact',
    entityId: params.id,
    changes: { name: existing.name },
    ipAddress: getClientIp(req),
  });

  return NextResponse.json({ success: true });
});
