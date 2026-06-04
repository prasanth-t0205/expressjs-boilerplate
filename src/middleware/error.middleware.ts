import { Request, Response, NextFunction } from "express";
import { AppError } from "@/utils/error.util";

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for developers
  if (process.env.NODE_ENV !== "production") {
    console.error(err);
  }

  if (!(error instanceof AppError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    error = new AppError(message, statusCode, false);
  }

  res.status(error.statusCode).json({
    success: false,
    error: error.message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
