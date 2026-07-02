import { NextRequest, NextResponse } from 'next/server';
import { z, ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { ApiError, badRequest } from './errors';
import { log } from '@/lib/log';

type RouteContext = { params: Record<string, string> };
type Handler = (req: NextRequest, ctx: RouteContext) => Promise<NextResponse>;

/**
 * Wraps a route handler with uniform error handling.
 *
 * Design rule (assessment TD1/R2): NEVER mask a failure with fake data.
 * Every error surfaces as a real HTTP status + JSON body, and 5xx are logged.
 */
export function handle(handler: Handler): Handler {
  return async (req, ctx) => {
    try {
      return await handler(req, ctx);
    } catch (err) {
      if (err instanceof ApiError) {
        return NextResponse.json(
          { error: err.message, ...(err.details ? { details: err.details } : {}) },
          { status: err.status }
        );
      }
      if (err instanceof ZodError) {
        return NextResponse.json(
          { error: 'Validation failed', details: err.flatten().fieldErrors },
          { status: 400 }
        );
      }
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2025') {
          return NextResponse.json({ error: 'Record not found' }, { status: 404 });
        }
        if (err.code === 'P2002') {
          return NextResponse.json(
            { error: 'A record with this unique value already exists' },
            { status: 409 }
          );
        }
        if (err.code === 'P2003') {
          return NextResponse.json(
            { error: 'Related record not found (foreign key constraint)' },
            { status: 400 }
          );
        }
      }
      log.error('Unhandled API error', {
        method: req.method,
        path: req.nextUrl.pathname,
        err: err as Error,
      });
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  };
}

/** Parse and validate a JSON body against a zod schema (whitelist fields). */
export async function parseBody<S extends z.ZodTypeAny>(
  req: NextRequest,
  schema: S
): Promise<z.infer<S>> {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    throw badRequest('Request body must be valid JSON');
  }
  return schema.parse(json);
}

export interface Pagination {
  page: number;
  pageSize: number;
  skip: number;
  take: number;
}

/** Uniform pagination: ?page=1&pageSize=20 (max 100). */
export function getPagination(req: NextRequest, defaultPageSize = 20): Pagination {
  const sp = req.nextUrl.searchParams;
  const page = Math.max(1, parseInt(sp.get('page') || '1', 10) || 1);
  const rawSize = parseInt(sp.get('pageSize') || sp.get('limit') || String(defaultPageSize), 10);
  const pageSize = Math.min(100, Math.max(1, rawSize || defaultPageSize));
  return { page, pageSize, skip: (page - 1) * pageSize, take: pageSize };
}

export function paginated<T>(items: T[], total: number, p: Pagination) {
  return {
    pagination: {
      total,
      page: p.page,
      pageSize: p.pageSize,
      pages: Math.max(1, Math.ceil(total / p.pageSize)),
    },
    items,
  };
}
