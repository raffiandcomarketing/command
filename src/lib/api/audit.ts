import { db } from '@/lib/db';
import { log } from '@/lib/log';

interface AuditInput {
  userId?: string | null;
  action: string; // e.g. 'create' | 'update' | 'delete' | 'approve' | 'reject' | 'login'
  entity: string; // e.g. 'Task', 'CrmDeal'
  entityId: string;
  changes?: unknown;
  ipAddress?: string;
  userAgent?: string;
  metadata?: unknown;
}

/**
 * Audit every mutation (assessment R18/TD-audit). Failures to write audit
 * must never break the business operation - they are logged instead.
 */
export async function writeAudit(input: AuditInput): Promise<void> {
  try {
    await db.auditLog.create({
      data: {
        userId: input.userId ?? null,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId,
        changes: (input.changes as object) ?? undefined,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        metadata: (input.metadata as object) ?? undefined,
      },
    });
  } catch (err) {
    log.error('Failed to write audit log', { err: err as Error, input: { ...input, changes: undefined } });
  }
}

interface ActivityInput {
  userId: string;
  type: string; // e.g. 'task.created'
  description: string; // human readable: 'created task "X"'
  entityType?: string;
  entityId?: string;
  departmentId?: string | null;
  metadata?: unknown;
}

/** Activity feed entries power the dashboard "Recent Activity". */
export async function logActivity(input: ActivityInput): Promise<void> {
  try {
    await db.activityLog.create({
      data: {
        userId: input.userId,
        type: input.type,
        description: input.description,
        entityType: input.entityType,
        entityId: input.entityId,
        departmentId: input.departmentId ?? null,
        metadata: (input.metadata as object) ?? undefined,
      },
    });
  } catch (err) {
    log.error('Failed to write activity log', { err: err as Error });
  }
}
