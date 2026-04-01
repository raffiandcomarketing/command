import {
  AutomationRule,
  AutomationActionType,
  AutomationCondition,
  AutomationAction,
  AutomationTriggerType,
} from '@/types';
import { db } from '@/lib/db';

export interface ExecutionContext {
  ruleId: string;
  triggerData: Record<string, any>;
  [key: string]: any;
}

/**
 * Automation Engine for processing automation rules
 */
export class AutomationEngine {
  /**
   * Evaluate a single condition against context
   */
  evaluateCondition(condition: AutomationCondition, context: ExecutionContext): boolean {
    const fieldValue = this.getNestedValue(context, condition.field);
    const conditionValue = condition.value;

    switch (condition.operator) {
      case 'eq':
        return fieldValue === conditionValue;
      case 'neq':
        return fieldValue !== conditionValue;
      case 'gt':
        return fieldValue > conditionValue;
      case 'lt':
        return fieldValue < conditionValue;
      case 'gte':
        return fieldValue >= conditionValue;
      case 'lte':
        return fieldValue <= conditionValue;
      case 'contains':
        return String(fieldValue).includes(String(conditionValue));
      case 'regex':
        try {
          const regex = new RegExp(conditionValue);
          return regex.test(String(fieldValue));
        } catch {
          return false;
        }
      default:
        return false;
    }
  }

  /**
   * Process multiple conditions with AND/OR logic
   */
  processConditions(
    conditions: AutomationCondition[],
    context: ExecutionContext
  ): boolean {
    if (conditions.length === 0) return true;

    let result = this.evaluateCondition(conditions[0], context);

    for (let i = 1; i < conditions.length; i++) {
      const condition = conditions[i];
      const evaluated = this.evaluateCondition(condition, context);

      if (condition.logic === 'or') {
        result = result || evaluated;
      } else {
        // Default to AND
        result = result && evaluated;
      }
    }

    return result;
  }

  /**
   * Execute a set of actions
   */
  async executeActions(
    actions: AutomationAction[],
    context: ExecutionContext
  ): Promise<void> {
    for (const action of actions) {
      try {
        await this.executeAction(action, context);
      } catch (error) {
        console.error(
          `Failed to execute action ${action.type} for rule ${context.ruleId}:`,
          error
        );
        // Continue with next action even if one fails
      }
    }
  }

  /**
   * Execute a single action
   */
  private async executeAction(
    action: AutomationAction,
    context: ExecutionContext
  ): Promise<void> {
    switch (action.type) {
      case AutomationActionType.CREATE_TASK:
        await this.createTask(action.config, context);
        break;

      case AutomationActionType.SEND_NOTIFICATION:
        await this.sendNotification(action.config, context);
        break;

      case AutomationActionType.SEND_EMAIL:
        await this.sendEmail(action.config, context);
        break;

      case AutomationActionType.TRIGGER_WEBHOOK:
        await this.triggerWebhook(action.config, context);
        break;

      case AutomationActionType.UPDATE_RECORD:
        await this.updateRecord(action.config, context);
        break;

      case AutomationActionType.CREATE_APPROVAL:
        await this.createApproval(action.config, context);
        break;

      case AutomationActionType.ESCALATE:
        await this.escalate(action.config, context);
        break;

      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  /**
   * Create a task action
   */
  private async createTask(config: Record<string, any>, context: ExecutionContext): Promise<void> {
    await db.task.create({
      data: {
        title: this.interpolateString(config.title, context),
        description: config.description ? this.interpolateString(config.description, context) : undefined,
        priority: config.priority || 'MEDIUM',
        assigneeId: config.assigneeId,
        departmentId: config.departmentId,
        creatorId: config.creatorId || context.userId,
        dueDate: config.dueDate ? new Date(config.dueDate) : undefined,
        tags: config.tags || [],
      },
    });
  }

  /**
   * Send notification action
   */
  private async sendNotification(
    config: Record<string, any>,
    context: ExecutionContext
  ): Promise<void> {
    const userIds = Array.isArray(config.userIds) ? config.userIds : [config.userIds];

    for (const userId of userIds) {
      await db.notification.create({
        data: {
          userId,
          type: config.type || 'INFO',
          title: this.interpolateString(config.title, context),
          message: this.interpolateString(config.message, context),
          link: config.link,
          metadata: config.metadata,
        },
      });
    }
  }

  /**
   * Send email action
   */
  private async sendEmail(
    config: Record<string, any>,
    context: ExecutionContext
  ): Promise<void> {
    // This would integrate with an email service (SendGrid, etc.)
    // For now, we'll just log it
    console.log('Email action triggered:', {
      to: config.to,
      subject: this.interpolateString(config.subject, context),
      body: this.interpolateString(config.body, context),
    });

    // TODO: Integrate with email service
  }

  /**
   * Trigger webhook action
   */
  private async triggerWebhook(
    config: Record<string, any>,
    context: ExecutionContext
  ): Promise<void> {
    // This would send a webhook request
    // For now, we'll just log it
    console.log('Webhook action triggered:', {
      url: config.url,
      method: config.method || 'POST',
      payload: config.payload,
    });

    // TODO: Implement actual webhook triggering
  }

  /**
   * Update record action
   */
  private async updateRecord(
    config: Record<string, any>,
    context: ExecutionContext
  ): Promise<void> {
    const { entityType, entityId, fields } = config;

    if (entityType === 'task' && entityId) {
      await db.task.update({
        where: { id: entityId },
        data: fields,
      });
    } else if (entityType === 'approval' && entityId) {
      await db.approval.update({
        where: { id: entityId },
        data: fields,
      });
    }
  }

  /**
   * Create approval action
   */
  private async createApproval(
    config: Record<string, any>,
    context: ExecutionContext
  ): Promise<void> {
    await db.approval.create({
      data: {
        title: this.interpolateString(config.title, context),
        description: config.description,
        type: config.type || 'GENERAL',
        requesterId: config.requesterId || context.userId,
        approverId: config.approverId,
        departmentId: config.departmentId,
        priority: config.priority || 'MEDIUM',
        dueDate: config.dueDate ? new Date(config.dueDate) : undefined,
        data: config.data,
      },
    });
  }

  /**
   * Escalate action
   */
  private async escalate(
    config: Record<string, any>,
    context: ExecutionContext
  ): Promise<void> {
    const { entityType, entityId, escalateTo } = config;

    if (entityType === 'approval' && entityId) {
      await db.approval.update({
        where: { id: entityId },
        data: {
          escalatedAt: new Date(),
          escalationLevel: { increment: 1 },
          approverId: escalateTo,
        },
      });

      // Send notification to escalated approver
      await db.notification.create({
        data: {
          userId: escalateTo,
          type: 'ESCALATION',
          title: 'Approval Escalated',
          message: this.interpolateString(config.message || 'An approval has been escalated to you', context),
          link: `/approvals/${entityId}`,
        },
      });
    }
  }

  /**
   * Schedule a CRON job
   */
  scheduleCron(schedule: { expression: string; config: Record<string, any> }): void {
    // This would integrate with a cron scheduler (node-cron, agenda, etc.)
    // For now, we'll just log it
    console.log('Cron scheduled:', {
      expression: schedule.expression,
      config: schedule.config,
    });

    // TODO: Implement actual cron scheduling
  }

  /**
   * Get nested value from object using dot notation (e.g., "user.profile.name")
   */
  private getNestedValue(obj: Record<string, any>, path: string): any {
    const keys = path.split('.');
    let value = obj;

    for (const key of keys) {
      if (value && typeof value === 'object') {
        value = value[key];
      } else {
        return undefined;
      }
    }

    return value;
  }

  /**
   * Interpolate variables in a string (e.g., "Hello {{userName}}")
   */
  private interpolateString(template: string, context: Record<string, any>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return String(context[key] || match);
    });
  }
}

/**
 * Singleton instance of the automation engine
 */
export const automationEngine = new AutomationEngine();

export default automationEngine;
