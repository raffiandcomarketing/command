import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { handle } from '@/lib/api/http';
import { requireSession } from '@/lib/api/guard';

/** Real dashboard stats (replaces the old hardcoded numbers). */
export const GET = handle(async () => {
  await requireSession();

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 3600 * 1000);

  const [
    openTasks,
    pendingApprovals,
    activeUsers,
    activeWorkflows,
    recentDeals,
    departments,
    pipelineAgg,
    salesAgg,
  ] = await Promise.all([
    db.task.count({ where: { status: { in: ['PENDING', 'IN_PROGRESS', 'REVIEW'] } } }),
    db.approval.count({ where: { status: 'PENDING' } }),
    db.user.count({ where: { isActive: true } }),
    db.workflow.count({ where: { isActive: true, isTemplate: false } }),
    db.crmDeal.findMany({
      include: { contact: { select: { name: true } } },
      orderBy: { updatedAt: 'desc' },
      take: 5,
    }),
    db.department.findMany({
      where: { isActive: true },
      include: { _count: { select: { userDepartments: true, tasks: { where: { status: { in: ['PENDING', 'IN_PROGRESS', 'REVIEW'] } } } } } },
      orderBy: { sortOrder: 'asc' },
      take: 6,
    }),
    db.crmDeal.aggregate({ _sum: { value: true }, where: { stage: { in: ['LEAD', 'OPPORTUNITY'] } } }),
    db.crmDeal.aggregate({
      _sum: { value: true },
      where: { stage: 'SALE', closedAt: { gte: thirtyDaysAgo } },
    }),
  ]);

  return NextResponse.json({
    stats: {
      openTasks,
      pendingApprovals,
      activeUsers,
      activeWorkflows,
      pipelineValue: pipelineAgg._sum.value ?? 0,
      salesValue30d: salesAgg._sum.value ?? 0,
    },
    recentDeals,
    departments: departments.map((d) => ({
      id: d.id,
      name: d.name,
      slug: d.slug,
      members: d._count.userDepartments,
      openTasks: d._count.tasks,
    })),
  });
});
