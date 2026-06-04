import { Request, Response, NextFunction } from 'express';
import { AppError } from '@forge/errors';
import { TenantContext } from './tenant.context';

export type TenancyStrategy = 'subdomain' | 'header' | 'jwt';

export interface TenantMiddlewareOptions {
  strategy: TenancyStrategy;
  headerName?: string; // Used if strategy is 'header' (default: 'X-Tenant-ID')
  jwtClaimField?: string; // Used if strategy is 'jwt' (default: 'tenantId' on req.user)
}

/**
 * Express middleware to resolve the tenant from the request and inject it into the AsyncLocalStorage context.
 */
export const resolveTenant = (options: TenantMiddlewareOptions) => {
  return (req: Request, res: Response, next: NextFunction) => {
    let tenantId: string | undefined;

    switch (options.strategy) {
      case 'subdomain': {
        const hostname = req.hostname;
        const parts = hostname.split('.');
        // Assuming format like tenant1.example.com
        if (parts.length >= 3) {
          tenantId = parts[0];
        }
        break;
      }

      case 'header': {
        const headerName = (options.headerName || 'X-Tenant-ID').toLowerCase();
        const headerValue = req.headers[headerName];
        if (typeof headerValue === 'string') {
          tenantId = headerValue;
        }
        break;
      }

      case 'jwt': {
        const claimField = options.jwtClaimField || 'tenantId';
        const user = (req as any).user;
        if (user && user[claimField]) {
          tenantId = user[claimField];
        }
        break;
      }
    }

    if (!tenantId) {
      return next(new AppError('Tenant could not be resolved from the request.', 401));
    }

    // Run the rest of the request within the tenant context
    TenantContext.run(tenantId, () => next());
  };
};
