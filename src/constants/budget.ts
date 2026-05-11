// src/constants/budget.ts
// Budget-specific constants derived from the shared EXPENSE_CATEGORIES.
// "Savings" is excluded — goal contributions are not discretionary spending.
import { EXPENSE_CATEGORIES } from "@/constants/transactions";

/** Categories eligible for budget limits — excludes "Savings" (goal contributions). */
export const BUDGET_ELIGIBLE_CATEGORIES = EXPENSE_CATEGORIES.filter(
  (c) => c.value !== "Savings"
);

/** Descriptive subtitles for standard budget categories. Custom categories show nothing. */
export const CATEGORY_SUBTITLES: Record<string, string> = {
  "Food & Dining": "Groceries, restaurants, snacks",
  "Transportation": "Gas, commute, parking",
  "Load & Bills": "Phone load, electricity, internet",
  "Rent": "Monthly rent and housing costs",
  "Shopping": "Clothes, gadgets, personal items",
  "Others": "Miscellaneous expenses",
};

export const BUDGET_STATUS_STYLES = {
  none: {
    bar:        "",
    text:       "text-on-surface-variant",
    iconBg:     "bg-primary/10 text-primary", // fallback default
    inputBorder:"border-outline-variant",
    showPill:   false,
  },
  normal: {
    bar:        "bg-primary",
    text:       "text-primary",
    iconBg:     "bg-primary-container text-on-primary-container",
    inputBorder:"border-outline-variant",
    showPill:   false,
  },
  warning: {
    bar:        "bg-amber-500",
    text:       "text-amber-600",
    iconBg:     "bg-amber-100 text-amber-700",
    inputBorder:"border-outline-variant",
    showPill:   false,
  },
  exceeded: {
    bar:        "bg-error",
    text:       "text-error",
    iconBg:     "bg-error-container text-on-error-container",
    inputBorder:"border-error",
    showPill:   true,
  },
} as const;
