import { z } from 'zod';

/**
 * zod schemas for every mutating endpoint (assessment R6/TD4).
 * All schemas use .strict() so unexpected fields are rejected
 * (prevents mass-assignment).
 */

// ---------- shared ----------
export const uuid = z.string().uuid();
const trimmed = (max: number) => z.string().trim().min(1).max(max);
const optionalText = (max: number) => z.string().trim().max(max).optional().nullable();
export const isoDate = z
  .string()
  .refine((v) => !Number.isNaN(Date.parse(v)), 'Invalid date')
  .transform((v) => new Date(v));

// ---------- tasks ----------
export const TaskStatusEnum = z.enum(['PENDING', 'IN_PROGRESS', 'REVIEW', 'COMPLETED', 'CANCELLED']);
export const TaskPriorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT', 'CRITICAL']);

export const createTaskSchema = z
  .object({
    title: trimmed(300),
    description: optionalText(5000),
    status: TaskStatusEnum.optional(),
    priority: TaskPriorityEnum.optional(),
    dueDate: isoDate.optional().nullable(),
    assigneeId: uuid.optional().nullable(),
    departmentId: uuid.optional().nullable(),
    roleId: uuid.optional().nullable(),
    parentTaskId: uuid.optional().nullable(),
    tags: z.array(z.string().trim().min(1).max(50)).max(20).optional(),
  })
  .strict();

export const updateTaskSchema = createTaskSchema.partial().strict();

// ---------- approvals ----------
export const ApprovalTypeEnum = z.enum([
  'GENERAL',
  'PURCHASE',
  'EXPENSE',
  'LEAVE',
  'WORKFLOW',
  'DOCUMENT',
  'ACCESS',
]);

export const createApprovalSchema = z
  .object({
    title: trimmed(300),
    description: optionalText(5000),
    type: ApprovalTypeEnum,
    approverId: uuid.optional().nullable(),
    departmentId: uuid.optional().nullable(),
    priority: TaskPriorityEnum.optional(),
    dueDate: isoDate.optional().nullable(),
    data: z.record(z.unknown()).optional(),
  })
  .strict();

export const decideApprovalSchema = z
  .object({
    decision: z.enum(['APPROVED', 'REJECTED']),
    comments: optionalText(2000),
  })
  .strict();

export const updateApprovalSchema = z
  .object({
    title: trimmed(300).optional(),
    description: optionalText(5000),
    priority: TaskPriorityEnum.optional(),
    dueDate: isoDate.optional().nullable(),
    approverId: uuid.optional().nullable(),
    status: z.enum(['CANCELLED']).optional(), // requester may cancel
  })
  .strict();

// ---------- users ----------
export const UserRoleEnum = z.enum(['ADMIN', 'EXECUTIVE', 'MANAGER', 'MEMBER', 'VIEWER']);

export const departmentAssignment = z
  .object({
    departmentId: uuid,
    roleId: uuid,
    isPrimary: z.boolean().optional(),
  })
  .strict();

export const createUserSchema = z
  .object({
    name: trimmed(120),
    email: z.string().trim().toLowerCase().email().max(254),
    password: z.string().min(1).max(200),
    role: UserRoleEnum.optional(),
    isActive: z.boolean().optional(),
    avatar: z.string().trim().url().max(500).optional().nullable(),
    departments: z.array(departmentAssignment).max(20).optional(),
  })
  .strict();

export const adminUpdateUserSchema = z
  .object({
    name: trimmed(120).optional(),
    email: z.string().trim().toLowerCase().email().max(254).optional(),
    password: z.string().min(1).max(200).optional(),
    role: UserRoleEnum.optional(),
    isActive: z.boolean().optional(),
    avatar: z.string().trim().url().max(500).optional().nullable(),
    departments: z.array(departmentAssignment).max(20).optional(),
  })
  .strict();

export const selfUpdateUserSchema = z
  .object({
    name: trimmed(120).optional(),
    avatar: z.string().trim().url().max(500).optional().nullable(),
    currentPassword: z.string().min(1).max(200).optional(),
    newPassword: z.string().min(1).max(200).optional(),
  })
  .strict();

// ---------- CRM ----------
export const CrmStageEnum = z.enum(['LEAD', 'OPPORTUNITY', 'SALE']);
/** UI historically sends lowercase stages; accept both, normalise to enum. */
export const crmStageInput = z
  .string()
  .transform((v) => v.toUpperCase())
  .pipe(CrmStageEnum);

export const createContactSchema = z
  .object({
    name: trimmed(200),
    email: z.string().trim().toLowerCase().email().max(254).optional().nullable().or(z.literal('').transform(() => null)),
    phone: optionalText(50),
    company: optionalText(200),
    notes: optionalText(5000),
    departmentId: uuid.optional().nullable(),
  })
  .strict();

export const updateContactSchema = createContactSchema.partial().strict();

export const createDealSchema = z
  .object({
    title: trimmed(300),
    value: z.coerce.number().min(0).max(100_000_000).optional(),
    stage: crmStageInput.optional(),
    contactId: uuid.optional(),
    /** Convenience: create the contact inline when no contactId is provided. */
    contactName: trimmed(200).optional(),
    assigneeId: uuid.optional().nullable(),
    departmentId: uuid.optional().nullable(),
    notes: optionalText(5000),
    expectedCloseDate: isoDate.optional().nullable(),
  })
  .strict()
  .refine((v) => v.contactId || v.contactName, {
    message: 'Provide contactId or contactName',
    path: ['contactId'],
  });

export const updateDealSchema = z
  .object({
    title: trimmed(300).optional(),
    value: z.coerce.number().min(0).max(100_000_000).optional(),
    stage: crmStageInput.optional(),
    contactId: uuid.optional(),
    assigneeId: uuid.optional().nullable(),
    departmentId: uuid.optional().nullable(),
    notes: optionalText(5000),
    expectedCloseDate: isoDate.optional().nullable(),
  })
  .strict();

// ---------- departments & roles ----------
export const createDepartmentSchema = z
  .object({
    name: trimmed(150),
    slug: z
      .string()
      .trim()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase letters, numbers and hyphens')
      .max(100)
      .optional(),
    description: optionalText(2000),
    icon: optionalText(50),
    color: z
      .string()
      .regex(/^#[0-9a-fA-F]{6}$/, 'Color must be a hex value like #09203F')
      .optional()
      .nullable(),
    sortOrder: z.number().int().min(0).max(10000).optional(),
    isActive: z.boolean().optional(),
    parentId: uuid.optional().nullable(),
  })
  .strict();

export const updateDepartmentSchema = createDepartmentSchema.partial().strict();

export const createRoleSchema = z
  .object({
    title: trimmed(150),
    slug: z
      .string()
      .trim()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .max(100)
      .optional(),
    description: optionalText(2000),
    departmentId: uuid,
    sortOrder: z.number().int().min(0).max(10000).optional(),
    isActive: z.boolean().optional(),
  })
  .strict();

export const updateRoleSchema = createRoleSchema.partial().strict();

// ---------- notifications ----------
export const NotificationTypeEnum = z.enum([
  'INFO',
  'WARNING',
  'ALERT',
  'TASK',
  'APPROVAL',
  'WORKFLOW',
  'SYSTEM',
  'ESCALATION',
]);

export const createNotificationSchema = z
  .object({
    userId: uuid,
    type: NotificationTypeEnum.optional(),
    title: trimmed(200),
    message: trimmed(2000),
    link: optionalText(500),
    metadata: z.record(z.unknown()).optional(),
  })
  .strict();

export const markReadSchema = z
  .object({
    notificationIds: z.array(uuid).max(200).optional(),
    markAllAsRead: z.boolean().optional(),
  })
  .strict()
  .refine((v) => v.markAllAsRead || (v.notificationIds && v.notificationIds.length > 0), {
    message: 'Provide notificationIds or markAllAsRead',
    path: ['notificationIds'],
  });

// ---------- KPIs ----------
export const KpiDirectionEnum = z.enum(['HIGHER_IS_BETTER', 'LOWER_IS_BETTER']);

/** Built-in, code-evaluated data sources (no arbitrary SQL execution). */
export const KPI_DATA_SOURCES = [
  'manual',
  'tasks.open_count',
  'tasks.overdue_count',
  'tasks.completed_30d',
  'approvals.pending_count',
  'crm.pipeline_value',
  'crm.sales_value_30d',
  'crm.deals_open_count',
  'users.active_count',
] as const;

export const createKpiSchema = z
  .object({
    name: trimmed(200),
    slug: z
      .string()
      .trim()
      .regex(/^[a-z0-9]+(?:[-.][a-z0-9]+)*$/)
      .max(100)
      .optional(),
    description: optionalText(2000),
    departmentId: uuid.optional().nullable(),
    roleId: uuid.optional().nullable(),
    unit: z.string().trim().max(30),
    targetValue: z.coerce.number(),
    warningThreshold: z.coerce.number(),
    criticalThreshold: z.coerce.number(),
    direction: KpiDirectionEnum,
    dataSource: z.enum(KPI_DATA_SOURCES),
    isActive: z.boolean().optional(),
  })
  .strict();

export const updateKpiSchema = createKpiSchema.partial().strict();

export const createSnapshotSchema = z
  .object({
    value: z.coerce.number(),
    period: z.string().trim().max(50).optional(),
    metadata: z.record(z.unknown()).optional(),
  })
  .strict();

// ---------- workflows ----------
export const WorkflowTriggerTypeEnum = z.enum(['MANUAL', 'SCHEDULED', 'EVENT', 'WEBHOOK', 'CONDITION']);
export const WorkflowStepTypeEnum = z.enum([
  'TASK',
  'APPROVAL',
  'NOTIFICATION',
  'WEBHOOK',
  'CONDITION',
  'DELAY',
  'INTEGRATION',
]);

export const workflowStepSchema = z
  .object({
    name: trimmed(200),
    type: WorkflowStepTypeEnum,
    config: z.record(z.unknown()).default({}),
  })
  .strict();

export const createWorkflowSchema = z
  .object({
    name: trimmed(200),
    slug: z
      .string()
      .trim()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .max(100)
      .optional(),
    description: optionalText(2000),
    departmentId: uuid.optional().nullable(),
    triggerType: WorkflowTriggerTypeEnum,
    triggerConfig: z.record(z.unknown()).optional(),
    steps: z.array(workflowStepSchema).min(1).max(30),
    isActive: z.boolean().optional(),
    isTemplate: z.boolean().optional(),
  })
  .strict();

export const updateWorkflowSchema = createWorkflowSchema.partial().strict();

export const executeWorkflowSchema = z
  .object({
    context: z.record(z.unknown()).optional(),
  })
  .strict();

// ---------- automations ----------
export const AutomationTriggerTypeEnum = z.enum(['SCHEDULE', 'EVENT', 'CONDITION', 'WEBHOOK', 'MANUAL']);

export const automationActionSchema = z
  .object({
    type: z.enum(['CREATE_TASK', 'SEND_NOTIFICATION', 'CREATE_APPROVAL']),
    config: z.record(z.unknown()).default({}),
  })
  .strict();

export const createAutomationSchema = z
  .object({
    name: trimmed(200),
    description: optionalText(2000),
    departmentId: uuid.optional().nullable(),
    isActive: z.boolean().optional(),
    triggerType: AutomationTriggerTypeEnum,
    triggerConfig: z.record(z.unknown()).optional(),
    conditions: z.record(z.unknown()).optional().nullable(),
    actions: z.array(automationActionSchema).min(1).max(10),
    cooldownMinutes: z.number().int().min(0).max(10080).optional().nullable(),
  })
  .strict();

export const updateAutomationSchema = createAutomationSchema.partial().strict();

// ---------- integrations ----------
export const IntegrationTypeEnum = z.enum([
  'ERP',
  'POS',
  'ECOMMERCE',
  'EMAIL',
  'SMS',
  'CALENDAR',
  'HR',
  'FINANCE',
  'SHIPPING',
  'ANALYTICS',
  'CUSTOM',
]);

export const createIntegrationSchema = z
  .object({
    name: trimmed(150),
    slug: z
      .string()
      .trim()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .max(100)
      .optional(),
    type: IntegrationTypeEnum,
    provider: trimmed(100),
    config: z.record(z.unknown()).optional(),
    isActive: z.boolean().optional(),
    departmentId: uuid.optional().nullable(),
  })
  .strict();

export const updateIntegrationSchema = createIntegrationSchema.partial().strict();

// ---------- webhooks ----------
export const createWebhookSchema = z
  .object({
    name: trimmed(150),
    url: z.string().trim().url().max(1000),
    events: z.array(z.string().trim().min(1).max(100)).min(1).max(50),
    isActive: z.boolean().optional(),
    integrationId: uuid.optional().nullable(),
  })
  .strict();

export const updateWebhookSchema = createWebhookSchema.partial().strict();

// ---------- jobs ----------
export const createJobSchema = z
  .object({
    type: trimmed(100),
    payload: z.record(z.unknown()).default({}),
    priority: z.number().int().min(0).max(100).optional(),
    scheduledFor: isoDate.optional(),
    maxAttempts: z.number().int().min(1).max(10).optional(),
  })
  .strict();
