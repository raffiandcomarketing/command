// ==================== NAVIGATION TYPES ====================

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  children?: NavItem[];
  badge?: number;
  action?: () => void;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export interface DepartmentNav extends NavItem {
  children: NavItem[];
}

// ==================== DASHBOARD TYPES ====================

export interface DashboardCard {
  id: string;
  title: string;
  type: 'kpi' | 'task' | 'activity' | 'chart' | 'stat';
  config?: Record<string, any>;
  size?: 'sm' | 'md' | 'lg';
  order?: number;
}

export interface KpiCard {
  id: string;
  name: string;
  value: number;
  unit: string;
  target: number;
  trend?: 'up' | 'down' | 'stable';
  trendPercent?: number;
  threshold?: {
    warning: number;
    critical: number;
  };
  status: 'healthy' | 'warning' | 'critical';
}

export interface ActivityItem {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  type: string;
  description: string;
  entityType?: string;
  entityId?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface StatCard {
  id: string;
  label: string;
  value: number;
  format?: 'number' | 'currency' | 'percentage';
  icon?: string;
  color?: string;
  change?: number;
  changeLabel?: string;
}

// ==================== WORKFLOW TYPES ====================

export enum WorkflowStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export enum WorkflowTriggerType {
  MANUAL = 'MANUAL',
  SCHEDULED = 'SCHEDULED',
  EVENT = 'EVENT',
  WEBHOOK = 'WEBHOOK',
  CONDITION = 'CONDITION',
}

export enum WorkflowStepType {
  TASK = 'TASK',
  APPROVAL = 'APPROVAL',
  NOTIFICATION = 'NOTIFICATION',
  WEBHOOK = 'WEBHOOK',
  CONDITION = 'CONDITION',
  DELAY = 'DELAY',
  INTEGRATION = 'INTEGRATION',
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: WorkflowStepType;
  config: Record<string, any>;
  order: number;
  description?: string;
}

export interface WorkflowConfig {
  id: string;
  name: string;
  description?: string;
  triggerType: WorkflowTriggerType;
  triggerConfig: Record<string, any>;
  steps: WorkflowStep[];
  isActive: boolean;
}

// ==================== TASK TYPES ====================

export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  REVIEW = 'REVIEW',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
  CRITICAL = 'CRITICAL',
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId?: string;
  creatorId: string;
  departmentId?: string;
  dueDate?: Date;
  tags: string[];
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskFilters {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  assigneeId?: string;
  departmentId?: string;
  tags?: string[];
  dueDateFrom?: Date;
  dueDateTo?: Date;
  includeCompleted?: boolean;
}

export interface TaskCreateInput {
  title: string;
  description?: string;
  priority?: TaskPriority;
  assigneeId?: string;
  departmentId?: string;
  dueDate?: Date;
  tags?: string[];
}

// ==================== APPROVAL TYPES ====================

export enum ApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  ESCALATED = 'ESCALATED',
  CANCELLED = 'CANCELLED',
}

export enum ApprovalType {
  GENERAL = 'GENERAL',
  PURCHASE = 'PURCHASE',
  EXPENSE = 'EXPENSE',
  LEAVE = 'LEAVE',
  WORKFLOW = 'WORKFLOW',
  DOCUMENT = 'DOCUMENT',
  ACCESS = 'ACCESS',
}

export interface Approval {
  id: string;
  title: string;
  description?: string;
  type: ApprovalType;
  status: ApprovalStatus;
  requesterId: string;
  approverId?: string;
  departmentId?: string;
  priority: TaskPriority;
  dueDate?: Date;
  data?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  decidedAt?: Date;
}

export interface ApprovalStep {
  id: string;
  approvalId: string;
  stepOrder: number;
  approverId: string;
  status: ApprovalStatus;
  decidedAt?: Date;
  comments?: string;
}

// ==================== AUTOMATION TYPES ====================

export enum AutomationTriggerType {
  SCHEDULE = 'SCHEDULE',
  EVENT = 'EVENT',
  CONDITION = 'CONDITION',
  WEBHOOK = 'WEBHOOK',
  MANUAL = 'MANUAL',
}

export enum AutomationActionType {
  CREATE_TASK = 'CREATE_TASK',
  SEND_NOTIFICATION = 'SEND_NOTIFICATION',
  SEND_EMAIL = 'SEND_EMAIL',
  TRIGGER_WEBHOOK = 'TRIGGER_WEBHOOK',
  UPDATE_RECORD = 'UPDATE_RECORD',
  CREATE_APPROVAL = 'CREATE_APPROVAL',
  ESCALATE = 'ESCALATE',
}

export interface AutomationCondition {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains' | 'regex';
  value: any;
  logic?: 'and' | 'or';
}

export interface AutomationAction {
  type: AutomationActionType;
  config: Record<string, any>;
}

export interface AutomationTrigger {
  type: AutomationTriggerType;
  config: Record<string, any>;
}

export interface AutomationRule {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  trigger: AutomationTrigger;
  conditions?: AutomationCondition[];
  actions: AutomationAction[];
  cooldownMinutes?: number;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== USER TYPES ====================

export enum UserRole {
  ADMIN = 'ADMIN',
  EXECUTIVE = 'EXECUTIVE',
  MANAGER = 'MANAGER',
  MEMBER = 'MEMBER',
  VIEWER = 'VIEWER',
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  isActive: boolean;
  departmentSlugs?: string[];
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
}

// ==================== API RESPONSE TYPES ====================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  meta?: {
    timestamp: string;
    version: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    pageCount: number;
  };
}

export interface PaginatedApiResponse<T> extends ApiResponse<PaginatedResponse<T>> {}

export interface ListOptions {
  page?: number;
  pageSize?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

// ==================== NOTIFICATION TYPES ====================

export enum NotificationType {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ALERT = 'ALERT',
  TASK = 'TASK',
  APPROVAL = 'APPROVAL',
  WORKFLOW = 'WORKFLOW',
  SYSTEM = 'SYSTEM',
  ESCALATION = 'ESCALATION',
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  metadata?: Record<string, any>;
  createdAt: Date;
  readAt?: Date;
}

export interface NotificationPreferences {
  userId: string;
  emailNotifications: boolean;
  taskNotifications: boolean;
  approvalNotifications: boolean;
  workflowNotifications: boolean;
  systemNotifications: boolean;
  pushNotifications: boolean;
}

// ==================== INTEGRATION TYPES ====================

export enum IntegrationType {
  ERP = 'ERP',
  POS = 'POS',
  ECOMMERCE = 'ECOMMERCE',
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  CALENDAR = 'CALENDAR',
  HR = 'HR',
  FINANCE = 'FINANCE',
  SHIPPING = 'SHIPPING',
  ANALYTICS = 'ANALYTICS',
  CUSTOM = 'CUSTOM',
}

export interface Integration {
  id: string;
  name: string;
  slug: string;
  type: IntegrationType;
  provider: string;
  config: Record<string, any>;
  isActive: boolean;
  lastSyncAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IntegrationStatus {
  isConnected: boolean;
  lastSync?: Date;
  nextSync?: Date;
  syncStatus?: 'idle' | 'running' | 'error';
  errorMessage?: string;
}

// ==================== ALERT TYPES ====================

export enum AlertSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum AlertType {
  KPI_THRESHOLD = 'KPI_THRESHOLD',
  SYSTEM = 'SYSTEM',
  DEADLINE = 'DEADLINE',
  ESCALATION = 'ESCALATION',
  INTEGRATION = 'INTEGRATION',
}

export interface Alert {
  id: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  type: AlertType;
  departmentId?: string;
  isResolved: boolean;
  metadata?: Record<string, any>;
  createdAt: Date;
  resolvedAt?: Date;
}

// ==================== DOCUMENT TYPES ====================

export enum DocumentType {
  SOP = 'SOP',
  POLICY = 'POLICY',
  GUIDE = 'GUIDE',
  TEMPLATE = 'TEMPLATE',
  CHECKLIST = 'CHECKLIST',
  REPORT = 'REPORT',
}

export enum DocumentStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export interface Document {
  id: string;
  title: string;
  slug: string;
  content: string;
  type: DocumentType;
  status: DocumentStatus;
  version: number;
  departmentId?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

// ==================== WEBHOOK TYPES ====================

export enum WebhookEventType {
  TASK_CREATED = 'task.created',
  TASK_UPDATED = 'task.updated',
  TASK_COMPLETED = 'task.completed',
  APPROVAL_REQUESTED = 'approval.requested',
  APPROVAL_APPROVED = 'approval.approved',
  APPROVAL_REJECTED = 'approval.rejected',
  WORKFLOW_STARTED = 'workflow.started',
  WORKFLOW_COMPLETED = 'workflow.completed',
  AUTOMATION_TRIGGERED = 'automation.triggered',
  NOTIFICATION_SENT = 'notification.sent',
}

export interface WebhookPayload {
  event: WebhookEventType;
  timestamp: string;
  data: Record<string, any>;
}

export interface WebhookSignature {
  signature: string;
  timestamp: string;
}

// ==================== KPI TYPES ====================

export enum KpiDirection {
  HIGHER_IS_BETTER = 'HIGHER_IS_BETTER',
  LOWER_IS_BETTER = 'LOWER_IS_BETTER',
}

export interface KpiDefinition {
  id: string;
  name: string;
  slug: string;
  description?: string;
  unit: string;
  targetValue: number;
  warningThreshold: number;
  criticalThreshold: number;
  direction: KpiDirection;
  dataSource: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface KpiSnapshot {
  id: string;
  kpiId: string;
  value: number;
  period: string;
  recordedAt: Date;
}

// ==================== AUDIT & ACTIVITY TYPES ====================

export interface AuditLog {
  id: string;
  userId?: string;
  action: string;
  entity: string;
  entityId: string;
  changes?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

export interface ActivityLog {
  id: string;
  userId: string;
  type: string;
  description: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

// ==================== JOB QUEUE TYPES ====================

export enum JobStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  RETRY = 'RETRY',
}

export interface Job {
  id: string;
  type: string;
  payload: Record<string, any>;
  status: JobStatus;
  attempts: number;
  maxAttempts: number;
  scheduledFor: Date;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  result?: Record<string, any>;
}

export type JobHandler<T = any> = (payload: T) => Promise<any>;
