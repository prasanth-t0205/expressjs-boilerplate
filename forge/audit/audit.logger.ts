import { Request } from 'express';
import { eventBus } from '@forge/events';
import { logger } from '@forge/logger';

export interface AuditRecord {
  userId: string | null;
  action: string;
  resource: string;
  resourceId: string | null;
  before: object | null;
  after: object | null;
  changes: string[];
  ipAddress: string;
  userAgent: string;
  requestId: string;
  method: string;
  path: string;
  timestamp: Date;
  success: boolean;
  errorMessage: string | null;
}

export interface AuditOptions {
  enabled: boolean;
  async: boolean;
}

export class AuditLogger {
  private static options: AuditOptions = { enabled: true, async: true };

  /**
   * Configure global audit logging options programmatically
   */
  static configure(opts: Partial<AuditOptions>) {
    this.options = { ...this.options, ...opts };
  }

  /**
   * Log an audit record by emitting a typed event via the eventBus
   */
  static async log(entry: Omit<AuditRecord, 'timestamp'>): Promise<void> {
    if (!this.options.enabled) return;

    const record: AuditRecord = {
      ...entry,
      timestamp: new Date(),
    };

    try {
      if (this.options.async) {
        // Emit the event to the application domain layer to handle database saving
        // This keeps the Forge completely database agnostic!
        eventBus.emit('audit:log', record);
      } else {
        // In synchronous mode (testing/dev)
        logger.info({ audit: record }, 'Audit Log Sync');
        eventBus.emit('audit:log', record);
      }
    } catch (error) {
      logger.error({ err: error, entry: record }, 'Failed to emit audit log event');
    }
  }

  /**
   * Convenience wrapper to build an audit record from an Express Request
   */
  static async logFromRequest(
    req: Request,
    action: string,
    resource: string,
    success: boolean = true,
    resourceId: string | null = null,
    errorMessage: string | null = null,
    before: object | null = null,
    after: object | null = null,
  ): Promise<void> {
    const userId = (req as any).user?.id || null;

    await this.log({
      userId,
      action,
      resource,
      resourceId,
      before,
      after,
      changes: [], // Logic to diff before/after could go here
      ipAddress: req.ip || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
      requestId: (req as any).id || 'unknown',
      method: req.method,
      path: req.originalUrl || req.path,
      success,
      errorMessage,
    });
  }
}
