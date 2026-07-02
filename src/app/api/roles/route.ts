import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { handle, parseBody } from '@/lib/api/http';
import { requireSession, requireAdmin, getClientIp } from '@/lib/api/guard';
import { writeAudit } from '@/lib/api/audit';
import { createRoleSchema } from '@/lib/validate';
import { slugify } from '@/lib/utils';

export const GET = handle(async (req: NextRequest) => {
  await requireSession();

  const sp = req.nextUrl.searchParams;
  const departmentId = sp.get('departmentId') || undefined;
  const search = sp.get('search')?.trim() || undefined;

  const where: Prisma.RoleWhereInput = {
    ...(departmentId && { departmentId }),
    ...(search && { title: { contains: search, mode: 'insensitive' } }),
  };

  const roles = await db.role.findMany({
    where,
    include: {
      department: { select: { id: true, name: true, slug: true } },
      _count: { select: { userDepartments: true } },
    },
    orderBy: [{ department: { sortOrder: 'asc' } }, { sortOrder: 'asc' }],
  });

  return NextResponse.json({ roles });
});

export const POST = handle(async (req: NextRequest) => {
  const admin = await requireAdmin();

  const data = await parseBody(req, createRoleSchema);

  const role = await db.role.create({
    data: {
      title: data.title,
      slug: data.slug ?? slugify(data.title),
      description: data.description ?? null,
      departmentId: data.departmentId,
      sortOrder: data.sortOrder ?? 0,
      isActive: data.isActive ?? true,
    },
    include: { department: { select: { id: true, name: true, slug: true } } },
  });

  void writeAudit({
    userId: admin.id,
    action: 'create',
    entity: 'Role',
    entityId: role.id,
    changes: { title: role.title, departmentId: role.departmentId },
    ipAddress: getClientIp(req),
  });

  return NextResponse.json({ role }, { status: 201 });
});
