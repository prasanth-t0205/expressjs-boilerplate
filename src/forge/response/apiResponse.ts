import { Response } from 'express';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export class ApiResponse {
  /**
   * Standard success response with data
   */
  static success<T>(res: Response, data: T, message: string = 'Success', statusCode: number = 200) {
    return res.status(statusCode).json({
      success: true,
      statusCode,
      message,
      data,
    });
  }

  /**
   * List responses with pagination meta
   */
  static paginated<T>(
    res: Response,
    data: T[],
    pagination: PaginationMeta,
    message: string = 'Items fetched successfully',
  ) {
    return res.status(200).json({
      success: true,
      statusCode: 200,
      message,
      data,
      pagination,
    });
  }

  /**
   * All error responses
   */
  static error(res: Response, message: string, statusCode: number = 500, errors?: any) {
    const response: any = {
      success: false,
      statusCode,
      message,
    };

    if (errors) {
      response.errors = errors;
    }

    return res.status(statusCode).json(response);
  }

  /**
   * 204 responses (e.g., delete, logout)
   */
  static noContent(res: Response, message?: string) {
    // 204 No Content responses should not have a body.
    // If a message needs to be sent, use a 200 OK response instead.
    return res.status(204).send();
  }
}
