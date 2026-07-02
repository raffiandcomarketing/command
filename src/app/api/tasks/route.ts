import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { handle, parseBody, getPagination } from '@/lib/api/http';
import { requireSession, assertCanWrite, getClientIp } from '@/lib/api/guard';
import { writeAudit, logActivity } from '@/lib/api/audit';
import { createTaskSchema, TaskStatusEnum, TaskPriorityEnum } from '@/lib/validate';

const taskInclude = {
  assignee: { select: { id: true, name: true, email: true, avatar: true } },
  creator: { select: { id: true, name: true } },
  department: { select: { id: true, name: true, slug: true } },
} satisfies Prisma.TaskInclude;

export const GET = handle(async (req: NextRequest) => {
  await requireSession();

  const sp = req.nextUrl.searchParams;
  const statusParam = TaskStatusEnum.safeParse(sp.get('status')?.toUpperCase());
  const priorityParam = TaskPriorityEnum.safeParse(sp.get('priority')?.toUpperCase());
  const departmentId = sp.get('departmentId') || undefined;
  const assigneeId = sp.get('assigneeId') || undefined;
  const search = sp.get('search')?.trim() || undefined;
  const p = getPagination(req);

  const where: Prisma.TaskWhereInput = {
    ...(statusParam.success && { status: statusParam.data }),
    ...(priorityParam.success && { priority: priorityParam.data }),
    ...(departmentId && { departmentId }),
    ...(assigneeId && { assigneeId }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };

  const [tasks, total] = await Promise.all([
    db.task.findMany({
      where,
      include: taskInclude,
      orderBy: { createdAt: 'desc' },
      skip: p.skip,
      take: p.take,
    }),
    db.task.count({ where }),
  ]);

  return NextResponse.json({
    tasks,
    pagination: { total, page: p.page, pageSize: p.pageSize, pages: Math.max(1, Math.ceil(total / p.pageSize)) },
  });
});

export const POST = handle(async (req: NextRequest) => {
  const user = await requireSession();
  assertCanWrite(user);

  const data = await parseBody(req, createTaskSchema);

  const task = await db.task.create({
    data: {
      title: data.title,
      description: data.description ?? null,
      status: data.status ?? 'PENDING',
      priority: data.priority ?? 'MEDIUM',
      dueDate: data.dueDate ?? null,
      assigneeId: data.assigneeId ?? null,
      departmentId: data.departmentId ?? null,
      roleId: data.roleId ?? null,
      parentTaskId: data.parentTaskId ?? null,
      tags: data.tags ?? [],
      creatorId: user.id,
    },
    include: taskInclude,
  });

  void writeAudit({
    userId: user.id,
    action: 'create',
    entity: 'Task',
    entityId: task.id,
    changes: { title: task.title, status: task.status, priority: task.priority },
    ipAddress: getClientIp(req),
  });
  void logActivity({
    userId: user.id,
    type: 'task.created',
    description: `created task "${task.title}"`,
    entityType: 'Task',
    entityId: task.id,
    departmentId: task.departmentId,
  });

  if (task.assigneeId && task.assigneeId !== user.id) {
    await db.notification.create({
      data: {
        userId: task.assigneeId,
        type: 'TASK',
        title: 'New task assigned to you',
        message: `${user.name} assigned you "${task.title}"`,
        link: '/tasks',
      },
    });
  }

  return NextResponse.json({ task }, { status: 201 });
});
