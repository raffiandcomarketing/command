import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { handle, parseBody, getPagination } from '@/lib/api/http';
import { requireSession, assertCanWrite, getClientIp } from '@/lib/api/guard';
import { writeAudit } from '@/lib/api/audit';
import { createContactSchema } from '@/lib/validate';

export const GET = handle(async (req: NextRequest) => {
  await requireSession();

  const sp = req.nextUrl.searchParams;
  const search = sp.get('search')?.trim() || undefined;
  const p = getPagination(req, 50);

  const where: Prisma.CrmContactWhereInput = {
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  const [contacts, total] = await Promise.all([
    db.crmContact.findMany({
      where,
      include: { _count: { select: { deals: true } } },
      orderBy: { name: 'asc' },
      skip: p.skip,
      take: p.take,
    }),
    db.crmContact.count({ where }),
  ]);

  return NextResponse.json({
    contacts,
    pagination: { total, page: p.page, pageSize: p.pageSize, pages: Math.max(1, Math.ceil(total / p.pageSize)) },
  });
});

export const POST = handle(async (req: NextRequest) => {
  const user = await requireSession();
  assertCanWrite(user);

  const data = await parseBody(req, createContactSchema);

  const contact = await db.crmContact.create({
    data: {
      name: data.name,
      email: data.email ?? null,
      phone: data.phone ?? null,
      company: data.company ?? null,
      notes: data.notes ?? null,
      departmentId: data.departmentId ?? null,
      createdById: user.id,
    },
  });

  void writeAudit({
    userId: user.id,
    action: 'create',
    entity: 'CrmContact',
    entityId: contact.id,
    changes: { name: contact.name },
    ipAddress: getClientIp(req),
  });

  return NextResponse.json({ contact }, { status: 201 });
});
