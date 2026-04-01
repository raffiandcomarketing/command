/**
 * Event Bus for internal event pub/sub
 */
export class EventBus {
  private handlers: Map<string, Set<EventHandler>> = new Map();

  /**
   * Subscribe to an event
   */
  on<T = any>(event: string, handler: EventHandler<T>): () => void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }

    this.handlers.get(event)!.add(handler as EventHandler);

    // Return unsubscribe function
    return () => {
      this.handlers.get(event)!.delete(handler as EventHandler);
    };
  }

  /**
   * Subscribe to an event once
   */
  once<T = any>(event: string, handler: EventHandler<T>): () => void {
    const wrappedHandler = async (data: T) => {
      await handler(data);
      unsubscribe();
    };

    const unsubscribe = this.on(event, wrappedHandler);
    return unsubscribe;
  }

  /**
   * Emit an event
   */
  async emit<T = any>(event: string, data: T): Promise<void> {
    const handlers = this.handlers.get(event);

    if (handlers) {
      const promises = Array.from(handlers).map((handler) => handler(data));
      await Promise.allSettled(promises);
    }
  }

  /**
   * Remove all handlers for an event
   */
  off(event: string): void {
    this.handlers.delete(event);
  }

  /**
   * Remove all handlers for all events
   */
  offAll(): void {
    this.handlers.clear();
  }

  /**
   * Get the number of handlers for an event
   */
  listenerCount(event: string): number {
    return this.handlers.get(event)?.size || 0;
  }
}

/**
 * Event handler function type
 */
export type EventHandler<T = any> = (data: T) => Promise<void> | void;

/**
 * Standard event types for the automation system
 */
export enum EventType {
  // Task events
  TASK_CREATED = 'task.created',
  TASK_UPDATED = 'task.updated',
  TASK_COMPLETED = 'task.completed',
  TASK_CANCELLED = 'task.cancelled',
  TASK_ASSIGNED = 'task.assigned',

  // Approval events
  APPROVAL_REQUESTED = 'approval.requested',
  APPROVAL_APPROVED = 'approval.approved',
  APPROVAL_REJECTED = 'approval.rejected',
  APPROVAL_ESCALATED = 'approval.escalated',
  APPROVAL_CANCELLED = 'approval.cancelled',

  // Workflow events
  WORKFLOW_STARTED = 'workflow.started',
  WORKFLOW_COMPLETED = 'workflow.completed',
  WORKFLOW_FAILED = 'workflow.failed',
  WORKFLOW_PAUSED = 'workflow.paused',
  WORKFLOW_RESUMED = 'workflow.resumed',

  // Automation events
  AUTOMATION_TRIGGERED = 'automation.triggered',
  AUTOMATION_EXECUTED = 'automation.executed',
  AUTOMATION_FAILED = 'automation.failed',

  // Notification events
  NOTIFICATION_SENT = 'notification.sent',
  NOTIFICATION_READ = 'notification.read',

  // User events
  USER_CREATED = 'user.created',
  USER_UPDATED = 'user.updated',
  USER_DELETED = 'user.deleted',
  USER_LOGGED_IN = 'user.logged_in',
  USER_LOGGED_OUT = 'user.logged_out',

  // System events
  SYSTEM_ERROR = 'system.error',
  SYSTEM_WARNING = 'system.warning',
}

/**
 * Event data types
 */
export interface TaskEventData {
  taskId: string;
  title: string;
  status: string;
  priority: string;
  assigneeId?: string;
  creatorId: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface ApprovalEventData {
  approvalId: string;
  title: string;
  type: string;
  status: string;
  requesterId: string;
  approverId?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface WorkflowEventData {
  workflowId: string;
  workflowInstanceId: string;
  name: string;
  status: string;
  triggeredBy: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface AutomationEventData {
  ruleId: string;
  name: string;
  status: string;
  triggerType: string;
  timestamp: Date;
  triggerData?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface UserEventData {
  userId: string;
  email: string;
  name: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface SystemEventData {
  message: string;
  code?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

/**
 * Global event bus instance
 */
export const eventBus = new EventBus();

/**
 * Register a trigger for an event
 */
export function registerTrigger<T = any>(
  event: string,
  handler: EventHandler<T>
): () => void {
  return eventBus.on(event, handler);
}

/**
 * Fire a trigger event
 */
export async function fireTrigger<T = any>(event: string, data: T): Promise<void> {
  return eventBus.emit(event, data);
}

/**
 * Register multiple triggers at once
 */
export function registerTriggers(
  triggers: Record<string, EventHandler>
): () => void {
  const unsubscribes = Object.entries(triggers).map(([event, handler]) =>
    eventBus.on(event, handler)
  );

  return () => {
    unsubscribes.forEach((unsub) => unsub());
  };
}
