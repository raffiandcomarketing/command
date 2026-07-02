import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { handle } from '@/lib/api/http';
import { requireSession, requireRole, getClientIp } from '@/lib/api/guard';
import { notFound, badRequest } from '@/lib/api/errors';
import { writeAudit } from '@/lib/api/audit';
import { log } from '@/lib/log';

interface ActionDef {
  type: 'CREATE_TASK' | 'SEND_NOTIFICATION' | 'CREATE_APPROVAL';
  config: Record<string, unknown>;
}

/**
 * Manually execute an automation rule's actions, honestly recorded in
 * AutomationExecution. Cooldown is enforced. Event/schedule triggers
 * arrive with the worker tier (roadmap Sprint 8).
 */
export const POST = handle(async (req: NextRequest, { params }) => {
  const user = await requireSession();
  requireRole(user, 'ADMIN', 'EXECUTIVE', 'MANAGER');

  const rule = await db.automationRule.findUnique({ where: { id: params.id } });
  if (!rule) throw notFound('Automation not found');
  if (!rule.isActive) throw badRequest('This automation is inactive');

  if (rule.cooldownMinutes && rule.lastTriggeredAt) {
    const nextAllowed = new Date(rule.lastTriggeredAt.getTime() + rule.cooldownMinutes * 60_000);
    if (nextAllowed > new Date()) {
      throw badRequest(`Cooldown active - next execution allowed at ${nextAllowed.toISOString()}`);
    }
  }

  const started = Date.now();
  const execution = await db.automationExecution.create({
    data: { ruleId: rule.id, status: 'RUNNING', triggerData: { manual: true, by: user.id } },
  });

  const actions = (Array.isArray(rule.actions) ? rule.actions : []) as unknown as ActionDef[];
  const results: Record<string, unknown>[] = [];
  let failed = false;

  for (const action of actions) {
    try {
      switch (action.type) {
        case 'CREATE_TASK': {
          const task = await db.task.create({
            data: {
              title: String(action.config.title ?? `Automation: ${rule.name}`),
              description: action.config.description ? String(action.config.description) : null,
              priority: 'MEDIUM',
              creatorId: user.id,
              assigneeId: action.config.assigneeId ? String(action.config.assigneeId) : null,
              departmentId: rule.departmentId,
            },
          });
          results.push({ type: action.type, taskId: task.id });
          break;
        }
        case 'SEND_NOTIFICATION': {
          const notification = await db.notification.create({
            data: {
              userId: action.config.userId ? String(action.config.userId) : user.id,
              type: 'SYSTEM',
              title: String(action.config.title ?? `Automation: ${rule.name}`),
              message: String(action.config.message ?? `Automation rule "${rule.name}" executed`),
            },
          });
          results.push({ type: action.type, notificationId: notification.id });
          break;
        }
        case 'CREATE_APPROVAL': {
          const approval = await db.approval.create({
            data: {
              title: String(action.config.title ?? `Automation: ${rule.name}`),
              type: 'GENERAL',
              requesterId: user.id,
              approverId: action.config.approverId ? String(action.config.approverId) : null,
              departmentId: rule.departmentId,
            },
          });
          results.push({ type: action.type, approvalId: approval.id });
          break;
        }
        default:
          results.push({ type: (action as ActionDef).type, skipped: true, reason: 'Unsupported action type' });
      }
    } catch (err) {
      failed = true;
      log.error('Automation action failed', { ruleId: rule.id, err: err as Error });
      results.push({ type: action.type, error: (err as Error).message });
      break;
    }
  }

  const completed = await db.automationExecution.update({
    where: { id: execution.id },
    data: {
      status: failed ? 'FAILED' : 'COMPLETED',
      result: results as Prisma.InputJsonValue,
      completedAt: new Date(),
      duration: Date.now() - started,
      ...(failed && { error: 'One or more actions failed' }),
    },
  });

  await db.automationRule.update({
    where: { id: rule.id },
    data: { lastTriggeredAt: new Date(), executionCount: { increment: 1 } },
  });

  void writeAudit({
    userId: user.id,
    action: 'execute',
    entity: 'AutomationRule',
    entityId: rule.id,
    changes: { executionId: completed.id, status: completed.status },
    ipAddress: getClientIp(req),
  });

  return NextResponse.json({ execution: completed }, { status: 201 });
});
