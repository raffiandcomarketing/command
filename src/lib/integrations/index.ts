import { IntegrationType, IntegrationStatus, Integration } from '@/types';
import { db } from '@/lib/db';

/**
 * Integration adapter interface
 */
export interface IntegrationAdapter {
  /**
   * Connect to the integration
   */
  connect(config: Record<string, any>): Promise<void>;

  /**
   * Disconnect from the integration
   */
  disconnect(): Promise<void>;

  /**
   * Get the current connection status
   */
  getStatus(): Promise<IntegrationStatus>;

  /**
   * Sync data with the integration
   */
  sync(): Promise<{
    success: boolean;
    itemsSynced: number;
    error?: string;
  }>;

  /**
   * Test the connection
   */
  test(): Promise<boolean>;
}

/**
 * Base integration adapter
 */
export abstract class BaseIntegrationAdapter implements IntegrationAdapter {
  protected config: Record<string, any>;
  protected isConnected: boolean = false;
  protected lastSync?: Date;

  constructor(config: Record<string, any> = {}) {
    this.config = config;
  }

  abstract connect(config: Record<string, any>): Promise<void>;
  abstract disconnect(): Promise<void>;
  abstract sync(): Promise<{ success: boolean; itemsSynced: number; error?: string }>;
  abstract test(): Promise<boolean>;

  async getStatus(): Promise<IntegrationStatus> {
    return {
      isConnected: this.isConnected,
      lastSync: this.lastSync,
      syncStatus: 'idle',
    };
  }

  protected setConnected(connected: boolean): void {
    this.isConnected = connected;
  }

  protected setLastSync(): void {
    this.lastSync = new Date();
  }
}

/**
 * ERP Adapter
 */
export class ErpAdapter extends BaseIntegrationAdapter {
  async connect(config: Record<string, any>): Promise<void> {
    // Validate config
    if (!config.apiUrl || !config.apiKey) {
      throw new Error('ERP integration requires apiUrl and apiKey');
    }

    this.config = config;
    this.setConnected(true);
  }

  async disconnect(): Promise<void> {
    this.setConnected(false);
  }

  async sync(): Promise<{ success: boolean; itemsSynced: number; error?: string }> {
    if (!this.isConnected) {
      return { success: false, itemsSynced: 0, error: 'Not connected' };
    }

    try {
      // TODO: Implement ERP sync logic
      console.log('Syncing with ERP:', this.config.apiUrl);

      this.setLastSync();
      return { success: true, itemsSynced: 0 };
    } catch (error) {
      return {
        success: false,
        itemsSynced: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async test(): Promise<boolean> {
    try {
      // TODO: Implement ERP connection test
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * POS Adapter
 */
export class PosAdapter extends BaseIntegrationAdapter {
  async connect(config: Record<string, any>): Promise<void> {
    if (!config.storeId || !config.terminalId) {
      throw new Error('POS integration requires storeId and terminalId');
    }

    this.config = config;
    this.setConnected(true);
  }

  async disconnect(): Promise<void> {
    this.setConnected(false);
  }

  async sync(): Promise<{ success: boolean; itemsSynced: number; error?: string }> {
    if (!this.isConnected) {
      return { success: false, itemsSynced: 0, error: 'Not connected' };
    }

    try {
      // TODO: Implement POS sync logic
      console.log('Syncing with POS:', this.config.storeId);

      this.setLastSync();
      return { success: true, itemsSynced: 0 };
    } catch (error) {
      return {
        success: false,
        itemsSynced: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async test(): Promise<boolean> {
    try {
      // TODO: Implement POS connection test
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Email Adapter
 */
export class EmailAdapter extends BaseIntegrationAdapter {
  async connect(config: Record<string, any>): Promise<void> {
    if (!config.smtpServer || !config.smtpPort || !config.email || !config.password) {
      throw new Error('Email integration requires SMTP configuration');
    }

    this.config = config;
    this.setConnected(true);
  }

  async disconnect(): Promise<void> {
    this.setConnected(false);
  }

  async sync(): Promise<{ success: boolean; itemsSynced: number; error?: string }> {
    if (!this.isConnected) {
      return { success: false, itemsSynced: 0, error: 'Not connected' };
    }

    try {
      // TODO: Implement email sync logic
      console.log('Syncing email with:', this.config.email);

      this.setLastSync();
      return { success: true, itemsSynced: 0 };
    } catch (error) {
      return {
        success: false,
        itemsSynced: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async test(): Promise<boolean> {
    try {
      // TODO: Implement email connection test
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Calendar Adapter
 */
export class CalendarAdapter extends BaseIntegrationAdapter {
  async connect(config: Record<string, any>): Promise<void> {
    if (!config.apiKey || !config.calendarId) {
      throw new Error('Calendar integration requires apiKey and calendarId');
    }

    this.config = config;
    this.setConnected(true);
  }

  async disconnect(): Promise<void> {
    this.setConnected(false);
  }

  async sync(): Promise<{ success: boolean; itemsSynced: number; error?: string }> {
    if (!this.isConnected) {
      return { success: false, itemsSynced: 0, error: 'Not connected' };
    }

    try {
      // TODO: Implement calendar sync logic
      console.log('Syncing calendar:', this.config.calendarId);

      this.setLastSync();
      return { success: true, itemsSynced: 0 };
    } catch (error) {
      return {
        success: false,
        itemsSynced: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async test(): Promise<boolean> {
    try {
      // TODO: Implement calendar connection test
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Integration Registry
 */
export class IntegrationRegistry {
  private adapters: Map<string, IntegrationAdapter> = new Map();

  /**
   * Register an adapter for an integration type
   */
  registerAdapter(type: IntegrationType, adapter: IntegrationAdapter): void {
    this.adapters.set(type, adapter);
  }

  /**
   * Get an adapter for an integration type
   */
  getAdapter(type: IntegrationType): IntegrationAdapter | undefined {
    return this.adapters.get(type);
  }

  /**
   * Create and register default adapters
   */
  registerDefaults(): void {
    this.registerAdapter(IntegrationType.ERP, new ErpAdapter());
    this.registerAdapter(IntegrationType.POS, new PosAdapter());
    this.registerAdapter(IntegrationType.EMAIL, new EmailAdapter());
    this.registerAdapter(IntegrationType.CALENDAR, new CalendarAdapter());
  }

  /**
   * Get or create an adapter instance from database
   */
  async getIntegrationAdapter(integrationId: string): Promise<IntegrationAdapter | null> {
    const integration = await db.integration.findUnique({
      where: { id: integrationId },
    });

    if (!integration) {
      return null;
    }

    const adapter = this.getAdapter(integration.type as IntegrationType);

    if (!adapter) {
      return null;
    }

    // Create new instance with config
    const adapterClass = adapter.constructor as typeof BaseIntegrationAdapter;
    const instance = new adapterClass(integration.config as any);

    // Auto-connect if needed
    if (integration.isActive) {
      try {
        await instance.connect(integration.config as any);
      } catch (error) {
        console.error(`Failed to connect to integration ${integrationId}:`, error);
      }
    }

    return instance;
  }

  /**
   * Sync all active integrations
   */
  async syncAll(): Promise<{
    total: number;
    successful: number;
    failed: number;
  }> {
    const integrations = await db.integration.findMany({
      where: { isActive: true },
    });

    let successful = 0;
    let failed = 0;

    for (const integration of integrations) {
      try {
        const adapter = await this.getIntegrationAdapter(integration.id);

        if (!adapter) {
          failed++;
          continue;
        }

        const result = await adapter.sync();

        if (result.success) {
          successful++;

          // Update last sync time
          await db.integration.update({
            where: { id: integration.id },
            data: { lastSyncAt: new Date() },
          });
        } else {
          failed++;
          console.error(`Failed to sync integration ${integration.id}:`, result.error);
        }
      } catch (error) {
        failed++;
        console.error(`Error syncing integration ${integration.id}:`, error);
      }
    }

    return {
      total: integrations.length,
      successful,
      failed,
    };
  }
}

/**
 * Singleton instance of the integration registry
 */
export const integrationRegistry = new IntegrationRegistry();

// Register default adapters
integrationRegistry.registerDefaults();

export default integrationRegistry;
