import { describe, it, expect } from 'vitest';
import { assertStrongPassword } from '@/lib/security/password';
import { rateLimit, resetRateLimit } from '@/lib/api/rate-limit';
import { encryptSecret, decryptSecret } from '@/lib/security/crypto';
import { ApiError } from '@/lib/api/errors';

describe('password policy (assessment R20 / UAT U27)', () => {
  it('rejects short/simple passwords', () => {
    for (const bad of ['1', 'password', 'short1A', 'alllowercase1', 'ALLUPPERCASE1', 'NoNumbersHere']) {
      expect(() => assertStrongPassword(bad), bad).toThrow(ApiError);
    }
  });

  it('accepts a strong password', () => {
    expect(() => assertStrongPassword('Correct-Horse-9')).not.toThrow();
  });
});

describe('login rate limiter (assessment R8 / UAT U05)', () => {
  it('blocks after the limit and reports retry-after', () => {
    const key = 'test:limiter';
    resetRateLimit(key);
    for (let i = 0; i < 5; i++) {
      expect(rateLimit(key, 5, 60_000).allowed).toBe(true);
    }
    const blocked = rateLimit(key, 5, 60_000);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it('resets on demand (successful login)', () => {
    const key = 'test:limiter2';
    for (let i = 0; i < 5; i++) rateLimit(key, 5, 60_000);
    resetRateLimit(key);
    expect(rateLimit(key, 5, 60_000).allowed).toBe(true);
  });
});

describe('secret encryption (assessment R7)', () => {
  it('round-trips with AES-256-GCM', () => {
    process.env.APP_ENCRYPTION_KEY = 'test-key-for-unit-tests-only-0123456789';
    const secret = 'whsec_' + 'a'.repeat(40);
    const stored = encryptSecret(secret);
    expect(stored.startsWith('enc:v1:')).toBe(true);
    expect(stored).not.toContain(secret);
    expect(decryptSecret(stored)).toBe(secret);
  });
});
