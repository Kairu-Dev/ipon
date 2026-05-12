# US-10 Monthly Summary Dashboard Implementation Plan

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agent/workflows/execute-plan.md` to execute this plan in single-flow mode.

**Goal:** Implement the monthly summary dashboard to show real user greeting, dynamic financial trends, and top 3 savings goals.

**Architecture:** We will add a new Convex query `getMonthOverMonthTrend` to calculate income/expense trends, update `DashboardSummary` to display these trends and handle negative balances, create a new horizontally scrollable `DashboardGoalsPreview` component, and wire the real user's name in the `BudgetPage` greeting.

**Tech Stack:** Next.js 16 (App Router), Convex, Tailwind CSS v4, React.

---

### Task 1: Setup Scrollbar Hiding

**Files:**
- Modify: `package.json`
- Modify: `src/app/globals.css`

**Step 1: Install dependency**

Run: `npm install tailwind-scrollbar-hide`
Expected: PASS

**Step 2: Configure Tailwind v4 plugin**

Modify `src/app/globals.css` to add the plugin after the existing imports.

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";
@plugin "tailwind-scrollbar-hide";
```

**Step 3: Commit**

```bash
git add package.json package-lock.json src/app/globals.css
git commit -m "chore: add tailwind-scrollbar-hide plugin"
```

---

### Task 2: Add Trend Query to Convex

**Files:**
- Modify: `convex/transactions.ts`

**Step 1: Implement getMonthOverMonthTrend**

Add the query to the bottom of `convex/transactions.ts`.

```ts
export const getMonthOverMonthTrend = query({
  args: {
    currentMonth: v.string(),  // "YYYY-MM"
    previousMonth: v.string(), // "YYYY-MM"
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const sumForMonth = async (month: string) => {
      const txs = await ctx.db
        .query("transactions")
        .withIndex("by_user_and_date", q =>
          q.eq("userId", userId)
           .gte("date", `${month}-01`)
           .lte("date", `${month}-31`)
        )
        .collect();

      const income = txs
        .filter(t => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);

      // Exclude Savings — goal contributions skew expense trends
      const expenses = txs
        .filter(t => t.type === "expense" && t.category !== "Savings")
        .reduce((sum, t) => sum + t.amount, 0);

      return { income, expenses };
    };

    const current = await sumForMonth(args.currentMonth);
    const previous = await sumForMonth(args.previousMonth);

    const calcTrend = (curr: number, prev: number): number | null => {
      if (prev === 0) return null; // no previous data — show N/A
      return Math.round(((curr - prev) / prev) * 100);
    };

    return {
      incomeTrend:  calcTrend(current.income,   previous.income),
      expenseTrend: calcTrend(current.expenses,  previous.expenses),
    };
  },
});
```

**Step 2: Commit**

```bash
git add convex/transactions.ts
git commit -m "feat: add getMonthOverMonthTrend convex query"
```

---

### Task 3: Apply Dynamic Trends & Negative Balance to Summary

**Files:**
- Modify: `src/components/dashboard/dashboard-summary.tsx`

**Step 1: Add imports and Helper Component**

Update `src/components/dashboard/dashboard-summary.tsx`.
Add imports for `useQuery`, `api`, and the `TrendIndicator` helper before the main component.

```tsx
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

function TrendIndicator({ value }: { value: number | null | undefined }) {
  if (value === null || value === undefined) {
    return (
      <span className="font-body-sm text-secondary">N/A</span>
    );
  }
  if (value > 1) return (
    <span className="font-body-sm text-primary flex items-center gap-1">
      <span className="material-symbols-outlined text-xs">trending_up</span>
      +{value}% vs last month
    </span>
  );
  if (value < -1) return (
    <span className="font-body-sm text-error flex items-center gap-1">
      <span className="material-symbols-outlined text-xs">trending_down</span>
      {value}% vs last month
    </span>
  );
  return (
    <span className="font-body-sm text-secondary flex items-center gap-1">
      <span className="material-symbols-outlined text-xs">trending_flat</span>
      {value}% vs last month
    </span>
  );
}
```

**Step 2: Update DashboardSummary component body**

Calculate dates, query trends, and use `TrendIndicator`. Ensure negative balance styling is applied.

```tsx
export function DashboardSummary() {
  const pad = (n: number) => String(n).padStart(2, "0");
  const today = new Date();
  const currentMonth = `${today.getFullYear()}-${pad(today.getMonth() + 1)}`;
  
  // Generate previous month — JS Date handles January → December rollover correctly
  const prevDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const previousMonth = `${prevDate.getFullYear()}-${pad(prevDate.getMonth() + 1)}`;

  const totals = useQuery(api.transactions.getTotals, { month: currentMonth });
  const trend = useQuery(api.transactions.getMonthOverMonthTrend, {
    currentMonth,
    previousMonth,
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(amount);
  };

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
          <TrendIndicator value={trend?.incomeTrend} />
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
          <TrendIndicator value={trend?.expenseTrend} />
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
          <div className={`font-display text-display mb-1 ${remaining < 0 ? "text-error" : "text-on-primary"}`}>
            {formatCurrency(remaining)}
          </div>
          <div className="font-body-sm text-body-sm text-primary-fixed-dim opacity-90">
            Safe to spend this week: ₱6,500
          </div>
        </div>
      </div>
    </section>
  );
}
```

**Step 3: Commit**

```bash
git add src/components/dashboard/dashboard-summary.tsx
git commit -m "feat: apply dynamic trends and negative balance styling"
```

---

### Task 4: Create Top 3 Goals Section

**Files:**
- Create: `src/components/dashboard/dashboard-goals-preview.tsx`
- Modify: `src/components/dashboard/index.ts`

**Step 1: Create dashboard-goals-preview.tsx**

```tsx
"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import { GoalCard } from "@/components/goals";

export function DashboardGoalsPreview() {
  const goals = useQuery(api.goals.getGoals);

  if (goals === undefined) {
    return <div className="animate-pulse h-48 rounded-xl bg-surface-container" />;
  }

  const topGoals = goals.slice(0, 3);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-h3 text-h3 text-on-surface">Savings Goals</h2>
        <Link
          href="/dashboard/savings-goals"
          className="font-label-md text-primary flex items-center gap-1 hover:opacity-80 transition-opacity"
        >
          View All
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </Link>
      </div>

      {topGoals.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 bg-surface-container-lowest rounded-xl border border-outline-variant text-center gap-4">
          <p className="font-body-base text-secondary">
            No savings goals yet
          </p>
          <Link
            href="/dashboard/savings-goals"
            className="bg-primary text-on-primary px-6 py-2 rounded-lg font-label-md hover:opacity-90"
          >
            Create Goal
          </Link>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory -mx-4 px-4">
          {topGoals.map(goal => (
            <div
              key={goal._id}
              className="min-w-[240px] max-w-[280px] snap-start flex-shrink-0"
            >
              <GoalCard goal={goal} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

**Step 2: Export component**

Update `src/components/dashboard/index.ts`:

```ts
export * from "./dashboard-goals-preview";
```

**Step 3: Commit**

```bash
git add src/components/dashboard/dashboard-goals-preview.tsx src/components/dashboard/index.ts
git commit -m "feat: add top 3 goals preview section"
```

---

### Task 5: Integrate into Dashboard Page

**Files:**
- Modify: `src/app/dashboard/page.tsx`

**Step 1: Wire user greeting and Goals Preview**

Update imports and usage:

```tsx
import { useCurrentUser } from "@convex-dev/auth/react";
import { DashboardGoalsPreview } from "@/components/dashboard";
// ... inside component ...
const currentUser = useCurrentUser();

// Replace hardcoded "Marco" greeting
<h1>Kumusta, {currentUser?.name?.split(" ")[0] ?? "there"}!</h1>

// Replace static Savings Goals section
<DashboardGoalsPreview />
```

**Step 2: Commit**

```bash
git add src/app/dashboard/page.tsx
git commit -m "feat: wire user greeting and goals preview to dashboard"
```
