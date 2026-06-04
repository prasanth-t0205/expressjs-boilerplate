import { z } from "zod";
import dotenv from "dotenv";

// Load environment variables early so Zod can parse them
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.string().default("5000"),
  MONGO_URI: z
    .string()
    .min(1, "MONGO_URI is critically required to connect to the database.")
    .url("MONGO_URI must be a valid URL format."),
  CORS_ORIGIN: z.string().default("*"),
  JWT_SECRET: z.string().optional(),
});

type EnvConfig = z.infer<typeof envSchema>;

let envConfig: EnvConfig;

try {
  envConfig = envSchema.parse(process.env);
} catch (error: any) {
  if (error instanceof z.ZodError) {
    console.error("Invalid Environment Variables:");
    (error as any).errors.forEach((e: any) => {
      console.error(`- ${e.path.join(".")}: ${e.message}`);
    });
    process.exit(1);
  }
  throw error;
}

export const env = envConfig;
