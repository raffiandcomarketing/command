import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { handle, parseBody, getPagination } from '@/lib/api/http';
import { requireSession, assertCanWrite, getClientIp, isElevated } from '@/lib/api/guard';
import { writeAudit, logActivity } from '@/lib/api/audit';
import { createApprovalSchema, ApprovalTypeEnum } from '@/lib/validate';

const approvalInclude = {
  requester: { select: { id: true, name: true, email: true, avatar: true } },
  approver: { select: { id: true, name: true, email: true, avatar: true } },
  department: { select: { id: true, name: true, slug: true } },
} satisfies Prisma.ApprovalInclude;

const STATUS = ['PENDING', 'APPROVED', 'REJECTED', 'ESCALATED', 'CANCELLED'] as const;

export const GET = handle(async (req: NextRequest) => {
  const user = await requireSession();

  const sp = req.nextUrl.searchParams;
  const statusRaw = sp.get('status')?.toUpperCase();
  const typeParam = ApprovalTypeEnum.safeParse(sp.get('type')?.toUpperCase());
  const departmentId = sp.get('departmentId') || undefined;
  const mine = sp.get('mine'); // 'requested' | 'to-decide'
  const p = getPagination(req);

  const where: Prisma.ApprovalWhereInput = {
    ...(statusRaw && (STATUS as readonly string[]).includes(statusRaw) && {
      status: statusRaw as (typeof STATUS)[number],
    }),
    ...(typeParam.success && { type: typeParam.data }),
    ...(departmentId && { departmentId }),
    ...(mine === 'requested' && { requesterId: user.id }),
    ...(mine === 'to-decide' && {
      status: 'PENDING',
      ...(isElevated(user) ? {} : { approverId: user.id }),
    }),
  };

  const [approvals, total] = await Promise.all([
    db.approval.findMany({
      where,
      include: approvalInclude,
      orderBy: { createdAt: 'desc' },
      skip: p.skip,
      take: p.take,
    }),
    db.approval.count({ where }),
  ]);

  return NextResponse.json({
    approvals,
    pagination: { total, page: p.page, pageSize: p.pageSize, pages: Math.max(1, Math.ceil(total / p.pageSize)) },
  });
});

export const POST = handle(async (req: NextRequest) => {
  const user = await requireSession();
  assertCanWrite(user);

  const data = await parseBody(req, createApprovalSchema);

  const approval = await db.approval.create({
    data: {
      title: data.title,
      description: data.description ?? null,
      type: data.type,
      requesterId: user.id,
      approverId: data.approverId ?? null,
      departmentId: data.departmentId ?? null,
      priority: data.priority ?? 'MEDIUM',
      dueDate: data.dueDate ?? null,
      data: (data.data as object) ?? undefined,
    },
    include: approvalInclude,
  });

  void writeAudit({
    userId: user.id,
    action: 'create',
    entity: 'Approval',
    entityId: approval.id,
    changes: { title: approval.title, type: approval.type },
    ipAddress: getClientIp(req),
  });
  void logActivity({
    userId: user.id,
    type: 'approval.requested',
    description: `requested approval "${approval.title}"`,
    entityType: 'Approval',
    entityId: approval.id,
    departmentId: approval.departmentId,
  });

  if (approval.approverId) {
    await db.notification.create({
      data: {
        userId: approval.approverId,
        type: 'APPROVAL',
        title: 'Approval requested',
        message: `${user.name} requested your approval: "${approval.title}"`,
        link: '/approvals',
      },
    });
  }

  return NextResponse.json({ approval }, { status: 201 });
});
