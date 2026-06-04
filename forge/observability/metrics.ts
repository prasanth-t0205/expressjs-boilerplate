import { Router, Request, Response } from 'express';
import client from 'prom-client';
import { env } from '@/config/env.config';

const router = Router();

client.collectDefaultMetrics({ prefix: 'forge_' });

/**
 * GET /metrics
 * Exposes Prometheus metrics
 */
router.get('/metrics', async (_req: Request, res: Response) => {
  res.set('Content-Type', client.register.contentType);
  const metrics = await client.register.metrics();
  res.status(200).send(metrics);
});

// Helpers for custom business metrics
export const Counter = client.Counter;
export const Histogram = client.Histogram;
export const Gauge = client.Gauge;
export const Summary = client.Summary;

export const metricsRoutes = router;
