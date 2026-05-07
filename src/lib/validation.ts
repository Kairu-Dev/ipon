// src/lib/validation.ts
// Shared Zod validation schemas for auth forms.
// Used by both client-side forms and the Convex backend Password provider.
import { z } from "zod";

/**
 * Schema for the sign-up form.
 * - name: required, max 50 characters
 * - email: must be a valid email format
 * - password: min 8 characters, cannot be whitespace-only
 */
export const signUpSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(50, "Name must be 50 characters or fewer"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character")
    .refine((val) => val.trim().length > 0, "Password cannot be blank"),
});

/**
 * Schema for the login form.
 * - email: must be a valid email format
 * - password: required (min 1 character to catch empty submissions)
 */
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "This field is required"),
});

/** TypeScript types derived from the schemas for use in form components. */
export type SignUpInput = z.infer<typeof signUpSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
