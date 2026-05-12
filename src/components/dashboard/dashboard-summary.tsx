"use client";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { dashboardLocale } from "@/locale/dashboard";
import { formatCurrency } from "@/lib/formatters";
import { getMonthOverMonthDates, calculateSafeToSpend } from "@/lib/dashboard";
import { InfoTooltip } from "@/components/ui/info-tooltip";

// Shows a trend indicator comparing current vs previous month.
// Handles three states: positive (green up), negative (red down), flat, and N/A (no data).
function TrendIndicator({ value }: { value: number | null | undefined }) {
  if (value === null || value === undefined) {
    return (
      <InfoTooltip content={dashboardLocale.tooltips.noComparison} side="bottom">
        <span className="font-body-sm text-body-sm text-secondary">{dashboardLocale.summary.noComparison}</span>
      </InfoTooltip>
    );
  }
  if (value > 1) {
    return (
      <InfoTooltip content={dashboardLocale.tooltips.trendUp.replace("{value}", value.toString())} side="bottom">
        <span className="font-body-sm text-body-sm text-primary flex items-center gap-1">
          <span className="material-symbols-outlined text-xs">trending_up</span>
          +{value}% {dashboardLocale.summary.vsLastMonth}
        </span>
      </InfoTooltip>
    );
  }
  if (value < -1) {
    return (
      <InfoTooltip content={dashboardLocale.tooltips.trendDown.replace("{value}", Math.abs(value).toString())} side="bottom">
        <span className="font-body-sm text-body-sm text-error flex items-center gap-1">
          <span className="material-symbols-outlined text-xs">trending_down</span>
          {value}% {dashboardLocale.summary.vsLastMonth}
        </span>
      </InfoTooltip>
    );
  }
  return (
    <InfoTooltip content={dashboardLocale.tooltips.trendFlat} side="bottom">
      <span className="font-body-sm text-body-sm text-secondary flex items-center gap-1">
        <span className="material-symbols-outlined text-xs">trending_flat</span>
        {value}% {dashboardLocale.summary.vsLastMonth}
      </span>
    </InfoTooltip>
  );
}

export function DashboardSummary() {
  const { currentMonth, previousMonth } = getMonthOverMonthDates();

  const totals = useQuery(api.transactions.getTotals, { month: currentMonth });
  const trend = useQuery(api.transactions.getMonthOverMonthTrend, {
    currentMonth,
    previousMonth,
  });

  // If loading, show 0 as fallback or keep empty
  const income = totals?.totalIncome || 0;
  const expense = totals?.totalExpenses || 0;
  const remaining = totals?.remainingBalance || 0;

  // Calculate safe to spend this week — client-side only, no extra query needed
  const safeToSpend = calculateSafeToSpend(remaining);

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Total Income */}
      <div className="bg-surface-container-lowest border border-slate-200 rounded-xl p-[24px] shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-label-md text-label-md text-secondary">{dashboardLocale.summary.totalIncome}</h3>
          <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-sm">arrow_downward</span>
          </div>
        </div>
        <div>
          <div className="font-display text-display text-on-surface mb-1">{formatCurrency(income)}</div>
          <TrendIndicator value={trend?.incomeTrend} />
        </div>
      </div>

      {/* Total Expenses */}
      <div className="bg-surface-container-lowest border border-slate-200 rounded-xl p-[24px] shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-label-md text-label-md text-secondary">{dashboardLocale.summary.totalExpenses}</h3>
          <div className="w-8 h-8 rounded-full bg-error-container flex items-center justify-center text-error">
            <span className="material-symbols-outlined text-sm">arrow_upward</span>
          </div>
        </div>
        <div>
          <div className="font-display text-display text-on-surface mb-1">{formatCurrency(expense)}</div>
          <TrendIndicator value={trend?.expenseTrend} />
        </div>
      </div>

      {/* Remaining Balance */}
      <div className="bg-primary rounded-xl p-[24px] shadow-md flex flex-col justify-between text-on-primary">
        <div className="flex items-center justify-between mb-4">
          <InfoTooltip content={dashboardLocale.tooltips.remainingBalance} side="top">
            <h3 className="font-label-md text-label-md text-primary-fixed-dim opacity-90">{dashboardLocale.summary.remainingBalance}</h3>
          </InfoTooltip>
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-on-primary backdrop-blur-sm">
            <span className="material-symbols-outlined text-sm">account_balance_wallet</span>
          </div>
        </div>
        <div>
          <div className={`font-display text-display mb-1 ${remaining < 0 ? "text-error" : "text-on-primary"}`}>
            {formatCurrency(remaining)}
          </div>
          <InfoTooltip content={dashboardLocale.tooltips.safeToSpend} side="bottom">
            <span className="font-body-sm text-body-sm text-primary-fixed-dim opacity-90">
              {dashboardLocale.summary.safeToSpend}: {formatCurrency(safeToSpend)}
            </span>
          </InfoTooltip>
        </div>
      </div>
    </section>
  );
}
