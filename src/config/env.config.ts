import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Load .env as the base
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Override with environment-specific file if NODE_ENV is set
if (process.env.NODE_ENV) {
  dotenv.config({
    path: path.resolve(process.cwd(), `.env.${process.env.NODE_ENV}`),
    override: true,
  });
}

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000'),
  MONGO_URI: z.string().min(1, 'MONGO_URI is strictly required.'),
  CORS_ORIGIN: z.string().default('*'),

  // Auth Secrets
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET is required'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET is required'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  COOKIE_SECRET: z.string().min(16, 'COOKIE_SECRET is required'),
});

type EnvConfig = z.infer<typeof envSchema>;

let envConfig: EnvConfig;

try {
  envConfig = envSchema.parse(process.env);
} catch (error: any) {
  if (error instanceof z.ZodError) {
    console.error('❌ Invalid Environment Variables:');
    error.issues.forEach((e: any) => {
      console.error(`- ${e.path.join('.')}: ${e.message}`);
    });
  } else {
    console.error('❌ Error loading environment variables:', error);
  }
  process.exit(1);
}

export const env = envConfig;
