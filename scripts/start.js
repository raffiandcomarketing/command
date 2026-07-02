/**
 * Production start script: apply migrations, then boot Next.js.
 *
 * Handles the migration baseline for databases that predate Prisma Migrate
 * (this project previously used `prisma db push` with no history - assessment
 * R5/TD7). If the schema already exists but the _prisma_migrations table
 * doesn't (error P3005), the initial migration is marked as applied instead
 * of re-run, then any newer migrations are deployed.
 */
const { execSync } = require('child_process');

function run(cmd) {
  console.log(`[start] ${cmd}`);
  return execSync(cmd, { stdio: 'inherit' });
}

function tryRun(cmd) {
  try {
    run(cmd);
    return true;
  } catch {
    return false;
  }
}

console.log('[start] Applying database migrations...');
if (!tryRun('npx prisma migrate deploy')) {
  console.log('[start] migrate deploy failed - attempting baseline resolve for a pre-existing (db push) schema');
  if (!tryRun('npx prisma migrate resolve --applied 0001_init')) {
    console.error('[start] Could not baseline the database. Refusing to start with an unmigrated schema.');
    process.exit(1);
  }
  run('npx prisma migrate deploy');
}

console.log('[start] Starting Next.js...');
run('npx next start');
