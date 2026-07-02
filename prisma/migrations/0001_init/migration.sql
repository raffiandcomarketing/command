-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'EXECUTIVE', 'MANAGER', 'MEMBER', 'VIEWER');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'REVIEW', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT', 'CRITICAL');

-- CreateEnum
CREATE TYPE "WorkflowTriggerType" AS ENUM ('MANUAL', 'SCHEDULED', 'EVENT', 'WEBHOOK', 'CONDITION');

-- CreateEnum
CREATE TYPE "WorkflowInstanceStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'FAILED', 'CANCELLED', 'PAUSED');

-- CreateEnum
CREATE TYPE "WorkflowStepType" AS ENUM ('TASK', 'APPROVAL', 'NOTIFICATION', 'WEBHOOK', 'CONDITION', 'DELAY', 'INTEGRATION');

-- CreateEnum
CREATE TYPE "WorkflowStepStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "AutomationTriggerType" AS ENUM ('SCHEDULE', 'EVENT', 'CONDITION', 'WEBHOOK', 'MANUAL');

-- CreateEnum
CREATE TYPE "AutomationExecutionStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "ApprovalType" AS ENUM ('GENERAL', 'PURCHASE', 'EXPENSE', 'LEAVE', 'WORKFLOW', 'DOCUMENT', 'ACCESS');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'ESCALATED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "KpiDirection" AS ENUM ('HIGHER_IS_BETTER', 'LOWER_IS_BETTER');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('SOP', 'POLICY', 'GUIDE', 'TEMPLATE', 'CHECKLIST', 'REPORT');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('INFO', 'WARNING', 'ALERT', 'TASK', 'APPROVAL', 'WORKFLOW', 'SYSTEM', 'ESCALATION');

-- CreateEnum
CREATE TYPE "AlertSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('KPI_THRESHOLD', 'SYSTEM', 'DEADLINE', 'ESCALATION', 'INTEGRATION');

-- CreateEnum
CREATE TYPE "IntegrationType" AS ENUM ('ERP', 'POS', 'ECOMMERCE', 'EMAIL', 'SMS', 'CALENDAR', 'HR', 'FINANCE', 'SHIPPING', 'ANALYTICS', 'CUSTOM');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'RETRY');

-- CreateEnum
CREATE TYPE "RecurringScheduleType" AS ENUM ('TASK', 'WORKFLOW', 'AUTOMATION', 'REPORT');

-- CreateEnum
CREATE TYPE "CrmStage" AS ENUM ('LEAD', 'OPPORTUNITY', 'SALE');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "avatar" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'MEMBER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departments" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "color" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "departmentId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teams" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "leadUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_departments" (
    "userId" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "user_departments_pkey" PRIMARY KEY ("userId", "departmentId")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "module" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("roleId", "permissionId")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "TaskStatus" NOT NULL DEFAULT 'PENDING',
    "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "dueDate" TIMESTAMP(3),
    "assigneeId" TEXT,
    "creatorId" TEXT NOT NULL,
    "departmentId" TEXT,
    "roleId" TEXT,
    "parentTaskId" TEXT,
    "workflowInstanceId" TEXT,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurringSchedule" JSONB,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflows" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "departmentId" TEXT,
    "triggerType" "WorkflowTriggerType" NOT NULL,
    "triggerConfig" JSONB NOT NULL,
    "steps" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isTemplate" BOOLEAN NOT NULL DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "workflows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_instances" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "status" "WorkflowInstanceStatus" NOT NULL DEFAULT 'ACTIVE',
    "currentStepIndex" INTEGER NOT NULL DEFAULT 0,
    "context" JSONB,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "triggeredById" TEXT,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "workflow_instances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_steps" (
    "id" TEXT NOT NULL,
    "workflowInstanceId" TEXT NOT NULL,
    "stepIndex" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "type" "WorkflowStepType" NOT NULL,
    "config" JSONB NOT NULL,
    "status" "WorkflowStepStatus" NOT NULL DEFAULT 'PENDING',
    "result" JSONB,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "workflow_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automation_rules" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "departmentId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "triggerType" "AutomationTriggerType" NOT NULL,
    "triggerConfig" JSONB NOT NULL,
    "conditions" JSONB,
    "actions" JSONB[],
    "cooldownMinutes" INTEGER,
    "lastTriggeredAt" TIMESTAMP(3),
    "executionCount" INTEGER NOT NULL DEFAULT 0,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "automation_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automation_executions" (
    "id" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "status" "AutomationExecutionStatus" NOT NULL DEFAULT 'PENDING',
    "triggerData" JSONB,
    "result" JSONB,
    "error" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "duration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "automation_executions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approvals" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "ApprovalType" NOT NULL,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "requesterId" TEXT NOT NULL,
    "approverId" TEXT,
    "departmentId" TEXT,
    "data" JSONB,
    "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "dueDate" TIMESTAMP(3),
    "decidedAt" TIMESTAMP(3),
    "comments" TEXT,
    "escalatedAt" TIMESTAMP(3),
    "escalationLevel" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "approvals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approval_steps" (
    "id" TEXT NOT NULL,
    "approvalId" TEXT NOT NULL,
    "stepOrder" INTEGER NOT NULL,
    "approverId" TEXT NOT NULL,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "decidedAt" TIMESTAMP(3),
    "comments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "approval_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kpi_definitions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "departmentId" TEXT,
    "roleId" TEXT,
    "unit" TEXT NOT NULL,
    "targetValue" DOUBLE PRECISION NOT NULL,
    "warningThreshold" DOUBLE PRECISION NOT NULL,
    "criticalThreshold" DOUBLE PRECISION NOT NULL,
    "direction" "KpiDirection" NOT NULL,
    "dataSource" TEXT NOT NULL,
    "query" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "kpi_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kpi_snapshots" (
    "id" TEXT NOT NULL,
    "kpiId" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "period" TEXT NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "kpi_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "departmentId" TEXT,
    "roleId" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "DocumentStatus" NOT NULL DEFAULT 'DRAFT',
    "authorId" TEXT NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),
    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),
    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alerts" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "severity" "AlertSeverity" NOT NULL,
    "type" "AlertType" NOT NULL,
    "departmentId" TEXT,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedById" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integrations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "IntegrationType" NOT NULL,
    "provider" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSyncAt" TIMESTAMP(3),
    "departmentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "integrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhooks" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "events" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "integrationId" TEXT,
    "lastTriggeredAt" TIMESTAMP(3),
    "failureCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "webhooks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook_logs" (
    "id" TEXT NOT NULL,
    "webhookId" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "response" JSONB,
    "statusCode" INTEGER,
    "success" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "webhook_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "changes" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "departmentId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_queue" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'PENDING',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 3,
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "error" TEXT,
    "result" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "job_queue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recurring_schedules" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cronExpression" TEXT NOT NULL,
    "type" "RecurringScheduleType" NOT NULL,
    "config" JSONB NOT NULL,
    "departmentId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastRunAt" TIMESTAMP(3),
    "nextRunAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "recurring_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_contacts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "company" TEXT,
    "notes" TEXT,
    "createdById" TEXT NOT NULL,
    "departmentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "crm_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_deals" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "stage" "CrmStage" NOT NULL DEFAULT 'LEAD',
    "contactId" TEXT NOT NULL,
    "assigneeId" TEXT,
    "departmentId" TEXT,
    "notes" TEXT,
    "expectedCloseDate" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "crm_deals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "departments_slug_key" ON "departments"("slug");
CREATE UNIQUE INDEX "roles_departmentId_slug_key" ON "roles"("departmentId", "slug");
CREATE UNIQUE INDEX "permissions_slug_key" ON "permissions"("slug");
CREATE UNIQUE INDEX "workflows_slug_version_key" ON "workflows"("slug", "version");
CREATE UNIQUE INDEX "workflow_steps_workflowInstanceId_stepIndex_key" ON "workflow_steps"("workflowInstanceId", "stepIndex");
CREATE UNIQUE INDEX "approval_steps_approvalId_stepOrder_key" ON "approval_steps"("approvalId", "stepOrder");
CREATE UNIQUE INDEX "kpi_definitions_slug_key" ON "kpi_definitions"("slug");
CREATE UNIQUE INDEX "documents_slug_version_key" ON "documents"("slug", "version");
CREATE UNIQUE INDEX "integrations_slug_key" ON "integrations"("slug");

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "roles" ADD CONSTRAINT "roles_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "teams" ADD CONSTRAINT "teams_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "teams" ADD CONSTRAINT "teams_leadUserId_fkey" FOREIGN KEY ("leadUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "user_departments" ADD CONSTRAINT "user_departments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_departments" ADD CONSTRAINT "user_departments_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_departments" ADD CONSTRAINT "user_departments_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_parentTaskId_fkey" FOREIGN KEY ("parentTaskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_workflowInstanceId_fkey" FOREIGN KEY ("workflowInstanceId") REFERENCES "workflow_instances"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "workflows" ADD CONSTRAINT "workflows_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "workflow_instances" ADD CONSTRAINT "workflow_instances_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflows"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "workflow_instances" ADD CONSTRAINT "workflow_instances_triggeredById_fkey" FOREIGN KEY ("triggeredById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "workflow_steps" ADD CONSTRAINT "workflow_steps_workflowInstanceId_fkey" FOREIGN KEY ("workflowInstanceId") REFERENCES "workflow_instances"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "automation_rules" ADD CONSTRAINT "automation_rules_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "automation_rules" ADD CONSTRAINT "automation_rules_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "automation_executions" ADD CONSTRAINT "automation_executions_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "automation_rules"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "approvals" ADD CONSTRAINT "approvals_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "approvals" ADD CONSTRAINT "approvals_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "approvals" ADD CONSTRAINT "approvals_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "approval_steps" ADD CONSTRAINT "approval_steps_approvalId_fkey" FOREIGN KEY ("approvalId") REFERENCES "approvals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "approval_steps" ADD CONSTRAINT "approval_steps_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "kpi_definitions" ADD CONSTRAINT "kpi_definitions_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "kpi_definitions" ADD CONSTRAINT "kpi_definitions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "kpi_snapshots" ADD CONSTRAINT "kpi_snapshots_kpiId_fkey" FOREIGN KEY ("kpiId") REFERENCES "kpi_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "documents" ADD CONSTRAINT "documents_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "documents" ADD CONSTRAINT "documents_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "documents" ADD CONSTRAINT "documents_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "integrations" ADD CONSTRAINT "integrations_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "webhooks" ADD CONSTRAINT "webhooks_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "integrations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "webhook_logs" ADD CONSTRAINT "webhook_logs_webhookId_fkey" FOREIGN KEY ("webhookId") REFERENCES "webhooks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "comments" ADD CONSTRAINT "comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "comments" ADD CONSTRAINT "comments_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "recurring_schedules" ADD CONSTRAINT "recurring_schedules_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "recurring_schedules" ADD CONSTRAINT "recurring_schedules_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "crm_contacts" ADD CONSTRAINT "crm_contacts_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "crm_contacts" ADD CONSTRAINT "crm_contacts_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "crm_deals" ADD CONSTRAINT "crm_deals_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "crm_contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "crm_deals" ADD CONSTRAINT "crm_deals_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "crm_deals" ADD CONSTRAINT "crm_deals_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex (non-unique)
CREATE INDEX "users_email_idx" ON "users"("email");
CREATE INDEX "users_role_idx" ON "users"("role");
CREATE INDEX "users_isActive_idx" ON "users"("isActive");
CREATE INDEX "departments_slug_idx" ON "departments"("slug");
CREATE INDEX "departments_parentId_idx" ON "departments"("parentId");
CREATE INDEX "departments_isActive_idx" ON "departments"("isActive");
CREATE INDEX "roles_departmentId_idx" ON "roles"("departmentId");
CREATE INDEX "roles_slug_idx" ON "roles"("slug");
CREATE INDEX "roles_isActive_idx" ON "roles"("isActive");
CREATE INDEX "teams_departmentId_idx" ON "teams"("departmentId");
CREATE INDEX "teams_leadUserId_idx" ON "teams"("leadUserId");
CREATE INDEX "user_departments_userId_idx" ON "user_departments"("userId");
CREATE INDEX "user_departments_departmentId_idx" ON "user_departments"("departmentId");
CREATE INDEX "user_departments_roleId_idx" ON "user_departments"("roleId");
CREATE INDEX "permissions_slug_idx" ON "permissions"("slug");
CREATE INDEX "permissions_module_idx" ON "permissions"("module");
CREATE INDEX "role_permissions_roleId_idx" ON "role_permissions"("roleId");
CREATE INDEX "role_permissions_permissionId_idx" ON "role_permissions"("permissionId");
CREATE INDEX "tasks_status_idx" ON "tasks"("status");
CREATE INDEX "tasks_priority_idx" ON "tasks"("priority");
CREATE INDEX "tasks_assigneeId_idx" ON "tasks"("assigneeId");
CREATE INDEX "tasks_creatorId_idx" ON "tasks"("creatorId");
CREATE INDEX "tasks_departmentId_idx" ON "tasks"("departmentId");
CREATE INDEX "tasks_roleId_idx" ON "tasks"("roleId");
CREATE INDEX "tasks_parentTaskId_idx" ON "tasks"("parentTaskId");
CREATE INDEX "tasks_workflowInstanceId_idx" ON "tasks"("workflowInstanceId");
CREATE INDEX "tasks_dueDate_idx" ON "tasks"("dueDate");
CREATE INDEX "workflows_slug_idx" ON "workflows"("slug");
CREATE INDEX "workflows_departmentId_idx" ON "workflows"("departmentId");
CREATE INDEX "workflows_isActive_idx" ON "workflows"("isActive");
CREATE INDEX "workflows_isTemplate_idx" ON "workflows"("isTemplate");
CREATE INDEX "workflow_instances_workflowId_idx" ON "workflow_instances"("workflowId");
CREATE INDEX "workflow_instances_status_idx" ON "workflow_instances"("status");
CREATE INDEX "workflow_instances_triggeredById_idx" ON "workflow_instances"("triggeredById");
CREATE INDEX "workflow_instances_startedAt_idx" ON "workflow_instances"("startedAt");
CREATE INDEX "workflow_steps_workflowInstanceId_idx" ON "workflow_steps"("workflowInstanceId");
CREATE INDEX "workflow_steps_status_idx" ON "workflow_steps"("status");
CREATE INDEX "automation_rules_departmentId_idx" ON "automation_rules"("departmentId");
CREATE INDEX "automation_rules_isActive_idx" ON "automation_rules"("isActive");
CREATE INDEX "automation_rules_triggerType_idx" ON "automation_rules"("triggerType");
CREATE INDEX "automation_rules_createdById_idx" ON "automation_rules"("createdById");
CREATE INDEX "automation_executions_ruleId_idx" ON "automation_executions"("ruleId");
CREATE INDEX "automation_executions_status_idx" ON "automation_executions"("status");
CREATE INDEX "automation_executions_startedAt_idx" ON "automation_executions"("startedAt");
CREATE INDEX "approvals_status_idx" ON "approvals"("status");
CREATE INDEX "approvals_requesterId_idx" ON "approvals"("requesterId");
CREATE INDEX "approvals_approverId_idx" ON "approvals"("approverId");
CREATE INDEX "approvals_departmentId_idx" ON "approvals"("departmentId");
CREATE INDEX "approvals_type_idx" ON "approvals"("type");
CREATE INDEX "approvals_dueDate_idx" ON "approvals"("dueDate");
CREATE INDEX "approval_steps_approvalId_idx" ON "approval_steps"("approvalId");
CREATE INDEX "approval_steps_approverId_idx" ON "approval_steps"("approverId");
CREATE INDEX "approval_steps_status_idx" ON "approval_steps"("status");
CREATE INDEX "kpi_definitions_slug_idx" ON "kpi_definitions"("slug");
CREATE INDEX "kpi_definitions_departmentId_idx" ON "kpi_definitions"("departmentId");
CREATE INDEX "kpi_definitions_roleId_idx" ON "kpi_definitions"("roleId");
CREATE INDEX "kpi_definitions_isActive_idx" ON "kpi_definitions"("isActive");
CREATE INDEX "kpi_snapshots_kpiId_idx" ON "kpi_snapshots"("kpiId");
CREATE INDEX "kpi_snapshots_period_idx" ON "kpi_snapshots"("period");
CREATE INDEX "kpi_snapshots_recordedAt_idx" ON "kpi_snapshots"("recordedAt");
CREATE INDEX "documents_slug_idx" ON "documents"("slug");
CREATE INDEX "documents_type_idx" ON "documents"("type");
CREATE INDEX "documents_status_idx" ON "documents"("status");
CREATE INDEX "documents_departmentId_idx" ON "documents"("departmentId");
CREATE INDEX "documents_authorId_idx" ON "documents"("authorId");
CREATE INDEX "notifications_userId_idx" ON "notifications"("userId");
CREATE INDEX "notifications_isRead_idx" ON "notifications"("isRead");
CREATE INDEX "notifications_type_idx" ON "notifications"("type");
CREATE INDEX "notifications_createdAt_idx" ON "notifications"("createdAt");
CREATE INDEX "alerts_severity_idx" ON "alerts"("severity");
CREATE INDEX "alerts_type_idx" ON "alerts"("type");
CREATE INDEX "alerts_isResolved_idx" ON "alerts"("isResolved");
CREATE INDEX "alerts_departmentId_idx" ON "alerts"("departmentId");
CREATE INDEX "alerts_createdAt_idx" ON "alerts"("createdAt");
CREATE INDEX "integrations_slug_idx" ON "integrations"("slug");
CREATE INDEX "integrations_type_idx" ON "integrations"("type");
CREATE INDEX "integrations_isActive_idx" ON "integrations"("isActive");
CREATE INDEX "webhooks_integrationId_idx" ON "webhooks"("integrationId");
CREATE INDEX "webhooks_isActive_idx" ON "webhooks"("isActive");
CREATE INDEX "webhook_logs_webhookId_idx" ON "webhook_logs"("webhookId");
CREATE INDEX "webhook_logs_event_idx" ON "webhook_logs"("event");
CREATE INDEX "webhook_logs_success_idx" ON "webhook_logs"("success");
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");
CREATE INDEX "audit_logs_entity_idx" ON "audit_logs"("entity");
CREATE INDEX "audit_logs_entityId_idx" ON "audit_logs"("entityId");
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");
CREATE INDEX "activity_logs_userId_idx" ON "activity_logs"("userId");
CREATE INDEX "activity_logs_type_idx" ON "activity_logs"("type");
CREATE INDEX "activity_logs_entityType_idx" ON "activity_logs"("entityType");
CREATE INDEX "activity_logs_departmentId_idx" ON "activity_logs"("departmentId");
CREATE INDEX "activity_logs_createdAt_idx" ON "activity_logs"("createdAt");
CREATE INDEX "job_queue_status_idx" ON "job_queue"("status");
CREATE INDEX "job_queue_type_idx" ON "job_queue"("type");
CREATE INDEX "job_queue_priority_idx" ON "job_queue"("priority");
CREATE INDEX "job_queue_scheduledFor_idx" ON "job_queue"("scheduledFor");
CREATE INDEX "job_queue_createdAt_idx" ON "job_queue"("createdAt");
CREATE INDEX "comments_authorId_idx" ON "comments"("authorId");
CREATE INDEX "comments_entityType_idx" ON "comments"("entityType");
CREATE INDEX "comments_entityId_idx" ON "comments"("entityId");
CREATE INDEX "comments_parentId_idx" ON "comments"("parentId");
CREATE INDEX "comments_createdAt_idx" ON "comments"("createdAt");
CREATE INDEX "recurring_schedules_type_idx" ON "recurring_schedules"("type");
CREATE INDEX "recurring_schedules_departmentId_idx" ON "recurring_schedules"("departmentId");
CREATE INDEX "recurring_schedules_isActive_idx" ON "recurring_schedules"("isActive");
CREATE INDEX "recurring_schedules_nextRunAt_idx" ON "recurring_schedules"("nextRunAt");
CREATE INDEX "crm_contacts_createdById_idx" ON "crm_contacts"("createdById");
CREATE INDEX "crm_contacts_departmentId_idx" ON "crm_contacts"("departmentId");
CREATE INDEX "crm_deals_stage_idx" ON "crm_deals"("stage");
CREATE INDEX "crm_deals_contactId_idx" ON "crm_deals"("contactId");
CREATE INDEX "crm_deals_assigneeId_idx" ON "crm_deals"("assigneeId");
CREATE INDEX "crm_deals_departmentId_idx" ON "crm_deals"("departmentId");
