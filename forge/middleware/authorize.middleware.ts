import { Request, Response, NextFunction } from 'express';
import { AppError } from '@forge/errors';

export interface AuthorizeOptions {
  roles?: string[];
  requireAll?: boolean; // If true, must have ALL roles. If false, must have ANY role.
  policy?: (req: Request) => boolean | Promise<boolean>;
}

export const authorize = (
  optionsOrRole: string | string[] | AuthorizeOptions,
  ...extraRoles: string[]
) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('User not authenticated', 401));
    }

    // Support legacy signature: authorize('admin', 'manager')
    let options: AuthorizeOptions = {};
    if (typeof optionsOrRole === 'string') {
      options.roles = [optionsOrRole, ...extraRoles];
    } else if (Array.isArray(optionsOrRole)) {
      options.roles = optionsOrRole;
    } else {
      options = optionsOrRole;
    }

    // 1. Check Roles
    if (options.roles && options.roles.length > 0) {
      const userRoles = Array.isArray(req.user.role) ? req.user.role : [req.user.role];

      const hasAnyRole = options.roles.some((r) => userRoles.includes(r));
      const hasAllRoles = options.roles.every((r) => userRoles.includes(r));

      if (options.requireAll ? !hasAllRoles : !hasAnyRole) {
        return next(new AppError('You do not have permission to perform this action', 403));
      }
    }

    // 2. Complex Business Logic Policy
    if (options.policy) {
      const isAllowed = await options.policy(req);
      if (!isAllowed) {
        return next(new AppError('You do not have permission to perform this action', 403));
      }
    }

    next();
  };
};
