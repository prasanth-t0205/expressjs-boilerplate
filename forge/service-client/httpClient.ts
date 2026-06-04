import { ServiceRegistry } from './serviceRegistry';
import { CircuitBreaker } from './circuitBreaker';
import { AppError } from '@forge/errors';

export interface HttpClientOptions extends Omit<RequestInit, 'body'> {
  body?: any;
  timeoutMs?: number;
  baseUrl?: string; // Allow passing the URL/port directly at the call site
}

/**
 * A typed HTTP client for internal service-to-service communication.
 * Automatically integrates with the ServiceRegistry and CircuitBreakers.
 */
export class ServiceClient {
  // Maintain a singleton circuit breaker per service
  private static breakers: Map<string, CircuitBreaker> = new Map();

  private static getBreaker(serviceName: string): CircuitBreaker {
    if (!this.breakers.has(serviceName)) {
      this.breakers.set(serviceName, new CircuitBreaker());
    }
    return this.breakers.get(serviceName)!;
  }

  private static async request<T>(
    serviceName: string,
    path: string,
    method: string,
    options: HttpClientOptions = {},
  ): Promise<T> {
    const registeredUrl = ServiceRegistry.getUrl(serviceName);
    const baseUrl = options.baseUrl || registeredUrl;

    if (!baseUrl) {
      throw new AppError(
        `Service '${serviceName}' is not registered and no baseUrl was provided in options.`,
        500,
      );
    }

    const url = `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
    const breaker = this.getBreaker(serviceName);

    return breaker.execute(async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), options.timeoutMs || 10000);

      try {
        const fetchOptions: RequestInit = {
          ...options,
          method,
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            ...(options.headers || {}),
          },
        };

        if (options.body && typeof options.body !== 'string') {
          fetchOptions.body = JSON.stringify(options.body);
        }

        const response = await fetch(url, fetchOptions);

        if (!response.ok) {
          throw new AppError(
            `Service '${serviceName}' returned ${response.status}`,
            response.status,
          );
        }

        // Return empty object for 204 No Content
        if (response.status === 204) {
          return {} as T;
        }

        return (await response.json()) as T;
      } catch (err: any) {
        if (err.name === 'AbortError') {
          throw new AppError(`Request to '${serviceName}' timed out`, 504);
        }
        throw err;
      } finally {
        clearTimeout(timeout);
      }
    });
  }

  /**
   * Execute a GET request to a registered service.
   */
  static get<T>(serviceName: string, path: string, options?: HttpClientOptions): Promise<T> {
    return this.request<T>(serviceName, path, 'GET', options);
  }

  /**
   * Execute a POST request to a registered service.
   */
  static post<T>(
    serviceName: string,
    path: string,
    data?: any,
    options?: HttpClientOptions,
  ): Promise<T> {
    return this.request<T>(serviceName, path, 'POST', { ...options, body: data });
  }

  /**
   * Execute a PUT request to a registered service.
   */
  static put<T>(
    serviceName: string,
    path: string,
    data?: any,
    options?: HttpClientOptions,
  ): Promise<T> {
    return this.request<T>(serviceName, path, 'PUT', { ...options, body: data });
  }

  /**
   * Execute a DELETE request to a registered service.
   */
  static delete<T>(serviceName: string, path: string, options?: HttpClientOptions): Promise<T> {
    return this.request<T>(serviceName, path, 'DELETE', options);
  }
}
