import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

/**
 * PRISMA_PG_ADAPTER=1 switches to the pg driver adapter + WASM query engine.
 * This exists for test environments where Prisma's native engines cannot be
 * downloaded; production uses the default native engine. The indirect
 * require hides these optional modules from webpack's static analysis.
 */
function createClient(): PrismaClient {
  if (process.env.PRISMA_PG_ADAPTER === '1') {
    // eslint-disable-next-line no-eval
    const req = eval('require') as NodeRequire;
    const { Pool } = req('pg');
    const { PrismaPg } = req('@prisma/adapter-pg');
    const { PrismaClient: WasmPrismaClient } = req('@prisma/client/wasm');
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    return new WasmPrismaClient({ adapter: new PrismaPg(pool) }) as unknown as PrismaClient;
  }
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  });
}

export const db = globalForPrisma.prisma || createClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
