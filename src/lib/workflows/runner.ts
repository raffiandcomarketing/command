import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { log } from '@/lib/log';

interface StepDef {
  name: string;
  type: 'TASK' | 'APPROVAL' | 'NOTIFICATION' | 'WEBHOOK' | 'CONDITION' | 'DELAY' | 'INTEGRATION';
  config: Record<string, unknown>;
}

/**
 * Minimal synchronous workflow runner.
 *
 * Honest scope (Sprint 3-4): TASK, APPROVAL and NOTIFICATION steps execute
 * for real; WEBHOOK/CONDITION/DELAY/INTEGRATION steps are recorded as
 * SKIPPED until the worker tier ships (Sprint 8 of the roadmap). No step
 * ever pretends to have run.
 */
export async function executeWorkflow(
  workflowId: string,
  triggeredById: string,
  context?: Record<string, unknown>
) {
  const workflow = await db.workflow.findUnique({ where: { id: workflowId } });
  if (!workflow) throw new Error('Workflow not found');

  const steps = (Array.isArray(workflow.steps) ? workflow.steps : []) as unknown as StepDef[];

  const instance = await db.workflowInstance.create({
    data: {
      workflowId,
      triggeredById,
      status: 'ACTIVE',
      context: (context as Prisma.InputJsonValue) ?? undefined,
    },
  });

  let failed = false;

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const record = await db.workflowStep.create({
      data: {
        workflowInstanceId: instance.id,
        stepIndex: i,
        name: step.name || `Step ${i + 1}`,
        type: step.type,
        config: (step.config as Prisma.InputJsonValue) ?? {},
        status: 'IN_PROGRESS',
        startedAt: new Date(),
      },
    });

    try {
      let result: Record<string, unknown> = {};
      let status: 'COMPLETED' | 'SKIPPED' = 'COMPLETED';

      switch (step.type) {
        case 'TASK': {
          const task = await db.task.create({
            data: {
              title: String(step.config.title ?? step.name ?? 'Workflow task'),
              description: step.config.description ? String(step.config.description) : null,
              priority: 'MEDIUM',
              creatorId: triggeredById,
              assigneeId: step.config.assigneeId ? String(step.config.assigneeId) : triggeredById,
              departmentId: workflow.departmentId,
              workflowInstanceId: instance.id,
            },
          });
          result = { taskId: task.id };
          break;
        }
        case 'APPROVAL': {
          const approval = await db.approval.create({
            data: {
              title: String(step.config.title ?? step.name ?? 'Workflow approval'),
              description: step.config.description ? String(step.config.description) : null,
              type: 'WORKFLOW',
              requesterId: triggeredById,
              approverId: step.config.approverId ? String(step.config.approverId) : null,
              departmentId: workflow.departmentId,
            },
          });
          result = { approvalId: approval.id };
          break;
        }
        case 'NOTIFICATION': {
          const targetUserId = step.config.userId ? String(step.config.userId) : triggeredById;
          const notification = await db.notification.create({
            data: {
              userId: targetUserId,
              type: 'WORKFLOW',
              title: String(step.config.title ?? `Workflow: ${workflow.name}`),
              message: String(step.config.message ?? `Step "${step.name}" of workflow "${workflow.name}"`),
            },
          });
          result = { notificationId: notification.id };
          break;
        }
        default: {
          status = 'SKIPPED';
          result = {
            reason: `${step.type} steps require the background worker tier (roadmap Sprint 8) and were not executed`,
          };
        }
      }

      await db.workflowStep.update({
        where: { id: record.id },
        data: { status, result: result as Prisma.InputJsonValue, completedAt: new Date() },
      });
      await db.workflowInstance.update({
        where: { id: instance.id },
        data: { currentStepIndex: i },
      });
    } catch (err) {
      failed = true;
      log.error('Workflow step failed', { workflowId, instanceId: instance.id, stepIndex: i, err: err as Error });
      await db.workflowStep.update({
        where: { id: record.id },
        data: { status: 'FAILED', result: { error: (err as Error).message }, completedAt: new Date() },
      });
      break;
    }
  }

  const final = await db.workflowInstance.update({
    where: { id: instance.id },
    data: {
      status: failed ? 'FAILED' : 'COMPLETED',
      completedAt: new Date(),
      ...(failed && { error: 'One or more steps failed' }),
    },
    include: { workflowSteps: { orderBy: { stepIndex: 'asc' } } },
  });

  return final;
}
