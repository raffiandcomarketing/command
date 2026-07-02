import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { handle, parseBody } from '@/lib/api/http';
import { requireSession, assertCanWrite, getClientIp, isElevated } from '@/lib/api/guard';
import { notFound, forbidden, badRequest } from '@/lib/api/errors';
import { writeAudit, logActivity } from '@/lib/api/audit';
import { decideApprovalSchema, updateApprovalSchema } from '@/lib/validate';

const approvalInclude = {
  requester: { select: { id: true, name: true, email: true, avatar: true } },
  approver: { select: { id: true, name: true, email: true, avatar: true } },
  department: { select: { id: true, name: true, slug: true } },
};

export const GET = handle(async (_req: NextRequest, { params }) => {
  await requireSession();
  const approval = await db.approval.findUnique({
    where: { id: params.id },
    include: approvalInclude,
  });
  if (!approval) throw notFound('Approval not found');
  return NextResponse.json({ approval });
});

/**
 * Decide (approve/reject) an approval.
 *
 * Authorization (assessment R1/U07):
 *  - the designated approver may decide, or an elevated role (MANAGER+)
 *  - the requester may NEVER decide their own request
 */
export const POST = handle(async (req: NextRequest, { params }) => {
  const user = await requireSession();
  assertCanWrite(user);

  const { decision, comments } = await parseBody(req, decideApprovalSchema);

  const approval = await db.approval.findUnique({ where: { id: params.id } });
  if (!approval) throw notFound('Approval not found');

  if (approval.status !== 'PENDING' && approval.status !== 'ESCALATED') {
    throw badRequest(`This approval has already been decided (${approval.status.toLowerCase()})`);
  }
  if (approval.requesterId === user.id) {
    throw forbidden('You cannot decide your own approval request');
  }
  const isDesignatedApprover = approval.approverId === user.id;
  if (!isDesignatedApprover && !isElevated(user)) {
    throw forbidden('Only the designated approver or a manager can decide this request');
  }

  const updated = await db.approval.update({
    where: { id: params.id },
    data: {
      status: decision,
      approverId: user.id,
      decidedAt: new Date(),
      comments: comments ?? null,
    },
    include: approvalInclude,
  });

  void writeAudit({
    userId: user.id,
    action: decision === 'APPROVED' ? 'approve' : 'reject',
    entity: 'Approval',
    entityId: updated.id,
    changes: { decision, comments },
    ipAddress: getClientIp(req),
  });
  void logActivity({
    userId: user.id,
    type: decision === 'APPROVED' ? 'approval.approved' : 'approval.rejected',
    description: `${decision === 'APPROVED' ? 'approved' : 'rejected'} "${updated.title}"`,
    entityType: 'Approval',
    entityId: updated.id,
    departmentId: updated.departmentId,
  });

  await db.notification.create({
    data: {
      userId: updated.requesterId,
      type: 'APPROVAL',
      title: `Request ${decision.toLowerCase()}`,
      message: `${user.name} ${decision === 'APPROVED' ? 'approved' : 'rejected'} "${updated.title}"${comments ? `: ${comments}` : ''}`,
      link: '/approvals',
    },
  });

  return NextResponse.json({ approval: updated });
});

/** Requester may edit while pending, or cancel; admins may edit too. */
export const PATCH = handle(async (req: NextRequest, { params }) => {
  const user = await requireSession();
  assertCanWrite(user);

  const approval = await db.approval.findUnique({ where: { id: params.id } });
  if (!approval) throw notFound('Approval not found');

  const isRequester = approval.requesterId === user.id;
  if (!isRequester && user.role !== 'ADMIN') {
    throw forbidden('Only the requester or an admin can modify this request');
  }
  if (approval.status !== 'PENDING') {
    throw badRequest('Only pending approvals can be modified');
  }

  const data = await parseBody(req, updateApprovalSchema);

  const updated = await db.approval.update({
    where: { id: params.id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.priority !== undefined && { priority: data.priority }),
      ...(data.dueDate !== undefined && { dueDate: data.dueDate }),
      ...(data.approverId !== undefined && { approverId: data.approverId }),
      ...(data.status === 'CANCELLED' && { status: 'CANCELLED', decidedAt: new Date() }),
    },
    include: approvalInclude,
  });

  void writeAudit({
    userId: user.id,
    action: data.status === 'CANCELLED' ? 'cancel' : 'update',
    entity: 'Approval',
    entityId: updated.id,
    changes: data,
    ipAddress: getClientIp(req),
  });

  return NextResponse.json({ approval: updated });
});

export const DELETE = handle(async (req: NextRequest, { params }) => {
  const user = await requireSession();

  const approval = await db.approval.findUnique({ where: { id: params.id } });
  if (!approval) throw notFound('Approval not found');

  if (user.role !== 'ADMIN' && approval.requesterId !== user.id) {
    throw forbidden('Only the requester or an admin can delete this request');
  }

  await db.approval.delete({ where: { id: params.id } });

  void writeAudit({
    userId: user.id,
    action: 'delete',
    entity: 'Approval',
    entityId: params.id,
    changes: { title: approval.title },
    ipAddress: getClientIp(req),
  });

  return NextResponse.json({ success: true });
});
