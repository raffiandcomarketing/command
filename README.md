# Raffi Command Centre

A premium internal business operating system for luxury retail, built with Next.js 14, TypeScript, Tailwind CSS, and PostgreSQL.

## Architecture Overview

This is not a simple CRM. It is a **business automation operating system** designed to orchestrate departments, workflows, tasks, approvals, automations, and integrations across an entire luxury retail operation.

### Core Systems

- **Department Engine** - 18 departments with role hierarchies and team management
- **Workflow Engine** - Define and execute multi-step business processes with triggers, conditions, and actions
- **Automation Engine** - Rule-based automation with scheduled, event-driven, condition-based, and webhook triggers
- **Approval System** - Multi-step approval routing with escalation logic
- **Task Orchestration** - Task management with priorities, assignments, recurring schedules, and workflow integration
- **KPI Dashboard** - Real-time KPI tracking with thresholds, alerts, and trend analysis
- **Notification Engine** - Multi-channel notifications with escalation
- **Integration Layer** - Abstracted adapter pattern for ERP, POS, email, calendar, and more
- **Job Queue** - Database-backed async job processing with retry logic
- **Webhook System** - HMAC-signed outgoing webhooks and verified incoming webhook handling
- **Audit Trail** - Comprehensive activity and audit logging across all operations
- **RBAC** - Enterprise role-based access control with department-level permissions

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | NextAuth.js |
| Icons | Lucide React |
| Validation | Zod |
| Date | date-fns |

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd command-centre

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Set up environment variables
cp .env.example .env
# Edit .env with your database URL and secrets

# Push schema to database
npx prisma db push

# Seed the database
npm run db:seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Default Login

- Email: `admin@raffi.com`
- Password: `admin123`

## Project Structure

```
command-centre/
├── prisma/
│   ├── schema.prisma          # Database schema (900+ lines, 30+ models)
│   └── seed.ts                # Seed data for all departments and roles
├── src/
│   ├── app/
│   │   ├── (auth)/login/      # Authentication pages
│   │   ├── (dashboard)/       # Main app pages
│   │   │   ├── departments/   # Department and role pages
│   │   │   ├── workflows/     # Workflow management
│   │   │   ├── tasks/         # Task management
│   │   │   ├── approvals/     # Approval system
│   │   │   ├── automations/   # Automation rules
│   │   │   ├── kpis/          # KPI dashboards
│   │   │   ├── notifications/ # Notification center
│   │   │   ├── admin/         # Admin panel (6 sub-pages)
│   │   │   └── settings/      # User settings
│   │   └── api/               # 27 API route handlers
│   ├── components/
│   │   ├── ui/                # 18 base UI components
│   │   ├── common/            # 7 business components
│   │   └── layout/            # Sidebar, header, breadcrumbs
│   ├── lib/
│   │   ├── auth/              # NextAuth configuration
│   │   ├── automation/        # Automation engine + event bus
│   │   ├── db/                # Prisma client singleton
│   │   ├── integrations/      # Integration adapter layer
│   │   ├── queue/             # Job queue processor
│   │   ├── utils/             # 23 utility functions
│   │   └── webhooks/          # Webhook send/verify system
│   ├── config/
│   │   ├── navigation.ts      # Full sidebar navigation tree
│   │   └── departments.ts     # Department and role metadata
│   ├── types/
│   │   └── index.ts           # 57+ TypeScript interfaces
│   └── styles/
│       └── globals.css        # Global styles and design tokens
├── Dockerfile                 # Multi-stage production build
├── railway.toml               # Railway deployment config
└── package.json
```

## Departments (18)

Executive, Marketing, Ecommerce, Retail Operations, Sales, Client Experience, Inventory/Merchandising, Repairs/Service, Purchasing/Procurement, Finance/Accounting, Human Resources, IT/Systems, Logistics/Shipping, Events/Activations, Visual Merchandising, Customer Care, Legal/Compliance, Facilities/Maintenance

Each department includes role hierarchies with dedicated pages and dashboards.

## API Routes (27)

All REST endpoints at `/api/`:

- `/api/auth/*` - Authentication
- `/api/departments` - Department CRUD
- `/api/tasks` - Task management
- `/api/workflows` - Workflow definitions and execution
- `/api/approvals` - Approval routing
- `/api/automations` - Automation rules and execution
- `/api/kpis` - KPI definitions and snapshots
- `/api/notifications` - Notification management
- `/api/webhooks` - Webhook management and incoming handlers
- `/api/integrations` - Integration management and sync
- `/api/users` - User management
- `/api/audit` - Audit log queries
- `/api/jobs` - Job queue management
- `/api/search` - Global search

## Railway Deployment

### 1. Create Railway Project

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Create project
railway init
```

### 2. Add PostgreSQL

In Railway dashboard, add a PostgreSQL plugin. Copy the `DATABASE_URL`.

### 3. Set Environment Variables

```bash
railway variables set DATABASE_URL="<from-railway-postgres>"
railway variables set NEXTAUTH_SECRET="$(openssl rand -base64 32)"
railway variables set NEXTAUTH_URL="https://your-app.railway.app"
railway variables set NODE_ENV="production"
```

### 4. Deploy

```bash
# Push to deploy
railway up

# Or connect to GitHub for auto-deploy
railway link
```

### 5. Run Migrations

```bash
railway run npx prisma db push
railway run npm run db:seed
```

## GitHub Setup

```bash
git init
git add .
git commit -m "Initial commit: Raffi Command Centre"
git remote add origin <your-github-url>
git push -u origin main
```

## Automation Roadmap

### Phase 1 - Foundation (Current)
- Department and role structure
- Task and workflow management
- Approval routing
- KPI dashboards
- UI shell and navigation

### Phase 2 - Active Automation
- Cron-based recurring tasks
- Event-driven workflow triggers
- Email notification delivery
- Slack/Teams integration
- KPI threshold alerting

### Phase 3 - Integration Layer
- ERP sync (inventory, orders)
- POS integration (sales data)
- Ecommerce platform sync
- Calendar integration
- HR system sync

### Phase 4 - Intelligence
- Workflow analytics and optimization
- Predictive KPI forecasting
- Automated task prioritization
- Customer lifecycle automation
- Inventory reorder automation

### Phase 5 - Full Operating System
- Custom workflow builder (visual)
- Department-specific automation templates
- Cross-department orchestration
- AI-powered insights
- Mobile companion app
- Real-time collaboration

## License

Private and proprietary. All rights reserved.
