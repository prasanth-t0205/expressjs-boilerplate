import pino from 'pino';
import { env } from '@/config/env.config';

/**
 * Enterprise-grade JSON logger.
 * Uses `pino-pretty` for human-readable output in development,
 * and lightning-fast structured JSON in production.
 */
export const logger = pino({
  level: env.NODE_ENV === 'test' ? 'silent' : env.NODE_ENV === 'development' ? 'debug' : 'info',
  transport:
    env.NODE_ENV === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
});
