"use client";

// src/components/budget/budget-summary-card.tsx
// Displays the total remaining budget, spent/budgeted, and a progress bar.
import { formatCurrency } from "@/lib/formatters";
import { BUDGET_STRINGS as t } from "@/locale/budget";

interface BudgetSummaryCardProps {
  totalBudgeted: number;
  totalSpent: number;
}

export function BudgetSummaryCard({ totalBudgeted, totalSpent }: BudgetSummaryCardProps) {
  const remaining = totalBudgeted - totalSpent;
  const usedPercent = totalBudgeted > 0
    ? Math.min(Math.round((totalSpent / totalBudgeted) * 1000) / 10, 100)
    : 0;
  const leftPercent = Math.max(0, Math.round((100 - usedPercent) * 10) / 10);

  return (
    <div className="summary-card-main">
      {/* Decorative blur */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
      <div className="z-10 flex justify-between items-start mb-4">
        <div>
          <h3 className="font-h3 text-h3 text-on-surface">{t.SUMMARY_TITLE}</h3>
          <div className="font-display text-display text-primary mt-1">
            {formatCurrency(remaining, { showDecimals: true })}
          </div>
        </div>
        <div className="text-right">
          <p className="font-label-xs text-label-xs text-on-surface-variant uppercase tracking-wider mb-1">
            {t.SUMMARY_SPENT_LABEL}
          </p>
          <p className="font-currency text-currency text-on-surface">
            {formatCurrency(totalSpent)}{" "}
            <span className="text-on-surface-variant text-sm font-normal">
              / {formatCurrency(totalBudgeted)}
            </span>
          </p>
        </div>
      </div>
      <div className="z-10 mt-auto">
        <div className="flex justify-between font-label-xs text-label-xs text-on-surface-variant mb-2">
          <span>{usedPercent}% {t.SUMMARY_USED}</span>
          <span>{leftPercent}% {t.SUMMARY_LEFT}</span>
        </div>
        <div className="h-3 w-full bg-primary/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${usedPercent}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
