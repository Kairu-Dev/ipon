// src/lib/validation.ts
// Shared Zod validation schemas for auth forms.
// Used by both client-side forms and the Convex backend Password provider.
import { z } from "zod";

/**
 * Password requirement rules — single source of truth for the UI checklist.
 * Each rule has a key, label (shown to the user), and a test function.
 * Mirrors the regex rules in signUpSchema below.
 */
export const PASSWORD_RULES = [
  { key: "length", label: "At least 8 characters", test: (v: string) => v.length >= 8 },
  { key: "uppercase", label: "One uppercase letter", test: (v: string) => /[A-Z]/.test(v) },
  { key: "lowercase", label: "One lowercase letter", test: (v: string) => /[a-z]/.test(v) },
  { key: "number", label: "One number", test: (v: string) => /[0-9]/.test(v) },
  { key: "special", label: "One special character", test: (v: string) => /[^A-Za-z0-9]/.test(v) },
  { key: "notBlank", label: "Cannot be blank", test: (v: string) => v.trim().length > 0 },
] as const;

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
  email: z.string().trim().min(1, "Email is required").email("Invalid email address"),
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
