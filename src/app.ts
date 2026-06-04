import express, { Request, Response, Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { z } from 'zod';
import { errorHandler } from '@/forge/errors';
import { setupSwagger, registry, successResponse } from '@/forge/docs';
import { ApiResponse } from '@/forge/response';
import { env } from '@/config/env.config';

import userRoutes from '@/routes/user.route';

const app: Application = express();

// Trust the first proxy (e.g. Nginx, Render)
app.set('trust proxy', 1);

// Security Headers
app.use(helmet());

// Rate Limiting (Removed - implement your own via Redis/Valkey if needed)

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

// Health Check Endpoint
const HealthResponseSchema = registry.register(
  'HealthResponse',
  z.object({
    status: z.string(),
    timestamp: z.string(),
  }),
);

registry.registerPath({
  method: 'get',
  path: '/health',
  tags: ['Health'],
  summary: 'Check API health status',
  responses: {
    200: successResponse(HealthResponseSchema, 'API is healthy'),
  },
});

app.get('/health', (_req: Request, res: Response) => {
  return ApiResponse.success(
    res,
    {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    },
    'API is healthy',
  );
});

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
