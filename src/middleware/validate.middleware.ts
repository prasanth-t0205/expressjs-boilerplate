import { Request, Response, NextFunction } from 'express';
import { ZodType, ZodError } from 'zod';
import { AppError } from '@forge/errors';

export const validate =
  (schema: ZodType<any, any, any>) => async (req: Request, _res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error: any) {
      if (error instanceof ZodError) {
        const message = (error as any).errors.map((e: any) => e.message).join(', ');
        return next(new AppError(message, 400));
      }
      next(error);
    }
  };
