import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { handle, parseBody, getPagination } from '@/lib/api/http';
import { requireAdmin, getClientIp } from '@/lib/api/guard';
import { writeAudit } from '@/lib/api/audit';
import { createUserSchema, UserRoleEnum } from '@/lib/validate';
import { assertStrongPassword, hashPassword } from '@/lib/security/password';

const userSelect = {
  id: true,
  email: true,
  name: true,
  avatar: true,
  role: true,
  isActive: true,
  lastLoginAt: true,
  createdAt: true,
  userDepartments: {
    include: {
      department: { select: { id: true, name: true, slug: true } },
      role: { select: { id: true, title: true, slug: true } },
    },
  },
} satisfies Prisma.UserSelect;

export const GET = handle(async (req: NextRequest) => {
  await requireAdmin();

  const sp = req.nextUrl.searchParams;
  const search = sp.get('search')?.trim() || undefined;
  const departmentId = sp.get('departmentId') || undefined;
  const roleParam = UserRoleEnum.safeParse(sp.get('role')?.toUpperCase());
  const p = getPagination(req, 50);

  // Fixed (assessment R4/TD3): the old query used a non-existent
  // `members` relation; the schema relation is `userDepartments`.
  const where: Prisma.UserWhereInput = {
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ],
    }),
    ...(departmentId && { userDepartments: { some: { departmentId } } }),
    ...(roleParam.success && { role: roleParam.data }),
  };

  const [users, total] = await Promise.all([
    db.user.findMany({
      where,
      select: userSelect,
      orderBy: { name: 'asc' },
      skip: p.skip,
      take: p.take,
    }),
    db.user.count({ where }),
  ]);

  return NextResponse.json({
    users,
    pagination: { total, page: p.page, pageSize: p.pageSize, pages: Math.max(1, Math.ceil(total / p.pageSize)) },
  });
});

export const POST = handle(async (req: NextRequest) => {
  const admin = await requireAdmin();

  const data = await parseBody(req, createUserSchema);
  assertStrongPassword(data.password);

  const passwordHash = await hashPassword(data.password);

  const user = await db.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash,
      role: data.role ?? 'MEMBER',
      isActive: data.isActive ?? true,
      avatar: data.avatar ?? null,
      ...(data.departments?.length && {
        userDepartments: {
          create: data.departments.map((d) => ({
            departmentId: d.departmentId,
            roleId: d.roleId,
            isPrimary: d.isPrimary ?? false,
          })),
        },
      }),
    },
    select: userSelect,
  });

  void writeAudit({
    userId: admin.id,
    action: 'create',
    entity: 'User',
    entityId: user.id,
    changes: { email: user.email, role: user.role },
    ipAddress: getClientIp(req),
  });

  return NextResponse.json({ user }, { status: 201 });
});
