import rateLimit from "express-rate-limit";
import { Request, Response } from "express";

/**
 * URL-Based Key Generator
 * Instead of limiting the user across the entire application, this generates a unique
 * key combining their IP address AND the specific URL they are hitting.
 * This prevents a user from getting locked out of the whole app just because they 
 * spammed one specific endpoint.
 */
const urlBasedKeyGenerator = (req: Request): string => {
  const ip = req.ip || "unknown";
  return `${ip}-${req.originalUrl}`;
};

/**
 * Global Rate Limiter (URL-Based)
 * Limits each IP to 100 requests per 15 minutes per specific route.
 */
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, 
  keyGenerator: urlBasedKeyGenerator,
  message: {
    success: false,
    message: "Too many requests to this endpoint from your IP. Please try again after 15 minutes.",
  },
  standardHeaders: true, 
  legacyHeaders: false, 
});

/**
 * Strict Auth Rate Limiter
 * Specifically for login/register routes to prevent password guessing.
 * Only counts failed requests, allowing unlimited successful logins.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5, // 5 failed attempts
  skipSuccessfulRequests: true, // Crucial: Only penalize failed login attempts
  message: {
    success: false,
    message: "Too many failed login attempts from this network. Please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
