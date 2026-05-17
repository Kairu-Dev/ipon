// src/lib/budget.ts
// Pure utility functions for budget calculations — no side effects.

/** A single budget row shape used in the UI and passed to the mutation. */
export interface BudgetRow {
  category: string;
  monthlyLimit: number;
}

/**
 * Sums all monthlyLimit values from a list of budget rows.
 * Returns 0 when the list is empty or undefined.
 */
export function calculateTotalBudget(budgets: BudgetRow[] | undefined): number {
  if (!budgets || budgets.length === 0) return 0;
  return budgets.reduce((sum, b) => sum + b.monthlyLimit, 0);
}

export type BudgetStatus = "none" | "normal" | "warning" | "exceeded";

export function getBudgetStatus(spent: number, limit: number | null): BudgetStatus {
  if (limit === null || limit === 0 || isNaN(limit)) return "none";
  const percentage = (spent / limit) * 100;
  if (percentage >= 100) return "exceeded";
  if (percentage >= 80) return "warning";
  return "normal";
}

export function getBudgetPercentage(spent: number, limit: number | null): number {
  if (limit === null || limit === 0 || isNaN(limit)) return 0;
  return Math.min(Math.round((spent / limit) * 100), 100);
}
