import { Router, Request, Response } from 'express';
import { env } from '@/config/env.config';

const router = Router();

// Used to calculate uptime
const bootTime = Date.now();

type HealthCheckFn = () => Promise<{
  status: 'healthy' | 'unhealthy' | 'connecting';
  details?: any;
}>;
const healthChecks = new Map<string, HealthCheckFn>();

/**
 * Register a custom health check (e.g. Database, Redis)
 */
export const registerHealthCheck = (name: string, checkFn: HealthCheckFn) => {
  healthChecks.set(name, checkFn);
};

/**
 * GET /live
 * Liveness probe. Used by Kubernetes to check if the process is running.
 * Returns 200 immediately. No dependency checks.
 */
router.get('/live', (_req: Request, res: Response) => {
  res.status(200).send('OK');
});

/**
 * GET /ready
 * Readiness probe. Used by Kubernetes to check if the app is ready to receive traffic.
 * Checks all registered dependencies.
 */
router.get('/ready', async (_req: Request, res: Response) => {
  for (const [name, checkFn] of healthChecks.entries()) {
    try {
      const result = await checkFn();
      if (result.status !== 'healthy') {
        return res.status(503).send(`Service Unavailable - ${name} is ${result.status}`);
      }
    } catch (error) {
      return res.status(503).send(`Service Unavailable - ${name} check failed`);
    }
  }

  res.status(200).send('Ready');
});

/**
 * GET /health
 * Full system health check with dependency details.
 * Used by monitoring dashboards.
 */
router.get('/health', async (_req: Request, res: Response) => {
  let allHealthy = true;
  const checksRecord: Record<string, any> = {};

  for (const [name, checkFn] of healthChecks.entries()) {
    try {
      const result = await checkFn();
      checksRecord[name] = result;
      if (result.status !== 'healthy') {
        allHealthy = false;
      }
    } catch (error: any) {
      checksRecord[name] = { status: 'unhealthy', error: error.message };
      allHealthy = false;
    }
  }

  const memoryUsage = process.memoryUsage();
  checksRecord['memory'] = {
    status: 'healthy',
    usedMB: Math.round(memoryUsage.heapUsed / 1024 / 1024),
    totalMB: Math.round(memoryUsage.heapTotal / 1024 / 1024),
  };

  const healthData = {
    status: allHealthy ? 'healthy' : 'unhealthy',
    uptimeSeconds: Math.floor((Date.now() - bootTime) / 1000),
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    checks: checksRecord,
  };

  const statusCode = healthData.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(healthData);
});

export const healthRoutes = router;
