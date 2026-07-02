import bcryptjs from 'bcryptjs';
import { badRequest } from '@/lib/api/errors';

export const PASSWORD_POLICY =
  'Password must be at least 10 characters and include an uppercase letter, a lowercase letter, and a number.';

/** Enforce the password policy (assessment R20). Throws 400 on violation. */
export function assertStrongPassword(password: string): void {
  const ok =
    typeof password === 'string' &&
    password.length >= 10 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password);
  if (!ok) throw badRequest(PASSWORD_POLICY);
}

export async function hashPassword(password: string): Promise<string> {
  return bcryptjs.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcryptjs.compare(password, hash);
}
