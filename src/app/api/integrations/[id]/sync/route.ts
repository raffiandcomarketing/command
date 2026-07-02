import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { handle } from '@/lib/api/http';
import { requireAdmin } from '@/lib/api/guard';
import { notFound } from '@/lib/api/errors';

/**
 * Sync adapters are not implemented yet (roadmap Sprint 9: Lightspeed,
 * Klaviyo, Google SSO). This endpoint is honest about that instead of
 * pretending a sync started (the previous behaviour).
 */
export const POST = handle(async (_req: NextRequest, { params }) => {
  await requireAdmin();

  const integration = await db.integration.findUnique({ where: { id: params.id } });
  if (!integration) throw notFound('Integration not found');

  return NextResponse.json(
    {
      error: `Sync for "${integration.provider}" is not yet implemented. Integration adapters (Lightspeed, Klaviyo, Google Workspace) are scheduled in the go-live roadmap (Sprint 9).`,
      integrationId: params.id,
    },
    { status: 501 }
  );
});
