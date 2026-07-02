import { NextResponse } from 'next/server';
import { handle } from '@/lib/api/http';
import { requireSession, requireRole } from '@/lib/api/guard';
import { computeAllKpis } from '@/lib/kpi/compute';

/**
 * Recompute all active KPIs from live data and store snapshots.
 * Manager+ can refresh; a scheduler can call this later (Sprint 8).
 */
export const POST = handle(async () => {
  const user = await requireSession();
  requireRole(user, 'ADMIN', 'EXECUTIVE', 'MANAGER');

  const results = await computeAllKpis();
  return NextResponse.json({
    computed: results.filter((r) => !r.skipped).length,
    skipped: results.filter((r) => r.skipped).length,
    results,
  });
});
