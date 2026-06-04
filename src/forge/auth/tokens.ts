import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '@/config/env.config';
import { AppError } from '@/forge/errors';

export interface TokenPayload {
  id: string;
  role: string; // Adaptive role so developers can use their own role structures
  email?: string;
  iat?: number;
  exp?: number;
}

export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as SignOptions['expiresIn'],
  });
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as SignOptions['expiresIn'],
  });
};

export const generateTokens = (payload: TokenPayload) => {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  return { accessToken, refreshToken };
};

export const verifyToken = (token: string, secret: string): TokenPayload => {
  try {
    const payload = jwt.verify(token, secret) as TokenPayload;
    return payload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError('Token expired', 401);
    }
    throw new AppError('Invalid token', 401);
  }
};
