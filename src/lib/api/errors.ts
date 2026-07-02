/**
 * Typed API error used across all route handlers.
 * Thrown anywhere inside a handler and converted to a JSON response
 * by the `handle()` wrapper in ./http.ts.
 */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const unauthorized = (msg = 'Unauthorized') => new ApiError(401, msg);
export const forbidden = (msg = 'Forbidden') => new ApiError(403, msg);
export const notFound = (msg = 'Not found') => new ApiError(404, msg);
export const badRequest = (msg = 'Bad request', details?: unknown) =>
  new ApiError(400, msg, details);
export const conflict = (msg = 'Conflict') => new ApiError(409, msg);
