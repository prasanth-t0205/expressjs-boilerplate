import { Application, Request, Response } from 'express';
import { OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import swaggerUi from 'swagger-ui-express';
import { registry } from './registry';
import { env } from '@/config/env.config';

// Register the Bearer JWT Security Scheme globally
registry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
});

export interface SwaggerOptions {
  title?: string;
  version?: string;
  description?: string;
}

export const buildSwaggerSpec = (options: SwaggerOptions = {}) => {
  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: '3.0.3',
    info: {
      title: options.title || 'My API',
      version: options.version || '1.0.0',
      description: options.description || 'API documentation',
    },
    servers: [
      {
        url: '/',
        description: 'Current environment',
      },
    ],
  });
};

export const setupSwagger = (app: Application, options: SwaggerOptions = {}) => {
  // Automatically disable Swagger in production unless explicitly wanted
  if (env.NODE_ENV === 'production') {
    return;
  }

  const spec = buildSwaggerSpec(options);

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(spec));

  app.get('/api-docs.json', (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(spec);
  });
};
