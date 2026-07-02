/**
 * Integration tests: real route handlers against a real PostgreSQL database.
 * Session identity is mocked per-request; everything below the guard is live.
 *
 * Covers the assessment's critical UAT cases:
 *   U06/U07/U08 - authorization boundaries
 *   U09         - task create persists
 *   U11         - no false success on failure
 *   U13         - CRM deal persists (the old db.deal bug)
 *   U26/U27     - admin user creation + password policy
 *   U30         - audit written on mutations
 */
import { beforeAll, afterAll, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

// --- session mock -----------------------------------------------------------
const currentUser: { value: Record<string, unknown> | null } = { value: null };

vi.mock('next-auth/next', () => ({
  getServerSession: vi.fn(async () => (currentUser.value ? { user: currentUser.value } : null)),
}));
vi.mock('next-auth', () => ({ default: vi.fn(), getServerSession: vi.fn(async () => null) }));

import { db } from '@/lib/db';
import { hashPassword } from '@/lib/security/password';

import * as tasksRoute from '@/app/api/tasks/route';
import * as taskIdRoute from '@/app/api/tasks/[id]/route';
import * as approvalsRoute from '@/app/api/approvals/route';
import * as approvalIdRoute from '@/app/api/approvals/[id]/route';
import * as usersRoute from '@/app/api/users/route';
import * as dealsRoute from '@/app/api/crm/deals/route';
import * as dealIdRoute from '@/app/api/crm/deals/[id]/route';
import * as healthRoute from '@/app/api/health/route';
import * as notificationsRoute from '@/app/api/notifications/route';

const asUser = (u: { id: string; role: string; name?: string; email?: string }) => {
  currentUser.value = {
    id: u.id,
    role: u.role,
    name: u.name ?? 'Test User',
    email: u.email ?? 'test@example.com',
    departmentSlugs: [],
    isActive: true,
  };
};
const asAnonymous = () => {
  currentUser.value = null;
};

const req = (method: string, url: string, body?: unknown) =>
  new NextRequest(`http://localhost${url}`, {
    method,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    headers: { 'Content-Type': 'application/json' },
  });

let admin: { id: string };
let member: { id: string };
let otherMember: { id: string };

beforeAll(async () => {
  const stamp = Date.now();
  const pw = await hashPassword('Testing-123-Aa');
  admin = await db.user.create({
    data: { email: `it-admin-${stamp}@test.local`, name: 'IT Admin', passwordHash: pw, role: 'ADMIN' },
  });
  member = await db.user.create({
    data: { email: `it-member-${stamp}@test.local`, name: 'IT Member', passwordHash: pw, role: 'MEMBER' },
  });
  otherMember = await db.user.create({
    data: { email: `it-member2-${stamp}@test.local`, name: 'IT Member Two', passwordHash: pw, role: 'MEMBER' },
  });
});

afterAll(async () => {
  await db.$disconnect();
});

describe('health endpoint (assessment R15)', () => {
  it('returns ok with a live DB check', async () => {
    const res = await healthRoute.GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('ok');
    expect(body.db).toBe('up');
  });
});

describe('authentication gate', () => {
  it('rejects anonymous API access with 401 (no mock fallback)', async () => {
    asAnonymous();
    const res = await tasksRoute.GET(req('GET', '/api/tasks'), { params: {} });
    expect(res.status).toBe(401);
  });
});

describe('tasks (UAT U09/U10/U11/U08)', () => {
  it('creates a task that persists to the database', async () => {
    asUser({ id: member.id, role: 'MEMBER' });
    const res = await tasksRoute.POST(req('POST', '/api/tasks', { title: 'Integration task', priority: 'HIGH' }), {
      params: {},
    });
    expect(res.status).toBe(201);
    const { task } = await res.json();
    const inDb = await db.task.findUnique({ where: { id: task.id } });
    expect(inDb?.title).toBe('Integration task');
    expect(inDb?.creatorId).toBe(member.id);
  });

  it('rejects an empty title with 400, not fake success', async () => {
    asUser({ id: member.id, role: 'MEMBER' });
    const res = await tasksRoute.POST(req('POST', '/api/tasks', { title: '' }), { params: {} });
    expect(res.status).toBe(400);
  });

  it("prevents a member editing another user's task (403)", async () => {
    asUser({ id: member.id, role: 'MEMBER' });
    const created = await tasksRoute.POST(req('POST', '/api/tasks', { title: 'Owned by member' }), { params: {} });
    const { task } = await created.json();

    asUser({ id: otherMember.id, role: 'MEMBER' });
    const res = await taskIdRoute.PATCH(req('PATCH', `/api/tasks/${task.id}`, { status: 'COMPLETED' }), {
      params: { id: task.id },
    });
    expect(res.status).toBe(403);
  });

  it('writes an audit entry on create (UAT U30)', async () => {
    asUser({ id: member.id, role: 'MEMBER' });
    const created = await tasksRoute.POST(req('POST', '/api/tasks', { title: 'Audited task' }), { params: {} });
    const { task } = await created.json();
    // audit writes are fire-and-forget; allow a tick
    await new Promise((r) => setTimeout(r, 150));
    const audit = await db.auditLog.findFirst({ where: { entity: 'Task', entityId: task.id, action: 'create' } });
    expect(audit).not.toBeNull();
    expect(audit?.userId).toBe(member.id);
  });
});

describe('approvals authorization (UAT U07)', () => {
  it('blocks the requester deciding their own approval', async () => {
    asUser({ id: member.id, role: 'MEMBER' });
    const created = await approvalsRoute.POST(
      req('POST', '/api/approvals', { title: 'Self-approval attempt', type: 'PURCHASE' }),
      { params: {} }
    );
    const { approval } = await created.json();

    const res = await approvalIdRoute.POST(req('POST', `/api/approvals/${approval.id}`, { decision: 'APPROVED' }), {
      params: { id: approval.id },
    });
    expect(res.status).toBe(403);
  });

  it('blocks an unrelated member deciding; allows a manager; notifies requester', async () => {
    asUser({ id: member.id, role: 'MEMBER' });
    const created = await approvalsRoute.POST(
      req('POST', '/api/approvals', { title: 'Needs manager', type: 'EXPENSE' }),
      { params: {} }
    );
    const { approval } = await created.json();

    asUser({ id: otherMember.id, role: 'MEMBER' });
    const deniedRes = await approvalIdRoute.POST(
      req('POST', `/api/approvals/${approval.id}`, { decision: 'APPROVED' }),
      { params: { id: approval.id } }
    );
    expect(deniedRes.status).toBe(403);

    asUser({ id: admin.id, role: 'ADMIN' });
    const okRes = await approvalIdRoute.POST(
      req('POST', `/api/approvals/${approval.id}`, { decision: 'APPROVED', comments: 'Looks good' }),
      { params: { id: approval.id } }
    );
    expect(okRes.status).toBe(200);

    const inDb = await db.approval.findUnique({ where: { id: approval.id } });
    expect(inDb?.status).toBe('APPROVED');
    expect(inDb?.approverId).toBe(admin.id);

    const notification = await db.notification.findFirst({
      where: { userId: member.id, type: 'APPROVAL' },
      orderBy: { createdAt: 'desc' },
    });
    expect(notification).not.toBeNull();
  });
});

describe('admin users API (UAT U06/U26/U27, fixes R4 members-relation bug)', () => {
  it('blocks non-admins from listing users (403)', async () => {
    asUser({ id: member.id, role: 'MEMBER' });
    const res = await usersRoute.GET(req('GET', '/api/users'), { params: {} });
    expect(res.status).toBe(403);
  });

  it('lists real users from the DB for admins', async () => {
    asUser({ id: admin.id, role: 'ADMIN' });
    const res = await usersRoute.GET(req('GET', '/api/users?pageSize=100'), { params: {} });
    expect(res.status).toBe(200);
    const body = await res.json();
    const emails = body.users.map((u: { email: string }) => u.email);
    expect(emails).toContain(admin.id ? (await db.user.findUnique({ where: { id: admin.id } }))?.email : '');
  });

  it('rejects weak passwords on user creation (UAT U27)', async () => {
    asUser({ id: admin.id, role: 'ADMIN' });
    const res = await usersRoute.POST(
      req('POST', '/api/users', { name: 'Weak', email: `weak-${Date.now()}@test.local`, password: '1' }),
      { params: {} }
    );
    expect(res.status).toBe(400);
  });

  it('creates a user with a hashed strong password', async () => {
    asUser({ id: admin.id, role: 'ADMIN' });
    const email = `strong-${Date.now()}@test.local`;
    const res = await usersRoute.POST(
      req('POST', '/api/users', { name: 'Strong', email, password: 'Str0ng-Password!' }),
      { params: {} }
    );
    expect(res.status).toBe(201);
    const inDb = await db.user.findUnique({ where: { email } });
    expect(inDb).not.toBeNull();
    expect(inDb?.passwordHash).not.toContain('Str0ng');
  });
});

describe('CRM deals (UAT U13/U14 - fixes the db.deal bug R4/TD2)', () => {
  it('creates a deal with an inline contact and persists it', async () => {
    asUser({ id: member.id, role: 'MEMBER' });
    const res = await dealsRoute.POST(
      req('POST', '/api/crm/deals', {
        title: 'Integration Diamond Ring',
        contactName: `IT Contact ${Date.now()}`,
        value: 12500,
        stage: 'lead', // legacy lowercase accepted + normalised
      }),
      { params: {} }
    );
    expect(res.status).toBe(201);
    const { deal } = await res.json();
    expect(deal.stage).toBe('LEAD');

    const inDb = await db.crmDeal.findUnique({ where: { id: deal.id }, include: { contact: true } });
    expect(inDb?.value).toBe(12500);
    expect(inDb?.contact.name).toContain('IT Contact');
  });

  it('moves a deal through stages and stamps closedAt on SALE', async () => {
    asUser({ id: member.id, role: 'MEMBER' });
    const created = await dealsRoute.POST(
      req('POST', '/api/crm/deals', { title: 'Stage mover', contactName: `Mover ${Date.now()}`, value: 500 }),
      { params: {} }
    );
    const { deal } = await created.json();

    const moved = await dealIdRoute.PATCH(req('PATCH', `/api/crm/deals/${deal.id}`, { stage: 'SALE' }), {
      params: { id: deal.id },
    });
    expect(moved.status).toBe(200);
    const inDb = await db.crmDeal.findUnique({ where: { id: deal.id } });
    expect(inDb?.stage).toBe('SALE');
    expect(inDb?.closedAt).not.toBeNull();
  });
});

describe('notifications scoping', () => {
  it('members cannot create notifications for other users', async () => {
    asUser({ id: member.id, role: 'MEMBER' });
    const res = await notificationsRoute.POST(
      req('POST', '/api/notifications', { userId: otherMember.id, title: 'Spoof', message: 'nope' }),
      { params: {} }
    );
    expect(res.status).toBe(403);
  });
});
