# Production-Readiness Fixes — Implementation Report

This change set implements Sprints 1–4 of the production-readiness assessment
(July 2026): every critical blocker, the security hardening wave, and the
"backend truth" work that wires every existing screen to real, persisted data.

## Critical blockers (assessment §5, R1–R4) — all fixed

| Ref | Finding | Fix |
|-----|---------|-----|
| R4/TD2 | `/api/crm/deals` queried non-existent `db.deal` → silently returned mock, never persisted | Rewritten against `CrmDeal` with contact create-or-connect, stage normalisation (legacy lowercase accepted), `closedAt` stamping. Covered by integration tests + E2E. |
| R4/TD3 | `/api/users` used non-existent `members` relation → always mock | Rewritten against `userDepartments` (with department **and** role), pagination, search. |
| R2/TD1 | Every route's `catch {}` returned **fake mock data** on failure | All 29 routes rewritten. Central `handle()` wrapper returns real HTTP errors (401/403/404/400/409/500), logs 5xx. Zero mock fallbacks remain. |
| R1/TD5 | No API-layer authorization — any user could approve/edit/delete anything | Central guard (`requireSession` / `requireRole` / `assertOwnershipOr` / `assertCanWrite`): ownership rules on tasks/deals/contacts, requester-cannot-self-approve, admin-only user management, VIEWER read-only, last-admin protection. |
| R3/TD20 | Default credentials (`admin@raffi.com`/`admin123`) in README + seed | Removed from README; seed now takes `ADMIN_EMAIL`/`ADMIN_PASSWORD` from env, never wipes prod data, and force-disables legacy default-password accounts when another admin exists. |

## Security hardening (Sprint 2)

- **zod validation on every endpoint** (R6/TD4): `.strict()` schemas reject unknown fields (mass-assignment protection), coerce/validate types, enums, lengths.
- **Session hardening** (R8/TD15): JWT lifetime 30 days → **12 hours**.
- **Login rate limiting** (R8/TD16): 5 attempts / 15 min per IP+email with lockout; reset on success; login audit events.
- **Password policy** (R20): min 10 chars + upper + lower + digit, enforced on create/change; bcrypt cost 12; self-service change requires current password.
- **Secrets encrypted at rest** (R7/TD11): webhook signing secrets AES-256-GCM via `APP_ENCRYPTION_KEY`; secret shown once at creation; never returned by list APIs; inbound webhooks verified with timing-safe HMAC.
- **Audit on mutations** (R18): create/update/delete/approve/reject/login write `AuditLog` with actor + IP; `/api/audit` (admin) to query.

## Backend truth & UX (Sprints 3–4)

Every screen now loads real data with loading skeletons, error states with
retry, and true empty states. All dead buttons now work or honestly say why not:

- **Dashboard**: real stats (open tasks, pending approvals, users, workflows, pipeline value, 30-day sales), live activity feed, real recent deals; task modal surfaces real errors (the old build showed success on failure).
- **Tasks**: server-side filters/search/pagination, create/edit modal, complete/delete with ownership rules, assignee directory.
- **CRM**: kanban from DB, Add Deal persists (with inline contact), stage moves persist, deal edit/delete.
- **Approvals**: working Approve/Reject with authorization + comments + requester notification; request modal; cancel own pending requests.
- **Notifications**: persisted per-user; mark-read/mark-all/delete real; header bell shows real unread count.
- **KPIs**: definitions with built-in, code-evaluated data sources (no arbitrary SQL); "Recompute Now" snapshots from live data; CSV export works.
- **Workflows**: create with step builder; **Run** executes TASK/APPROVAL/NOTIFICATION steps synchronously and records instances/steps; templates can seed new workflows; webhook/integration steps are recorded as SKIPPED with the reason (worker tier = roadmap Sprint 8) — never faked.
- **Automations**: rules persist; Run-Now executes actions with full `AutomationExecution` logs, cooldown enforced; scheduler honestly deferred to Sprint 8.
- **Admin · Users**: real list/create/edit/deactivate with department+role assignment; weak passwords rejected.
- **Admin · Roles**: real per-department role CRUD (new `/api/roles`).
- **Admin · Integrations**: honest statuses (`configured`/`inactive` — no fake "connected"), suggested Wave-1 providers, sync returns 501 with the roadmap reference instead of pretending.
- **Settings**: profile save and password change actually work; sign-out works; unshipped preferences honestly labelled.
- **Global search**: header search wired to `/api/search` across tasks/deals/contacts/approvals/departments (+users for admins).

## Infrastructure & delivery hygiene

- **TypeScript + ESLint enforced in builds** (R9/TD6): `ignoreBuildErrors`/`ignoreDuringBuilds` removed; entire codebase now compiles clean (`tsc --noEmit` = 0 errors, `next lint` = 0 errors).
- **Prisma Migrate adopted** (R5/TD7/TD8): baseline `0001_init` checked in; `scripts/start.js` runs `migrate deploy` on boot and auto-baselines the existing db-push database (P3005 handling). Single database: Railway Postgres (Supabase project is orphaned — delete it at your leisure).
- **Health endpoint** (R15/TD21): `/api/health` does a real DB check; `railway.toml` healthcheck now points at it (was `/`, which 302s).
- **Pagination everywhere** (R12/TD13): capped page sizes on all list endpoints.
- **Structured logging** (R13/TD9): JSON logger for API errors/security events.
- **CI** (TD14): GitHub Actions — lint, typecheck, migrations against a service Postgres, migration-drift check, tests, build.
- **Tests**: 27 passing (12 unit: password policy, rate limiter, crypto, validation; 15 integration: authz boundaries U06–U08, persistence U09/U13/U14, false-success elimination U11, password policy U26/U27, audit U30) + a 21-check E2E smoke script (`scripts/` equivalent run against the built app: login, CRUD, KPI compute, workflow execution, honest 501s).
- **Deterministic builds**: Inter font self-hosted via `@fontsource/inter` (no Google Fonts fetch at build).

## Verification performed

- `tsc --noEmit`: **0 errors** (strict checks on)
- `next lint`: **0 errors** (125 pre-existing `any`-style warnings remain, non-blocking)
- `vitest`: **27/27 pass** against a real PostgreSQL 17
- `next build`: **succeeds** with enforcement enabled
- Full E2E against `next start` + real DB: **21/21 checks pass**

## Not in scope for this pass (per agreed plan)

Sprints 5–10 of the roadmap: clienteling/360 profiles, appointments,
serialised inventory/POS, repairs, special orders, the always-on worker tier
(cron/event triggers, email/SMS delivery), and live integration adapters
(Lightspeed/Klaviyo/Google SSO). The UI copy now references these honestly
wherever a capability is deferred.
