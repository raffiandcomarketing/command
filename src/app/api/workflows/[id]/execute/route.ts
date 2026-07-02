import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { handle, parseBody } from '@/lib/api/http';
import { requireSession, assertCanWrite, getClientIp } from '@/lib/api/guard';
import { notFound, badRequest } from '@/lib/api/errors';
import { writeAudit, logActivity } from '@/lib/api/audit';
import { executeWorkflowSchema } from '@/lib/validate';
import { executeWorkflow } from '@/lib/workflows/runner';

export const POST = handle(async (req: NextRequest, { params }) => {
  const user = await requireSession();
  assertCanWrite(user);

  const workflow = await db.workflow.findUnique({ where: { id: params.id } });
  if (!workflow) throw notFound('Workflow not found');
  if (!workflow.isActive) throw badRequest('This workflow is inactive');
  if (workflow.isTemplate) throw badRequest('Templates cannot be executed directly - create a workflow from it first');

  const { context } = await parseBody(req, executeWorkflowSchema);

  const instance = await executeWorkflow(params.id, user.id, context);

  void writeAudit({
    userId: user.id,
    action: 'execute',
    entity: 'Workflow',
    entityId: params.id,
    changes: { instanceId: instance.id, status: instance.status },
    ipAddress: getClientIp(req),
  });
  void logActivity({
    userId: user.id,
    type: 'workflow.executed',
    description: `ran workflow "${workflow.name}" (${instance.status.toLowerCase()})`,
    entityType: 'WorkflowInstance',
    entityId: instance.id,
    departmentId: workflow.departmentId,
  });

  return NextResponse.json({ instance }, { status: 201 });
});
