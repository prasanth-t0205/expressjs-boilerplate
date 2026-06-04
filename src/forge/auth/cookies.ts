import { Response, Request } from 'express';
import { env } from '@/config/env.config';

export const setRefreshCookie = (res: Response, token: string): void => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    path: '/api/auth',
  });
};

export const clearRefreshCookie = (res: Response): void => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/api/auth',
  });
};

export const getRefreshCookie = (req: Request): string | undefined => {
  return req.cookies?.refreshToken;
};
