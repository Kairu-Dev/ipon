"use client";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { formatCurrency } from "@/lib/formatters";
import Link from "next/link";
import { ICON_MAP } from "@/constants/icons";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/constants/transactions";
import { MoreHorizontal } from "lucide-react";

interface MonthlyChatContextProps {
  currentMonth: string;
}

const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

export function MonthlyChatContext({ currentMonth }: MonthlyChatContextProps) {
  const totals = useQuery(api.transactions.getTotals, { month: currentMonth });
  const spentMap = useQuery(api.budgets.getSpentPerCategory, { month: currentMonth });
  const budgets = useQuery(api.budgets.getBudgets, { month: currentMonth });
  
  const transactionsQuery = useQuery(api.transactions.getTransactions, {
    paginationOpts: { numItems: 4, cursor: null }
  });

  if (totals === undefined || spentMap === undefined || transactionsQuery === undefined || budgets === undefined) {
    return (
      <div className="right-panel">
        <div className="p-6 space-y-8 animate-pulse">
          <div className="h-8 bg-surface-container rounded w-1/2 mb-4"></div>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="summary-card h-20 bg-surface-container-low"></div>
            <div className="summary-card h-20 bg-surface-container-low"></div>
          </div>
        </div>
      </div>
    );
  }

  const topSpending = Object.entries(spentMap)
    .sort(([, a], [, b]) => (b as number) - (a as number));
  const topCategory = topSpending.length > 0 ? topSpending[0] : null;

  let progressPercent = 0;
  if (topCategory) {
    const budget = budgets.find(b => b.category === topCategory[0]);
    if (budget && budget.monthlyLimit > 0) {
      progressPercent = Math.min(Math.round(((topCategory[1] as number) / budget.monthlyLimit) * 100), 100);
    }
  }

  const recentTransactions = transactionsQuery.page.slice(0, 4);

  return (
    <div className="right-panel hidden lg:block">
      <div className="p-6 space-y-8">
        <div>
          <h2 className="font-h3 text-h3 text-on-surface mb-4">Monthly Context</h2>
          {/* Financial Summary Cards */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="summary-card">
              <p className="font-label-xs text-label-xs text-on-surface-variant uppercase mb-1">Income</p>
              <p className="font-currency text-currency text-primary">{formatCurrency(totals.totalIncome)}</p>
            </div>
            <div className="summary-card">
              <p className="font-label-xs text-label-xs text-on-surface-variant uppercase mb-1">Expenses</p>
              <p className="font-currency text-currency text-on-surface">{formatCurrency(totals.totalExpenses)}</p>
            </div>
          </div>

          {/* Top Insight Category */}
          {topCategory && (
            <div className="bg-surface-container-lowest p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-label-md text-label-md text-on-surface">Top Spending</h3>
                <span className="font-label-xs text-label-xs bg-surface-container px-2 py-1 rounded-md text-on-surface-variant">This Month</span>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-body-sm text-body-sm text-on-surface-variant">{topCategory[0]}</span>
                  <span className="font-body-sm text-body-sm font-medium text-on-surface">{formatCurrency(topCategory[1] as number)}</span>
                </div>
                <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden">
                  <div className="bg-tertiary-container h-2 rounded-full" style={{ width: `${progressPercent || 100}%` }}></div>
                </div>
                {progressPercent > 0 && (
                  <p className="font-label-xs text-label-xs text-on-surface-variant mt-2 text-right">
                    {progressPercent}% of {topCategory[0].toLowerCase()} budget
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-h3 text-h3 text-on-surface">Recent</h3>
            <Link href="/dashboard/transactions" className="text-primary font-label-md text-label-md hover:underline">
              View all
            </Link>
          </div>
          <div className="bg-surface-container-lowest rounded-xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
            {recentTransactions.map((tx) => {
              const isIncome = tx.type === "income";
              const categoryMeta = ALL_CATEGORIES.find((c) => c.value === tx.category);
              const Icon = ICON_MAP[categoryMeta?.icon as keyof typeof ICON_MAP] ?? MoreHorizontal;

              return (
                <div key={tx._id} className="transaction-item">
                  <div className="flex items-center gap-3">
                    <div 
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isIncome 
                          ? "bg-primary-fixed text-on-primary-fixed" 
                          : "bg-tertiary-fixed text-on-tertiary-fixed"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-label-md text-label-md text-on-surface">{tx.title || tx.category}</p>
                      <p className="font-label-xs text-label-xs text-on-surface-variant">{tx.date}</p>
                    </div>
                  </div>
                  <p className={`font-body-sm text-body-sm font-medium ${isIncome ? 'text-primary' : 'text-on-surface'}`}>
                    {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                  </p>
                </div>
              );
            })}
            {recentTransactions.length === 0 && (
              <div className="p-4 text-center text-sm text-on-surface-variant">No recent transactions</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
