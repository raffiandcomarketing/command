# Deploy Runbook — Raffi Command Centre (post-fix release)

## 0. What ships

One release containing all Sprint 1–4 fixes (see CHANGES.md). The deploy is
designed to be **zero-touch for the database**: on boot, the app baselines the
existing schema into Prisma Migrate and applies nothing destructive.

## 1. Set environment variables (Railway → command service → Variables)

Required **before** deploying:

| Variable | Value |
|---|---|
| `ADMIN_EMAIL` | your admin email (e.g. al@raffiandco.com) |
| `ADMIN_PASSWORD` | strong password — min 10 chars, upper+lower+number |
| `APP_ENCRYPTION_KEY` | long random string (`openssl rand -base64 32`) |
| `NEXTAUTH_SECRET` | keep existing, or rotate (`openssl rand -base64 32`) — rotating logs everyone out |
| `NEXTAUTH_URL` | `https://command-production.up.railway.app` (should already exist) |
| `DATABASE_URL` | already set by Railway Postgres — leave as is |

## 2. Push the code

The release is delivered as a git bundle (`command-fixes.bundle`) containing
one commit on top of the current `main`. From any machine with GitHub access:

```bash
git clone https://github.com/raffiandcomarketing/command.git
cd command
git pull "/path/to/command-fixes.bundle" main
git push origin main
```

(If you already have a clone, just run the last two commands inside it.)

Railway auto-deploys from GitHub. The new start command
(`node scripts/start.js`) will:
1. Run `prisma migrate deploy`; on the first boot it marks the baseline
   migration as applied (the DB predates Prisma Migrate).
2. Start Next.js.

The health check now hits `/api/health` (real DB check), so the deploy is only
marked healthy when the database is reachable.

## 3. Rotate the seeded credentials (one-time, right after first boot)

Run the seed once against production to create your admin from env and disable
the legacy default-password accounts:

```bash
railway run npm run db:seed
```

Expected output: `Admin account ensured for <ADMIN_EMAIL>` and
`Disabled legacy default-credential account ...` for any of the old
`admin@raffi.com` / `john@raffi.com` / `alec@raffi.com` accounts still using
default passwords. (The seed never deletes data.)

## 4. Smoke test (5 minutes)

1. `https://<app>/api/health` → `{"status":"ok","db":"up"}`
2. Log in with `ADMIN_EMAIL` / `ADMIN_PASSWORD`. Old `admin123` must fail.
3. Dashboard shows real numbers (they may be small — that's the truth now).
4. Create a task → appears after a hard refresh.
5. CRM → Add Deal → refresh → still there; move it to Sale.
6. KPIs → Recompute Now → cards populate.
7. Admin → Users → list shows real accounts.
8. In an incognito window, hit `/api/tasks` → JSON `{"error":"Unauthorized"}`.

## 5. Post-deploy housekeeping

- **Supabase**: the paused project (`raffiandcomarketing's Project`) is unused
  by this app. Delete it (or keep it parked) to close assessment risk R5.
- **GitHub**: enable branch protection on `master` requiring the new CI
  workflow to pass.
- **Backups**: enable/verify Railway Postgres backups and do one restore drill
  (assessment R16).
- **User accounts**: create real staff accounts in Admin → Users (old demo
  users are disabled if they still had default passwords).

## 6. Rollback

Railway → Deployments → redeploy the previous build. The database is
compatible both ways (the baseline migration makes no schema changes).

## Known limitations shipped honestly (roadmap Sprints 5–10)

- Automation/workflow **scheduled + event triggers** and **email/SMS delivery**
  need the worker tier (Sprint 8). Manual runs work and are logged.
- Integration **live sync** (Lightspeed, Klaviyo, Google SSO) is Sprint 9;
  sync endpoints return 501 with a clear message instead of faking success.
- Retail spine modules (clienteling, appointments, POS/inventory, repairs,
  special orders) are Sprints 5–7.
