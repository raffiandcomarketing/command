import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { handle, parseBody } from '@/lib/api/http';
import { requireAdmin, getClientIp } from '@/lib/api/guard';
import { notFound, badRequest } from '@/lib/api/errors';
import { writeAudit } from '@/lib/api/audit';
import { updateRoleSchema } from '@/lib/validate';

export const PATCH = handle(async (req: NextRequest, { params }) => {
  const admin = await requireAdmin();

  const data = await parseBody(req, updateRoleSchema);

  const role = await db.role.update({
    where: { id: params.id },
    data,
    include: { department: { select: { id: true, name: true, slug: true } } },
  });

  void writeAudit({
    userId: admin.id,
    action: 'update',
    entity: 'Role',
    entityId: role.id,
    changes: data,
    ipAddress: getClientIp(req),
  });

  return NextResponse.json({ role });
});

export const DELETE = handle(async (req: NextRequest, { params }) => {
  const admin = await requireAdmin();

  const role = await db.role.findUnique({
    where: { id: params.id },
    include: { _count: { select: { userDepartments: true } } },
  });
  if (!role) throw notFound('Role not found');
  if (role._count.userDepartments > 0) {
    throw badRequest('This role has members assigned. Reassign them before deleting.');
  }

  await db.role.delete({ where: { id: params.id } });

  void writeAudit({
    userId: admin.id,
    action: 'delete',
    entity: 'Role',
    entityId: params.id,
    changes: { title: role.title },
    ipAddress: getClientIp(req),
  });

  return NextResponse.json({ success: true });
});
