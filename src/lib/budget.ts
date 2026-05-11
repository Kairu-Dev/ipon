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
