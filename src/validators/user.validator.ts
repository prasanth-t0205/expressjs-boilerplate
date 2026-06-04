import { z } from "zod";

export const createUserSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().min(1, "Email is required").email("Not a valid email"),
  }),
});

export const updateUserSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    email: z.string().email("Not a valid email").optional(),
    isActive: z.boolean().optional(),
  }),
});
