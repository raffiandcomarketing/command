/**
 * Client-side fetch helper: uniform JSON handling + real error surfaces
 * (assessment: "no control ships without wired handler + error state").
 */
export class ApiClientError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
  }
}

export async function api<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  });

  let body: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = { error: text };
    }
  }

  if (!res.ok) {
    const err = (body ?? {}) as { error?: string; details?: unknown };
    let message = err.error || `Request failed (${res.status})`;
    if (err.details && typeof err.details === 'object') {
      const fields = Object.entries(err.details as Record<string, unknown>)
        .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : String(v)}`)
        .slice(0, 3)
        .join('; ');
      if (fields) message += ` — ${fields}`;
    }
    throw new ApiClientError(res.status, message, err.details);
  }

  return body as T;
}
