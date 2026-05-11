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
