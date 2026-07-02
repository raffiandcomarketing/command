import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { handle, parseBody } from '@/lib/api/http';
import {
  requireSession,
  assertCanWrite,
  assertOwnershipOr,
  getClientIp,
  isElevated,
} from '@/lib/api/guard';
import { notFound, forbidden } from '@/lib/api/errors';
import { writeAudit, logActivity } from '@/lib/api/audit';
import { updateTaskSchema } from '@/lib/validate';

const taskInclude = {
  assignee: { select: { id: true, name: true, email: true, avatar: true } },
  creator: { select: { id: true, name: true } },
  department: { select: { id: true, name: true, slug: true } },
  subTasks: { select: { id: true, title: true, status: true } },
} satisfies Prisma.TaskInclude;

export const GET = handle(async (_req: NextRequest, { params }) => {
  await requireSession();
  const task = await db.task.findUnique({ where: { id: params.id }, include: taskInclude });
  if (!task) throw notFound('Task not found');
  return NextResponse.json({ task });
});

export const PATCH = handle(async (req: NextRequest, { params }) => {
  const user = await requireSession();
  assertCanWrite(user);

  const existing = await db.task.findUnique({ where: { id: params.id } });
  if (!existing) throw notFound('Task not found');

  // Ownership rule (assessment U08): creator, assignee, or elevated roles.
  assertOwnershipOr(user, [existing.creatorId, existing.assigneeId], 'Only the task creator, assignee, or a manager can modify this task');

  const data = await parseBody(req, updateTaskSchema);

  const completingNow = data.status === 'COMPLETED' && existing.status !== 'COMPLETED';

  const task = await db.task.update({
    where: { id: params.id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.priority !== undefined && { priority: data.priority }),
      ...(data.dueDate !== undefined && { dueDate: data.dueDate }),
      ...(data.assigneeId !== undefined && { assigneeId: data.assigneeId }),
      ...(data.departmentId !== undefined && { departmentId: data.departmentId }),
      ...(data.roleId !== undefined && { roleId: data.roleId }),
      ...(data.tags !== undefined && { tags: data.tags }),
      ...(completingNow && { completedAt: new Date() }),
    },
    include: taskInclude,
  });

  void writeAudit({
    userId: user.id,
    action: 'update',
    entity: 'Task',
    entityId: task.id,
    changes: data,
    ipAddress: getClientIp(req),
  });
  if (completingNow) {
    void logActivity({
      userId: user.id,
      type: 'task.completed',
      description: `completed task "${task.title}"`,
      entityType: 'Task',
      entityId: task.id,
      departmentId: task.departmentId,
    });
  }

  return NextResponse.json({ task });
});

export const DELETE = handle(async (req: NextRequest, { params }) => {
  const user = await requireSession();
  assertCanWrite(user);

  const existing = await db.task.findUnique({ where: { id: params.id } });
  if (!existing) throw notFound('Task not found');

  if (!isElevated(user) && existing.creatorId !== user.id) {
    throw forbidden('Only the task creator or a manager can delete this task');
  }

  await db.task.delete({ where: { id: params.id } });

  void writeAudit({
    userId: user.id,
    action: 'delete',
    entity: 'Task',
    entityId: params.id,
    changes: { title: existing.title },
    ipAddress: getClientIp(req),
  });

  return NextResponse.json({ success: true });
});
