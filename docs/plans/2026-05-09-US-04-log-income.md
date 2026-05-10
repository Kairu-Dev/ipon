# US-04 Log Income Implementation Plan

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agent/workflows/execute-plan.md` to execute this plan in single-flow mode.

**Goal:** Integrate the Income feature into the dashboard by fetching the total income and expenses for the user's local calendar month.

**Status Note:** 
Half of this ticket was completed during US-03:
- `convex/transactions.ts` already handles `type: "income"`.
- `AddTransactionModal` already renders `INCOME_CATEGORIES` when the toggle is flipped.
- The toggle state properly clears categories when switched.
We are now focusing on the dashboard read-models and local timezone constraints.

**Decision Note (Percentages):** The "+12% vs last month" comparison labels are Out of Scope for US-04. Following YAGNI principles, we will leave the percentages hardcoded in the UI to match the mockup visually, and build the month-over-month calculation logic in a future "Analytics/Insights" ticket.

**Tech Stack:** Next.js 16, Convex, Tailwind CSS, Zustand

---

### Task 1: Create `getTotals` Query

**Files:**
- Modify: `convex/transactions.ts`

**Step 1: Write the minimal implementation**
Add a query to sum the transactions for a specific month. Since the database stores the `date` as a string (`YYYY-MM-DD`), we can use `startsWith`.

```typescript
// convex/transactions.ts
import { query } from "./_generated/server";
// ... existing imports

export const getTotals = query({
  args: { month: v.string() }, // "YYYY-MM" format expected
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { totalIncome: 0, totalExpenses: 0, remainingBalance: 0 };

    const currentMonthTx = await ctx.db
      .query("transactions")
      .withIndex("by_user_and_date", (q) => 
        q.eq("userId", userId)
         .gte("date", `${args.month}-01`)
         .lte("date", `${args.month}-31`)
      )
      .collect();

    const totalIncome = currentMonthTx
      .filter(tx => tx.type === "income")
      .reduce((sum, tx) => sum + tx.amount, 0);
      
    const totalExpenses = currentMonthTx
      .filter(tx => tx.type === "expense")
      .reduce((sum, tx) => sum + tx.amount, 0);

    return {
      totalIncome,
      totalExpenses,
      remainingBalance: totalIncome - totalExpenses
    };
  }
});
```

**Step 2: Commit**
```bash
git add convex/transactions.ts
git commit -m "feat(convex): add getTotals query for dashboard summary"
```

### Task 2: Create DashboardSummary Client Component

**Files:**
- Create: `src/components/dashboard/dashboard-summary.tsx`

**Step 1: Write minimal implementation**
Extract the top 3 cards from `src/app/dashboard/page.tsx` into a new Client Component. We use local timezone logic to ensure a user in the Philippines sees their local month, avoiding UTC offset bugs.

```tsx
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
```

**Step 2: Commit**
```bash
git add src/components/dashboard/dashboard-summary.tsx
git commit -m "feat(dashboard): create Client Component for dashboard summary"
```

### Task 3: Export from Barrel and Inject into Page

**Files:**
- Create: `src/components/dashboard/index.ts`
- Modify: `src/app/dashboard/page.tsx`

**Step 1: Write minimal implementation**
Create the barrel file export:
```typescript
// src/components/dashboard/index.ts
export * from "./dashboard-shell";
export * from "./contribute-goal-panel";
export * from "./create-goal-modal";
export * from "./dashboard-summary";
```

Replace the static section in `src/app/dashboard/page.tsx`:
```tsx
import Link from "next/link";
import { DashboardSummary } from "@/components/dashboard";

export default function DashboardPage() {
  return (
    <>
      {/* Header Section */}
      <section className="space-y-2">
        <h1 className="font-h1 text-h1 text-on-surface">Kumusta, Marco!</h1>
        <p className="font-body-base text-body-base text-secondary">Here&apos;s your financial overview for this month.</p>
      </section>

      {/* Summary Cards */}
      <DashboardSummary />

      {/* Main Dashboard Grid */}
      {/* ... rest of the page remains identical ... */}
```

**Step 2: Commit**
```bash
git add src/components/dashboard/index.ts src/app/dashboard/page.tsx
git commit -m "feat(dashboard): integrate dynamic DashboardSummary into dashboard page"
```
