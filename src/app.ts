import express, { Request, Response, Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { errorHandler } from '@forge/errors';
import { setupSwagger } from '@forge/docs';
import { healthRoutes, registerHealthCheck, metricsRoutes } from '@forge/observability';
import mongoose from 'mongoose';
import { AuditLogger, auditMiddleware } from '@forge/audit';
import { env } from '@/config/env.config';

import userRoutes from '@/routes/user.route';

const app: Application = express();

// Trust the first proxy (e.g. Nginx, Render)
app.set('trust proxy', 1);

// Security Headers
app.use(helmet());

// Request Logger
if (env.NODE_ENV !== 'test') {
  app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));
}

// CORS Configuration
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  }),
);

// Payload Size Limitations
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Cookie Parser
app.use(cookieParser(env.COOKIE_SECRET));

// Register Dependencies for Health Checks
registerHealthCheck('database', async () => {
  const state = mongoose.connection.readyState;
  if (state === 1) return { status: 'healthy' };
  if (state === 2) return { status: 'connecting' };
  return { status: 'unhealthy' };
});

// Mount Observability Routes (Health, Ready, Live, Metrics)
app.use('/', healthRoutes);
app.use('/', metricsRoutes);

// Configure Audit Logging programmatically
AuditLogger.configure({
  enabled: env.NODE_ENV !== 'test',
  async: true,
});

// Global Audit Logging
app.use(auditMiddleware);

// Mount Routes
app.use('/api/users', userRoutes);

// Setup Swagger / OpenAPI (Must be mounted before the 404 catch-all, but after all routes are imported)
setupSwagger(app);

// Wildcard Catch-All 404 Route
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Requested endpoint not found.',
  });
});

// Secure Global Error Handler
app.use(errorHandler);

export default app;
