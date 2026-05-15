"use client";

import Link from "next/link";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { BUDGET_STATUS_STYLES, BUDGET_ELIGIBLE_CATEGORIES } from "@/constants/budget";
import { getBudgetStatus, getBudgetPercentage } from "@/lib/budget";
import { formatCurrency } from "@/lib/formatters";
import { ICON_MAP } from "@/constants/icons";
import { MoreHorizontal } from "lucide-react";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { dashboardLocale } from "@/locale/dashboard";

/** Pad a number to 2 digits — timezone-safe date formatting. */
const pad = (n: number) => String(n).padStart(2, "0");

export function DashboardSpendingBreakdown() {
  const today = new Date();
  const currentMonth = `${today.getFullYear()}-${pad(today.getMonth() + 1)}`;
  
  const budgets = useQuery(api.budgets.getBudgets, { month: currentMonth });
  const spentMap = useQuery(api.budgets.getSpentPerCategory, { month: currentMonth });

  if (budgets === undefined || spentMap === undefined) {
    return <div className="mt-8 bg-surface-container-lowest border border-slate-200 rounded-xl p-[24px] shadow-sm animate-pulse h-64" />;
  }

  // Get all unique categories that either have a budget limit or have spending
  const allCategories = Array.from(
    new Set([
      ...budgets.filter((b) => b.monthlyLimit > 0).map((b) => b.category),
      ...Object.keys(spentMap).filter((cat) => spentMap[cat] > 0),
    ])
  );

  if (allCategories.length === 0) {
    return (
      <div className="mt-8 bg-surface-container-lowest border border-slate-200 rounded-xl p-[24px] shadow-sm">
        <h2 className="font-h3 text-h3 text-on-surface mb-6">Spending Breakdown</h2>
        <div className="flex flex-col items-center justify-center py-6 text-center gap-4">
          <p className="font-body-base text-secondary">No spending or budgets this month.</p>
          <Link
            href="/dashboard/budget"
            className="bg-primary text-on-primary px-6 py-2 rounded-lg font-label-md hover:opacity-90 transition-opacity"
          >
            Create Budget
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 bg-surface-container-lowest border border-slate-200 rounded-xl p-[24px] shadow-sm">
      <h2 className="font-h3 text-h3 text-on-surface mb-6">Spending Breakdown</h2>
      <div className="space-y-6">
        {allCategories.map(category => {
          const budget = budgets.find(b => b.category === category);
          const limit = budget && budget.monthlyLimit > 0 ? budget.monthlyLimit : null;
          const spent = spentMap[category] || 0;
          
          const status = getBudgetStatus(spent, limit);
          const styles = BUDGET_STATUS_STYLES[status];
          const width = getBudgetPercentage(spent, limit);
          
          const catDef = BUDGET_ELIGIBLE_CATEGORIES.find((c) => c.value === category);
          const iconKey = budget?.icon || catDef?.icon || "more-horizontal";
          const Icon = ICON_MAP[iconKey as keyof typeof ICON_MAP] || MoreHorizontal;

          return (
            <div key={category}>
              <div className="flex justify-between items-center font-label-md text-label-md mb-2">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${styles.iconBg}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-on-surface">{category}</span>
                </div>
                <div className="flex items-center gap-2">
                  {styles.showPill && (
                     <span className="bg-error text-on-error px-2 py-0.5 rounded-full font-label-xs text-[10px]">
                       OVER BUDGET
                     </span>
                  )}
                  {(() => {
                    const amountSpan = (
                      <span className={status === "exceeded" ? styles.text : "text-secondary"}>
                        {formatCurrency(spent)}
                        {limit !== null && ` / ${formatCurrency(limit)}`}
                      </span>
                    );

                    return limit !== null ? (
                      <InfoTooltip
                        content={dashboardLocale.tooltips.spendingBar
                          .replace("{percent}", Math.round((spent / limit) * 100).toString())
                          .replace("{category}", category)
                          .replace("{limit}", formatCurrency(limit))}
                        side="left"
                      >
                        {amountSpan}
                      </InfoTooltip>
                    ) : amountSpan;
                  })()}
                </div>
              </div>
              {limit !== null && (
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className={`h-2 rounded-full transition-all duration-300 ${styles.bar}`} style={{ width: `${width}%` }}></div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
