import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '@forge/auth/tokens';
import { env } from '@/config/env.config';
import { AppError } from '@forge/errors';

export interface AuthenticateOptions {
  optional?: boolean;
  extractFrom?: ('header' | 'cookie' | 'query')[];
  cookieName?: string;
  queryParam?: string;
  secret?: string;
  verify?: (token: string, req: Request) => any | Promise<any>;
}

export const authenticate = (options: AuthenticateOptions = {}) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const opts = {
      optional: false,
      extractFrom: ['header'] as ('header' | 'cookie' | 'query')[],
      cookieName: 'accessToken',
      queryParam: 'token',
      ...options,
    };

    let token: string | undefined;

    // 1. Try to extract from Header
    if (opts.extractFrom.includes('header')) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    // 2. Try to extract from Cookie
    if (!token && opts.extractFrom.includes('cookie')) {
      token = req.cookies?.[opts.cookieName!];
    }

    // 3. Try to extract from Query Params
    if (!token && opts.extractFrom.includes('query')) {
      token = req.query?.[opts.queryParam!] as string;
    }

    if (!token) {
      if (opts.optional) return next();
      return next(new AppError('No token provided', 401));
    }

    try {
      if (opts.verify) {
        // Allow the developer to run their own logic (e.g. Database lookup, Auth0, Firebase)
        req.user = await opts.verify(token, req);
      } else {
        // Default JWT Verification
        const decoded = verifyToken(token, opts.secret || env.JWT_ACCESS_SECRET);
        req.user = decoded;
      }
      next();
    } catch (error) {
      if (opts.optional) return next();
      next(error);
    }
  };
};
