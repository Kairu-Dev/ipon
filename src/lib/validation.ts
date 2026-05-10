// src/lib/validation.ts
// Shared Zod validation schemas for auth forms.
// Used by both client-side forms and the Convex backend Password provider.
import { z } from "zod";

/**
 * Password requirement rules — single source of truth for the UI checklist.
 * Each rule has a key, label (shown to the user), and a test function.
 * Mirrors the regex rules in signUpSchema below.
 */
const isNonProd = process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_VERCEL_ENV === "preview" || process.env.NEXT_PUBLIC_VERCEL_ENV === "development";
const isBypass = (v: string) => isNonProd && v === "12345678";

export const PASSWORD_RULES = [
  { key: "length", label: "At least 8 characters", test: (v: string) => isBypass(v) || v.length >= 8 },
  { key: "uppercase", label: "One uppercase letter", test: (v: string) => isBypass(v) || /[A-Z]/.test(v) },
  { key: "lowercase", label: "One lowercase letter", test: (v: string) => isBypass(v) || /[a-z]/.test(v) },
  { key: "number", label: "One number", test: (v: string) => isBypass(v) || /[0-9]/.test(v) },
  { key: "special", label: "One special character", test: (v: string) => isBypass(v) || /[^A-Za-z0-9]/.test(v) },
  { key: "notBlank", label: "Cannot be blank", test: (v: string) => isBypass(v) || v.trim().length > 0 },
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
    .superRefine((val, ctx) => {
      if (isBypass(val)) return; // Seeder bypass
      if (val.length < 8) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Password must be at least 8 characters" });
      if (!/[A-Z]/.test(val)) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Password must contain at least one uppercase letter" });
      if (!/[a-z]/.test(val)) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Password must contain at least one lowercase letter" });
      if (!/[0-9]/.test(val)) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Password must contain at least one number" });
      if (!/[^A-Za-z0-9]/.test(val)) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Password must contain at least one special character" });
      if (val.trim().length === 0) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Password cannot be blank" });
    }),
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

/**
 * Schema for transactions (both income and expense).
 */
export const transactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  title: z.string().trim().min(1, "Title is required").max(50, "Title is too long"),
  amount: z.number({ message: "Amount is required" }).positive("Amount must be greater than ₱0").max(999999.99, "Amount cannot exceed ₱999,999.99"),
  category: z.string().min(1, "Please select a category"),
  paymentMethod: z.string().min(1, "Please select a payment method"),
  date: z.iso.date("Invalid date format"),
  note: z.string().max(150, "Note cannot exceed 150 characters").optional(),
});

export type TransactionInput = z.infer<typeof transactionSchema>;

/**
 * Schema for savings goals.
 */
export const createGoalSchema = z.object({
  name: z.string().min(1, "Goal name is required").max(40, "Goal name must be 40 characters or less"),
  icon: z.string().min(1, "Icon is required"),
  targetAmount: z.number().min(1, "Target amount must be greater than ₱0").max(9999999, "Target amount cannot exceed ₱9,999,999"),
  initialDeposit: z.number().min(0, "Initial deposit cannot be negative").optional(),
  deadline: z.string().min(1, "Target deadline is required"),
  date: z.string().min(1, "Date is required"),
}).refine((data) => {
  if (data.initialDeposit && data.initialDeposit > data.targetAmount) {
    return false;
  }
  return true;
}, {
  message: "Initial deposit cannot exceed target amount",
  path: ["initialDeposit"],
});

export type CreateGoalInput = z.infer<typeof createGoalSchema>;

export const contributeGoalSchema = z.object({
  amount: z.number().min(1, "Amount must be at least ₱1"),
  date: z.string().min(1, "Date is required"),
});

export type ContributeGoalInput = z.infer<typeof contributeGoalSchema>;
