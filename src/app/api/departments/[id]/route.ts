import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { handle, parseBody } from '@/lib/api/http';
import { requireSession, requireAdmin, getClientIp } from '@/lib/api/guard';
import { notFound, badRequest } from '@/lib/api/errors';
import { writeAudit } from '@/lib/api/audit';
import { updateDepartmentSchema } from '@/lib/validate';

export const GET = handle(async (_req: NextRequest, { params }) => {
  await requireSession();
  const department = await db.department.findUnique({
    where: { id: params.id },
    include: {
      roles: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
      _count: { select: { userDepartments: true, tasks: true } },
    },
  });
  if (!department) throw notFound('Department not found');
  return NextResponse.json({ department });
});

export const PATCH = handle(async (req: NextRequest, { params }) => {
  const admin = await requireAdmin();

  const data = await parseBody(req, updateDepartmentSchema);

  const department = await db.department.update({
    where: { id: params.id },
    data,
  });

  void writeAudit({
    userId: admin.id,
    action: 'update',
    entity: 'Department',
    entityId: department.id,
    changes: data,
    ipAddress: getClientIp(req),
  });

  return NextResponse.json({ department });
});

export const DELETE = handle(async (req: NextRequest, { params }) => {
  const admin = await requireAdmin();

  const dept = await db.department.findUnique({
    where: { id: params.id },
    include: { _count: { select: { userDepartments: true, tasks: true } } },
  });
  if (!dept) throw notFound('Department not found');
  if (dept._count.userDepartments > 0) {
    throw badRequest('This department has members. Reassign them before deleting.');
  }

  await db.department.delete({ where: { id: params.id } });

  void writeAudit({
    userId: admin.id,
    action: 'delete',
    entity: 'Department',
    entityId: params.id,
    changes: { name: dept.name },
    ipAddress: getClientIp(req),
  });

  return NextResponse.json({ success: true });
});
