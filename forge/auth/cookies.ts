import { Response, Request } from 'express';
import { env } from '@/config/env.config';

export interface CookieOptions {
  cookieName?: string;
  path?: string;
  maxAge?: number;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: boolean | 'lax' | 'strict' | 'none';
}

const defaultOptions: CookieOptions = {
  cookieName: 'refreshToken',
  path: '/api/auth',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict',
};

export const setRefreshCookie = (res: Response, token: string, options?: CookieOptions): void => {
  const opts = { ...defaultOptions, ...options };
  res.cookie(opts.cookieName!, token, {
    httpOnly: opts.httpOnly,
    secure: opts.secure,
    sameSite: opts.sameSite,
    maxAge: opts.maxAge,
    path: opts.path,
  });
};

export const clearRefreshCookie = (res: Response, options?: CookieOptions): void => {
  const opts = { ...defaultOptions, ...options };
  res.clearCookie(opts.cookieName!, {
    httpOnly: opts.httpOnly,
    secure: opts.secure,
    sameSite: opts.sameSite,
    path: opts.path,
  });
};

export const getRefreshCookie = (
  req: Request,
  cookieName: string = 'refreshToken',
): string | undefined => {
  return req.cookies?.[cookieName];
};
