import { Request, Response, NextFunction } from 'express';
import { AppError } from '@/forge/errors/AppError';
import { ApiResponse } from '@/forge/response/apiResponse';

export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for developers
  if (process.env.NODE_ENV !== 'production') {
    console.error(err);
  }

  if (!(error instanceof AppError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';
    error = new AppError(message, statusCode, false);
  }

  const errors = process.env.NODE_ENV === 'development' ? { stack: err.stack } : undefined;

  return ApiResponse.error(res, error.message, error.statusCode, errors);
};
