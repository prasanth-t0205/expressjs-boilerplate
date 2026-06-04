import { z, ZodType } from 'zod';

// Reusable standard fields
const successField = z.boolean();
const statusCodeField = z.number();
const messageField = z.string();

export const successResponse = (schema: ZodType<any>, description = 'Success') => ({
  description,
  content: {
    'application/json': {
      schema: z.object({
        success: successField.default(true),
        statusCode: statusCodeField.default(200),
        message: messageField.default(description),
        data: schema,
      }),
    },
  },
});

export const createdResponse = (schema: ZodType<any>, description = 'Created') => ({
  description,
  content: {
    'application/json': {
      schema: z.object({
        success: successField.default(true),
        statusCode: statusCodeField.default(201),
        message: messageField.default(description),
        data: schema,
      }),
    },
  },
});

const PaginationMetaSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
  hasNextPage: z.boolean(),
  hasPrevPage: z.boolean(),
});

export const paginatedResponse = (schema: ZodType<any>, description = 'Paginated List') => ({
  description,
  content: {
    'application/json': {
      schema: z.object({
        success: successField.default(true),
        statusCode: statusCodeField.default(200),
        message: messageField.default(description),
        data: z.array(schema),
        pagination: PaginationMetaSchema,
      }),
    },
  },
});

export const noContentResponse = (description = 'No Content') => ({
  description,
});

export const unauthorizedResponse = () => ({
  description: 'Unauthorized',
  content: {
    'application/json': {
      schema: z.object({
        success: successField.default(false),
        statusCode: statusCodeField.default(401),
        message: messageField.default('Unauthorized'),
      }),
    },
  },
});

export const forbiddenResponse = () => ({
  description: 'Forbidden',
  content: {
    'application/json': {
      schema: z.object({
        success: successField.default(false),
        statusCode: statusCodeField.default(403),
        message: messageField.default('Forbidden'),
      }),
    },
  },
});

export const notFoundResponse = (resource = 'Resource') => ({
  description: `${resource} not found`,
  content: {
    'application/json': {
      schema: z.object({
        success: successField.default(false),
        statusCode: statusCodeField.default(404),
        message: messageField.default(`${resource} not found`),
      }),
    },
  },
});

export const validationErrorResponse = () => ({
  description: 'Validation Error',
  content: {
    'application/json': {
      schema: z.object({
        success: successField.default(false),
        statusCode: statusCodeField.default(400),
        message: messageField.default('Validation Error'),
        errors: z.array(z.any()).optional(),
      }),
    },
  },
});

export const serverErrorResponse = () => ({
  description: 'Internal Server Error',
  content: {
    'application/json': {
      schema: z.object({
        success: successField.default(false),
        statusCode: statusCodeField.default(500),
        message: messageField.default('Internal Server Error'),
      }),
    },
  },
});
