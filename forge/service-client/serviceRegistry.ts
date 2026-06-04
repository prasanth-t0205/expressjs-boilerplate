/**
 * ServiceRegistry maps a conceptual service name to its actual network URL.
 * In a monolith environment, these all point to the same host/port.
 * In a microservices environment, they resolve to cluster DNS (e.g. http://users-service:3000)
 */
export class ServiceRegistry {
  private static registry: Map<string, string> = new Map();

  /**
   * Get the base URL for a given service.
   */
  static getUrl(serviceName: string): string | undefined {
    return this.registry.get(serviceName);
  }

  /**
   * Register or override a service URL at runtime.
   */
  static register(serviceName: string, url: string): void {
    this.registry.set(serviceName, url);
  }
}
