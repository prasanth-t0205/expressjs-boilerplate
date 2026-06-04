import express, { Request, Response, Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { errorHandler } from "@/middleware/error.middleware";
import { globalRateLimiter } from "@/middleware/rateLimiter.middleware";
import { env } from "@/config/env.config";

const app: Application = express();

// Trust the first proxy (e.g. Nginx, Render)
app.set("trust proxy", 1);

// Security Headers
app.use(helmet());

// Rate Limiting
app.use("/api", globalRateLimiter);

// Request Logger
if (env.NODE_ENV !== "test") {
  app.use(morgan(env.NODE_ENV === "development" ? "dev" : "combined"));
}

// CORS Configuration
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);

// Payload Size Limitations
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

import userRoutes from "@/routes/user.route";

// Health Check Endpoint
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    status: "healthy",
    timestamp: new Date(),
  });
});

// Mount Routes
app.use("/api/users", userRoutes);

// Wildcard Catch-All 404 Route
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: "Requested endpoint not found.",
  });
});

// Secure Global Error Handler
app.use(errorHandler);

export default app;
