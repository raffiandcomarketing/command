/**
 * Minimal structured JSON logger.
 * Writes one JSON object per line to stdout/stderr so Railway (and any
 * log drain) can parse fields. Replaces ad-hoc console.* usage.
 */
type Level = 'debug' | 'info' | 'warn' | 'error';

const LEVELS: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 };

const configured = (process.env.LOG_LEVEL as Level) || 'info';
const threshold = LEVELS[configured] ?? 20;

function write(level: Level, msg: string, context?: Record<string, unknown>) {
  if (LEVELS[level] < threshold) return;
  const entry = {
    level,
    time: new Date().toISOString(),
    msg,
    ...context,
  };
  const line = JSON.stringify(entry, (_k, v) =>
    v instanceof Error ? { name: v.name, message: v.message, stack: v.stack } : v
  );
  if (level === 'error' || level === 'warn') {
    process.stderr.write(line + '\n');
  } else {
    process.stdout.write(line + '\n');
  }
}

export const log = {
  debug: (msg: string, context?: Record<string, unknown>) => write('debug', msg, context),
  info: (msg: string, context?: Record<string, unknown>) => write('info', msg, context),
  warn: (msg: string, context?: Record<string, unknown>) => write('warn', msg, context),
  error: (msg: string, context?: Record<string, unknown>) => write('error', msg, context),
};
