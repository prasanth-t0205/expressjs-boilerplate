import { Request, Response, NextFunction } from 'express';
import { AuditLogger } from './audit.logger';

/**
 * Global middleware to auto-audit mutating requests (POST, PUT, PATCH, DELETE)
 */
export const auditMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Only audit mutating requests
  if (['GET', 'OPTIONS', 'HEAD'].includes(req.method)) {
    return next();
  }

  // Skip if route explicitly opts out
  if ((req as any).skipAudit) {
    return next();
  }

  const originalSend = res.send;
  let responseBody: any;

  // Intercept the response to determine success and capture body
  res.send = function (body) {
    responseBody = body;
    return originalSend.call(this, body);
  };

  res.on('finish', () => {
    const success = res.statusCode >= 200 && res.statusCode < 400;

    // Automatically infer action/resource from path (naive implementation, can be improved)
    const segments = req.path.split('/').filter(Boolean);
    const resource = segments.length > 1 ? segments[1] : 'unknown'; // e.g. /api/users -> users
    const action = `${resource}.${req.method.toLowerCase()}`;

    let errorMessage = null;
    if (!success) {
      try {
        const parsed = JSON.parse(responseBody);
        errorMessage = parsed.error || parsed.message || 'Unknown error';
      } catch {
        errorMessage = 'Failed request';
      }
    }

    AuditLogger.logFromRequest(
      req,
      action,
      resource,
      success,
      null, // resourceId would need to be extracted from params or body
      errorMessage,
    ).catch((err) => {
      // Intentionally ignore audit failure so it doesn't crash the server
    });
  });

  next();
};

/**
 * Route-level middleware to opt-out of global auditing
 */
export const noAudit = (req: Request, _res: Response, next: NextFunction) => {
  (req as any).skipAudit = true;
  next();
};
