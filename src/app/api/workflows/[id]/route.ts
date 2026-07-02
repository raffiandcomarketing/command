import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { handle, parseBody } from '@/lib/api/http';
import { requireSession, requireRole, getClientIp } from '@/lib/api/guard';
import { notFound } from '@/lib/api/errors';
import { writeAudit } from '@/lib/api/audit';
import { updateWorkflowSchema } from '@/lib/validate';

export const GET = handle(async (_req: NextRequest, { params }) => {
  await requireSession();
  const workflow = await db.workflow.findUnique({
    where: { id: params.id },
    include: {
      department: { select: { id: true, name: true, slug: true } },
      workflowInstances: {
        orderBy: { startedAt: 'desc' },
        take: 10,
        include: { workflowSteps: { orderBy: { stepIndex: 'asc' } } },
      },
    },
  });
  if (!workflow) throw notFound('Workflow not found');
  return NextResponse.json({ workflow });
});

export const PATCH = handle(async (req: NextRequest, { params }) => {
  const user = await requireSession();
  requireRole(user, 'ADMIN', 'EXECUTIVE', 'MANAGER');

  const data = await parseBody(req, updateWorkflowSchema);

  const workflow = await db.workflow.update({
    where: { id: params.id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.departmentId !== undefined && { departmentId: data.departmentId }),
      ...(data.triggerType !== undefined && { triggerType: data.triggerType }),
      ...(data.triggerConfig !== undefined && { triggerConfig: data.triggerConfig as object }),
      ...(data.steps !== undefined && { steps: data.steps as object[] }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
      ...(data.isTemplate !== undefined && { isTemplate: data.isTemplate }),
    },
    include: { department: { select: { id: true, name: true, slug: true } } },
  });

  void writeAudit({
    userId: user.id,
    action: 'update',
    entity: 'Workflow',
    entityId: workflow.id,
    changes: data,
    ipAddress: getClientIp(req),
  });

  return NextResponse.json({ workflow });
});

export const DELETE = handle(async (req: NextRequest, { params }) => {
  const user = await requireSession();
  requireRole(user, 'ADMIN', 'EXECUTIVE');

  const wf = await db.workflow.findUnique({ where: { id: params.id } });
  if (!wf) throw notFound('Workflow not found');

  await db.workflow.delete({ where: { id: params.id } });

  void writeAudit({
    userId: user.id,
    action: 'delete',
    entity: 'Workflow',
    entityId: params.id,
    changes: { name: wf.name },
    ipAddress: getClientIp(req),
  });

  return NextResponse.json({ success: true });
});
