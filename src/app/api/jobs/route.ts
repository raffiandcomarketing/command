import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { handle, parseBody, getPagination } from '@/lib/api/http';
import { requireAdmin } from '@/lib/api/guard';
import { createJobSchema } from '@/lib/validate';

const JOB_STATUS = ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'RETRY'] as const;

export const GET = handle(async (req: NextRequest) => {
  await requireAdmin();

  const sp = req.nextUrl.searchParams;
  const statusRaw = sp.get('status')?.toUpperCase();
  const p = getPagination(req, 50);

  const where: Prisma.JobQueueWhereInput = {
    ...(statusRaw && (JOB_STATUS as readonly string[]).includes(statusRaw) && {
      status: statusRaw as (typeof JOB_STATUS)[number],
    }),
  };

  const [jobs, total] = await Promise.all([
    db.jobQueue.findMany({ where, orderBy: { createdAt: 'desc' }, skip: p.skip, take: p.take }),
    db.jobQueue.count({ where }),
  ]);

  return NextResponse.json({
    jobs,
    workerActive: false, // honest: the worker tier ships in roadmap Sprint 8
    pagination: { total, page: p.page, pageSize: p.pageSize, pages: Math.max(1, Math.ceil(total / p.pageSize)) },
  });
});

export const POST = handle(async (req: NextRequest) => {
  await requireAdmin();

  const data = await parseBody(req, createJobSchema);

  const job = await db.jobQueue.create({
    data: {
      type: data.type,
      payload: data.payload as object,
      priority: data.priority ?? 0,
      scheduledFor: data.scheduledFor ?? new Date(),
      maxAttempts: data.maxAttempts ?? 3,
    },
  });

  return NextResponse.json(
    { job, note: 'Job queued. Note: the background worker is not yet enabled (roadmap Sprint 8), so jobs will not process automatically.' },
    { status: 201 }
  );
});
