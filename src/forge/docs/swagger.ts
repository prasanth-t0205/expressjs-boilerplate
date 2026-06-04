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

export const buildSwaggerSpec = () => {
  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: '3.0.3',
    info: {
      title: env.SWAGGER_TITLE,
      version: env.SWAGGER_VERSION,
      description: env.SWAGGER_DESCRIPTION,
    },
    servers: [
      {
        url: '/',
        description: 'Current environment',
      },
    ],
  });
};

export const setupSwagger = (app: Application) => {
  if (env.SWAGGER_ENABLED !== 'true') {
    return;
  }

  const spec = buildSwaggerSpec();

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(spec));

  app.get('/api-docs.json', (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(spec);
  });
};
