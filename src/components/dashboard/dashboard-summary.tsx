"use client";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export function DashboardSummary() {
  // Use local time to avoid UTC mismatch. 
  // toISOString() uses UTC which is incorrect for users in UTC+8 past midnight.
  const today = new Date();
  const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  
  const totals = useQuery(api.transactions.getTotals, { month: currentMonth });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(amount);
  };

  // If loading, show 0 as fallback or keep empty
  const income = totals?.totalIncome || 0;
  const expense = totals?.totalExpenses || 0;
  const remaining = totals?.remainingBalance || 0;

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Total Income */}
      <div className="bg-surface-container-lowest border border-slate-200 rounded-xl p-[24px] shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-label-md text-label-md text-secondary">Total Income</h3>
          <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-sm">arrow_downward</span>
          </div>
        </div>
        <div>
          <div className="font-display text-display text-on-surface mb-1">{formatCurrency(income)}</div>
          <div className="font-body-sm text-body-sm text-primary flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">trending_up</span>
            +12% vs last month
          </div>
        </div>
      </div>

      {/* Total Expenses */}
      <div className="bg-surface-container-lowest border border-slate-200 rounded-xl p-[24px] shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-label-md text-label-md text-secondary">Total Expenses</h3>
          <div className="w-8 h-8 rounded-full bg-error-container flex items-center justify-center text-error">
            <span className="material-symbols-outlined text-sm">arrow_upward</span>
          </div>
        </div>
        <div>
          <div className="font-display text-display text-on-surface mb-1">{formatCurrency(expense)}</div>
          <div className="font-body-sm text-body-sm text-secondary flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">trending_flat</span>
            -2% vs last month
          </div>
        </div>
      </div>

      {/* Remaining Balance */}
      <div className="bg-primary rounded-xl p-[24px] shadow-md flex flex-col justify-between text-on-primary">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-label-md text-label-md text-primary-fixed-dim opacity-90">Remaining Balance</h3>
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-on-primary backdrop-blur-sm">
            <span className="material-symbols-outlined text-sm">account_balance_wallet</span>
          </div>
        </div>
        <div>
          <div className="font-display text-display text-on-primary mb-1">{formatCurrency(remaining)}</div>
          <div className="font-body-sm text-body-sm text-primary-fixed-dim opacity-90">
            Safe to spend this week: ₱6,500
          </div>
        </div>
      </div>
    </section>
  );
}
