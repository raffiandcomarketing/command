import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { handle, parseBody } from '@/lib/api/http';
import { requireSession, requireRole, getClientIp } from '@/lib/api/guard';
import { writeAudit } from '@/lib/api/audit';
import { createWorkflowSchema, WorkflowTriggerTypeEnum } from '@/lib/validate';
import { slugify } from '@/lib/utils';

export const GET = handle(async (req: NextRequest) => {
  await requireSession();

  const sp = req.nextUrl.searchParams;
  const departmentId = sp.get('departmentId') || undefined;
  const triggerParam = WorkflowTriggerTypeEnum.safeParse(sp.get('triggerType')?.toUpperCase());
  const isActive = sp.get('isActive');
  const templates = sp.get('templates');

  const where: Prisma.WorkflowWhereInput = {
    ...(departmentId && { departmentId }),
    ...(triggerParam.success && { triggerType: triggerParam.data }),
    ...(isActive !== null && isActive !== undefined && { isActive: isActive === 'true' }),
    ...(templates !== null && templates !== undefined && { isTemplate: templates === 'true' }),
  };

  const workflows = await db.workflow.findMany({
    where,
    include: {
      department: { select: { id: true, name: true, slug: true } },
      _count: { select: { workflowInstances: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ workflows });
});

export const POST = handle(async (req: NextRequest) => {
  const user = await requireSession();
  requireRole(user, 'ADMIN', 'EXECUTIVE', 'MANAGER');

  const data = await parseBody(req, createWorkflowSchema);

  const workflow = await db.workflow.create({
    data: {
      name: data.name,
      slug: data.slug ?? slugify(data.name),
      description: data.description ?? null,
      departmentId: data.departmentId ?? null,
      triggerType: data.triggerType,
      triggerConfig: (data.triggerConfig as object) ?? {},
      steps: data.steps as object[],
      isActive: data.isActive ?? true,
      isTemplate: data.isTemplate ?? false,
    },
    include: { department: { select: { id: true, name: true, slug: true } } },
  });

  void writeAudit({
    userId: user.id,
    action: 'create',
    entity: 'Workflow',
    entityId: workflow.id,
    changes: { name: workflow.name, triggerType: workflow.triggerType },
    ipAddress: getClientIp(req),
  });

  return NextResponse.json({ workflow }, { status: 201 });
});
