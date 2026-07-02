import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { handle, parseBody } from '@/lib/api/http';
import { requireSession, getClientIp } from '@/lib/api/guard';
import { notFound, forbidden, badRequest } from '@/lib/api/errors';
import { writeAudit } from '@/lib/api/audit';
import { adminUpdateUserSchema, selfUpdateUserSchema } from '@/lib/validate';
import { assertStrongPassword, hashPassword, verifyPassword } from '@/lib/security/password';

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

export const GET = handle(async (_req: NextRequest, { params }) => {
  const actor = await requireSession();
  if (actor.id !== params.id && actor.role !== 'ADMIN') {
    throw forbidden('You can only view your own profile');
  }
  const user = await db.user.findUnique({ where: { id: params.id }, select: userSelect });
  if (!user) throw notFound('User not found');
  return NextResponse.json({ user });
});

export const PATCH = handle(async (req: NextRequest, { params }) => {
  const actor = await requireSession();
  const isSelf = actor.id === params.id;
  const isAdmin = actor.role === 'ADMIN';
  if (!isSelf && !isAdmin) {
    throw forbidden('You can only update your own profile');
  }

  const target = await db.user.findUnique({
    where: { id: params.id },
    include: { userDepartments: true },
  });
  if (!target) throw notFound('User not found');

  const update: Prisma.UserUpdateInput = {};
  let auditChanges: Record<string, unknown> = {};

  if (isAdmin && !isSelf) {
    const data = await parseBody(req, adminUpdateUserSchema);

    if (data.password !== undefined) {
      assertStrongPassword(data.password);
      update.passwordHash = await hashPassword(data.password);
    }
    if (data.name !== undefined) update.name = data.name;
    if (data.email !== undefined) update.email = data.email;
    if (data.avatar !== undefined) update.avatar = data.avatar;
    if (data.role !== undefined) update.role = data.role;
    if (data.isActive !== undefined) update.isActive = data.isActive;

    // Never allow removing/deactivating the last active admin.
    const demoting = (data.role && data.role !== 'ADMIN') || data.isActive === false;
    if (target.role === 'ADMIN' && demoting) {
      const admins = await db.user.count({ where: { role: 'ADMIN', isActive: true, NOT: { id: target.id } } });
      if (admins === 0) throw badRequest('Cannot demote or deactivate the last active admin');
    }

    if (data.departments !== undefined) {
      await db.$transaction([
        db.userDepartment.deleteMany({ where: { userId: params.id } }),
        ...(data.departments.length
          ? [
              db.userDepartment.createMany({
                data: data.departments.map((d) => ({
                  userId: params.id,
                  departmentId: d.departmentId,
                  roleId: d.roleId,
                  isPrimary: d.isPrimary ?? false,
                })),
              }),
            ]
          : []),
      ]);
    }
    auditChanges = { ...data, password: data.password ? '[rotated]' : undefined };
  } else {
    // Self-service: name, avatar, password change with current-password proof.
    const data = await parseBody(req, selfUpdateUserSchema);

    if (data.newPassword !== undefined) {
      if (!data.currentPassword) throw badRequest('Current password is required to set a new password');
      const ok = await verifyPassword(data.currentPassword, target.passwordHash);
      if (!ok) throw badRequest('Current password is incorrect');
      assertStrongPassword(data.newPassword);
      update.passwordHash = await hashPassword(data.newPassword);
    }
    if (data.name !== undefined) update.name = data.name;
    if (data.avatar !== undefined) update.avatar = data.avatar;
    auditChanges = { name: data.name, avatar: data.avatar, password: data.newPassword ? '[rotated]' : undefined };
  }

  const user = await db.user.update({ where: { id: params.id }, data: update, select: userSelect });

  void writeAudit({
    userId: actor.id,
    action: 'update',
    entity: 'User',
    entityId: params.id,
    changes: auditChanges,
    ipAddress: getClientIp(req),
  });

  return NextResponse.json({ user });
});

export const DELETE = handle(async (req: NextRequest, { params }) => {
  const actor = await requireSession();
  if (actor.role !== 'ADMIN') throw forbidden('Admin access required');
  if (actor.id === params.id) throw badRequest('You cannot delete your own account');

  const target = await db.user.findUnique({ where: { id: params.id } });
  if (!target) throw notFound('User not found');

  if (target.role === 'ADMIN') {
    const admins = await db.user.count({ where: { role: 'ADMIN', isActive: true, NOT: { id: target.id } } });
    if (admins === 0) throw badRequest('Cannot delete the last active admin');
  }

  // Soft-delete: deactivate to preserve referential history (tasks, audits).
  await db.user.update({ where: { id: params.id }, data: { isActive: false } });

  void writeAudit({
    userId: actor.id,
    action: 'deactivate',
    entity: 'User',
    entityId: params.id,
    changes: { email: target.email },
    ipAddress: getClientIp(req),
  });

  return NextResponse.json({ success: true });
});
