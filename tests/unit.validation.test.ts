import { describe, it, expect } from 'vitest';
import {
  createTaskSchema,
  createDealSchema,
  createUserSchema,
  decideApprovalSchema,
  crmStageInput,
} from '@/lib/validate';

describe('zod validation (assessment R6 / UAT U32)', () => {
  it('rejects unknown fields (mass-assignment protection)', () => {
    const res = createTaskSchema.safeParse({ title: 'ok', role: 'ADMIN', isAdmin: true });
    expect(res.success).toBe(false);
  });

  it('rejects an empty task title (UAT U10)', () => {
    expect(createTaskSchema.safeParse({ title: '   ' }).success).toBe(false);
  });

  it('accepts legacy lowercase CRM stages and normalises them', () => {
    expect(crmStageInput.parse('lead')).toBe('LEAD');
    expect(crmStageInput.parse('SALE')).toBe('SALE');
    expect(() => crmStageInput.parse('bogus')).toThrow();
  });

  it('rejects non-numeric deal values (UAT U15)', () => {
    const res = createDealSchema.safeParse({ title: 'Ring', contactName: 'A', value: 'abc' });
    expect(res.success).toBe(false);
  });

  it('requires a contact for new deals', () => {
    expect(createDealSchema.safeParse({ title: 'Ring' }).success).toBe(false);
    expect(createDealSchema.safeParse({ title: 'Ring', contactName: 'Sarah' }).success).toBe(true);
  });

  it('validates user emails and roles', () => {
    expect(createUserSchema.safeParse({ name: 'A', email: 'not-an-email', password: 'x' }).success).toBe(false);
    expect(
      createUserSchema.safeParse({ name: 'A', email: 'a@b.co', password: 'x', role: 'SUPERGOD' }).success
    ).toBe(false);
  });

  it('only allows APPROVED/REJECTED decisions', () => {
    expect(decideApprovalSchema.safeParse({ decision: 'APPROVED' }).success).toBe(true);
    expect(decideApprovalSchema.safeParse({ decision: 'MAYBE' }).success).toBe(false);
  });
});
