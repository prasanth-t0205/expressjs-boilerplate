import { AsyncLocalStorage } from 'async_hooks';

/**
 * Stores the tenant ID for the current request context.
 */
export class TenantContext {
  private static storage = new AsyncLocalStorage<string>();

  /**
   * Run a function within a specific tenant context
   */
  static run<T>(tenantId: string, callback: () => T): T {
    return this.storage.run(tenantId, callback);
  }

  /**
   * Gets the current tenant ID from the context.
   * Returns undefined if called outside a tenant context.
   */
  static get(): string | undefined {
    return this.storage.getStore();
  }

  /**
   * Gets the current tenant ID and throws if it is missing.
   * Useful for strict tenant operations.
   */
  static getStrict(): string {
    const tenantId = this.storage.getStore();
    if (!tenantId) {
      throw new Error('Tenant context is missing. Ensure tenant middleware is applied.');
    }
    return tenantId;
  }
}
