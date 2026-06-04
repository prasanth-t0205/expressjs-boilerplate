import { AppError } from '@forge/errors';
import { logger } from '@forge/logger';

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerOptions {
  failureThreshold?: number; // Number of failures before opening (default: 5)
  resetTimeoutMs?: number; // How long to stay open before half-open (default: 30000)
}

/**
 * A native, zero-dependency Circuit Breaker.
 * Prevents cascading failures by stopping requests to a known-failing downstream service.
 */
export class CircuitBreaker {
  private state: CircuitState = 'CLOSED';
  private failureCount: number = 0;
  private nextAttemptTime: number = 0;

  private readonly failureThreshold: number;
  private readonly resetTimeoutMs: number;

  constructor(options: CircuitBreakerOptions = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeoutMs = options.resetTimeoutMs || 30000;
  }

  /**
   * Executes a promise-returning function through the circuit breaker.
   */
  async execute<T>(action: () => Promise<T>, fallback?: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() >= this.nextAttemptTime) {
        // Transition to HALF_OPEN to test if the service has recovered
        this.state = 'HALF_OPEN';
        logger.info('Circuit Breaker entering HALF_OPEN state to test recovery.');
      } else {
        if (fallback) return fallback();
        throw new AppError('Service Unavailable (Circuit Breaker OPEN)', 503);
      }
    }

    try {
      const result = await action();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      if (fallback) return fallback();
      throw error;
    }
  }

  private onSuccess(): void {
    if (this.state !== 'CLOSED') {
      logger.info('Circuit Breaker entering CLOSED state (Recovery successful).');
      this.state = 'CLOSED';
    }
    this.failureCount = 0;
  }

  private onFailure(): void {
    if (this.state === 'HALF_OPEN') {
      // It failed while testing, immediately open again
      this.openCircuit();
      return;
    }

    this.failureCount++;
    if (this.failureCount >= this.failureThreshold) {
      this.openCircuit();
    }
  }

  private openCircuit(): void {
    this.state = 'OPEN';
    this.nextAttemptTime = Date.now() + this.resetTimeoutMs;
    logger.error(`Circuit Breaker OPEN. Fast-failing requests for ${this.resetTimeoutMs}ms`);
  }

  getState(): CircuitState {
    return this.state;
  }
}
