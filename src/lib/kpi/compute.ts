import { db } from '@/lib/db';

/**
 * Built-in KPI data sources, evaluated in code (never arbitrary SQL).
 * Each returns the current value for the metric.
 */
export const KPI_COMPUTERS: Record<string, (departmentId?: string | null) => Promise<number>> = {
  'tasks.open_count': async (departmentId) =>
    db.task.count({
      where: {
        status: { in: ['PENDING', 'IN_PROGRESS', 'REVIEW'] },
        ...(departmentId ? { departmentId } : {}),
      },
    }),
  'tasks.overdue_count': async (departmentId) =>
    db.task.count({
      where: {
        status: { in: ['PENDING', 'IN_PROGRESS', 'REVIEW'] },
        dueDate: { lt: new Date() },
        ...(departmentId ? { departmentId } : {}),
      },
    }),
  'tasks.completed_30d': async (departmentId) =>
    db.task.count({
      where: {
        status: 'COMPLETED',
        completedAt: { gte: new Date(Date.now() - 30 * 24 * 3600 * 1000) },
        ...(departmentId ? { departmentId } : {}),
      },
    }),
  'approvals.pending_count': async (departmentId) =>
    db.approval.count({
      where: { status: 'PENDING', ...(departmentId ? { departmentId } : {}) },
    }),
  'crm.pipeline_value': async (departmentId) => {
    const agg = await db.crmDeal.aggregate({
      _sum: { value: true },
      where: {
        stage: { in: ['LEAD', 'OPPORTUNITY'] },
        ...(departmentId ? { departmentId } : {}),
      },
    });
    return agg._sum.value ?? 0;
  },
  'crm.sales_value_30d': async (departmentId) => {
    const agg = await db.crmDeal.aggregate({
      _sum: { value: true },
      where: {
        stage: 'SALE',
        closedAt: { gte: new Date(Date.now() - 30 * 24 * 3600 * 1000) },
        ...(departmentId ? { departmentId } : {}),
      },
    });
    return agg._sum.value ?? 0;
  },
  'crm.deals_open_count': async (departmentId) =>
    db.crmDeal.count({
      where: {
        stage: { in: ['LEAD', 'OPPORTUNITY'] },
        ...(departmentId ? { departmentId } : {}),
      },
    }),
  'users.active_count': async () => db.user.count({ where: { isActive: true } }),
};

export interface ComputeResult {
  kpiId: string;
  name: string;
  dataSource: string;
  value: number | null;
  skipped: boolean;
}

/** Compute and snapshot all active, non-manual KPIs. */
export async function computeAllKpis(): Promise<ComputeResult[]> {
  const kpis = await db.kpiDefinition.findMany({ where: { isActive: true } });
  const results: ComputeResult[] = [];
  const period = new Date().toISOString().slice(0, 10);

  for (const kpi of kpis) {
    const computer = KPI_COMPUTERS[kpi.dataSource];
    if (!computer) {
      results.push({ kpiId: kpi.id, name: kpi.name, dataSource: kpi.dataSource, value: null, skipped: true });
      continue;
    }
    const value = await computer(kpi.departmentId);
    await db.kpiSnapshot.create({
      data: { kpiId: kpi.id, value, period, metadata: { computed: true } },
    });
    results.push({ kpiId: kpi.id, name: kpi.name, dataSource: kpi.dataSource, value, skipped: false });
  }

  return results;
}
