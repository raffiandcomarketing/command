import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { handle, parseBody } from '@/lib/api/http';
import { requireSession, requireRole, getClientIp } from '@/lib/api/guard';
import { notFound } from '@/lib/api/errors';
import { writeAudit } from '@/lib/api/audit';
import { updateAutomationSchema } from '@/lib/validate';

export const GET = handle(async (_req: NextRequest, { params }) => {
  await requireSession();
  const automation = await db.automationRule.findUnique({
    where: { id: params.id },
    include: {
      department: { select: { id: true, name: true, slug: true } },
      createdBy: { select: { id: true, name: true } },
      automationExecutions: { orderBy: { startedAt: 'desc' }, take: 20 },
    },
  });
  if (!automation) throw notFound('Automation not found');
  return NextResponse.json({ automation });
});

export const PATCH = handle(async (req: NextRequest, { params }) => {
  const user = await requireSession();
  requireRole(user, 'ADMIN', 'EXECUTIVE', 'MANAGER');

  const data = await parseBody(req, updateAutomationSchema);

  const automation = await db.automationRule.update({
    where: { id: params.id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.departmentId !== undefined && { departmentId: data.departmentId }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
      ...(data.triggerType !== undefined && { triggerType: data.triggerType }),
      ...(data.triggerConfig !== undefined && { triggerConfig: data.triggerConfig as object }),
      ...(data.conditions !== undefined && { conditions: (data.conditions as object) ?? undefined }),
      ...(data.actions !== undefined && { actions: data.actions as object[] }),
      ...(data.cooldownMinutes !== undefined && { cooldownMinutes: data.cooldownMinutes }),
    },
    include: { department: { select: { id: true, name: true, slug: true } } },
  });

  void writeAudit({
    userId: user.id,
    action: 'update',
    entity: 'AutomationRule',
    entityId: automation.id,
    changes: data,
    ipAddress: getClientIp(req),
  });

  return NextResponse.json({ automation });
});

export const DELETE = handle(async (req: NextRequest, { params }) => {
  const user = await requireSession();
  requireRole(user, 'ADMIN', 'EXECUTIVE');

  const rule = await db.automationRule.findUnique({ where: { id: params.id } });
  if (!rule) throw notFound('Automation not found');

  await db.automationRule.delete({ where: { id: params.id } });

  void writeAudit({
    userId: user.id,
    action: 'delete',
    entity: 'AutomationRule',
    entityId: params.id,
    changes: { name: rule.name },
    ipAddress: getClientIp(req),
  });

  return NextResponse.json({ success: true });
});
