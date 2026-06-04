import { EventEmitter } from 'events';
import { logger } from '@forge/logger';
import type { AuditRecord } from '@forge/audit/audit.logger';
import type { WebhookPayload } from '@forge/webhooks';

/**
 * Type-safe definition of all events in the system.
 */
export interface EventMap {
  'user.registered': { userId: string; email: string; name: string };
  'user.updated': { userId: string; changes: string[] };
  'user.deleted': { userId: string };
  'audit:log': AuditRecord;
  'webhook:dispatch': WebhookPayload;
  // Add other events here as the system grows
}

export type EventName = keyof EventMap;

class TypedEventEmitter extends EventEmitter {
  public emit<K extends EventName>(event: K, payload: EventMap[K]): boolean {
    logger.debug({ event, payload }, 'Event emitted');
    return super.emit(event, payload);
  }

  public on<K extends EventName>(event: K, listener: (payload: EventMap[K]) => void): this {
    return super.on(event, listener);
  }

  public off<K extends EventName>(event: K, listener: (payload: EventMap[K]) => void): this {
    return super.off(event, listener);
  }

  public once<K extends EventName>(event: K, listener: (payload: EventMap[K]) => void): this {
    return super.once(event, listener);
  }
}

export const eventBus = new TypedEventEmitter();

export const EVENTS = {
  USER_REGISTERED: 'user.registered',
  USER_UPDATED: 'user.updated',
  USER_DELETED: 'user.deleted',
} as const;
