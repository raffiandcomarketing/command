import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { handle, parseBody } from '@/lib/api/http';
import { requireSession, requireRole, getClientIp } from '@/lib/api/guard';
import { writeAudit } from '@/lib/api/audit';
import { createAutomationSchema, AutomationTriggerTypeEnum } from '@/lib/validate';

export const GET = handle(async (req: NextRequest) => {
  await requireSession();

  const sp = req.nextUrl.searchParams;
  const departmentId = sp.get('departmentId') || undefined;
  const triggerParam = AutomationTriggerTypeEnum.safeParse(sp.get('triggerType')?.toUpperCase());
  const isActive = sp.get('isActive');

  // Fixed: old route queried non-existent `db.automation`; model is AutomationRule.
  const where: Prisma.AutomationRuleWhereInput = {
    ...(departmentId && { departmentId }),
    ...(triggerParam.success && { triggerType: triggerParam.data }),
    ...(isActive !== null && isActive !== undefined && { isActive: isActive === 'true' }),
  };

  const automations = await db.automationRule.findMany({
    where,
    include: {
      department: { select: { id: true, name: true, slug: true } },
      createdBy: { select: { id: true, name: true } },
      _count: { select: { automationExecutions: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ automations });
});

export const POST = handle(async (req: NextRequest) => {
  const user = await requireSession();
  requireRole(user, 'ADMIN', 'EXECUTIVE', 'MANAGER');

  const data = await parseBody(req, createAutomationSchema);

  const automation = await db.automationRule.create({
    data: {
      name: data.name,
      description: data.description ?? null,
      departmentId: data.departmentId ?? null,
      isActive: data.isActive ?? true,
      triggerType: data.triggerType,
      triggerConfig: (data.triggerConfig as object) ?? {},
      conditions: (data.conditions as object) ?? undefined,
      actions: data.actions as object[],
      cooldownMinutes: data.cooldownMinutes ?? null,
      createdById: user.id,
    },
    include: { department: { select: { id: true, name: true, slug: true } } },
  });

  void writeAudit({
    userId: user.id,
    action: 'create',
    entity: 'AutomationRule',
    entityId: automation.id,
    changes: { name: automation.name, triggerType: automation.triggerType },
    ipAddress: getClientIp(req),
  });

  return NextResponse.json({ automation }, { status: 201 });
});
