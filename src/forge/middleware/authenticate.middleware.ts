import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '@/forge/auth/tokens';
import { env } from '@/config/env.config';
import { AppError } from '@/forge/errors';

export const authenticate = (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('No token provided', 401));
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyToken(token, env.JWT_ACCESS_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    next(error);
  }
};
