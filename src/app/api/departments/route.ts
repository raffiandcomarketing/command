import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { handle, parseBody } from '@/lib/api/http';
import { requireSession, requireAdmin, getClientIp } from '@/lib/api/guard';
import { writeAudit } from '@/lib/api/audit';
import { createDepartmentSchema } from '@/lib/validate';
import { slugify } from '@/lib/utils';

export const GET = handle(async (req: NextRequest) => {
  await requireSession();

  const sp = req.nextUrl.searchParams;
  const search = sp.get('search')?.trim() || undefined;
  const isActive = sp.get('isActive');

  // Fixed: old query included a non-existent `members` relation;
  // the schema relation is `userDepartments`.
  const where: Prisma.DepartmentWhereInput = {
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ],
    }),
    ...(isActive !== null && isActive !== undefined && { isActive: isActive === 'true' }),
  };

  const departments = await db.department.findMany({
    where,
    include: {
      _count: { select: { roles: true, userDepartments: true, tasks: true } },
    },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
  });

  return NextResponse.json({
    departments: departments.map((d) => ({
      ...d,
      roleCount: d._count.roles,
      memberCount: d._count.userDepartments,
      taskCount: d._count.tasks,
    })),
  });
});

export const POST = handle(async (req: NextRequest) => {
  const admin = await requireAdmin();

  const data = await parseBody(req, createDepartmentSchema);

  const department = await db.department.create({
    data: {
      name: data.name,
      slug: data.slug ?? slugify(data.name),
      description: data.description ?? null,
      icon: data.icon ?? null,
      color: data.color ?? null,
      sortOrder: data.sortOrder ?? 0,
      isActive: data.isActive ?? true,
      parentId: data.parentId ?? null,
    },
  });

  void writeAudit({
    userId: admin.id,
    action: 'create',
    entity: 'Department',
    entityId: department.id,
    changes: { name: department.name, slug: department.slug },
    ipAddress: getClientIp(req),
  });

  return NextResponse.json({ department }, { status: 201 });
});
