# US-09 Budget Warning States Implementation Plan

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agent/workflows/execute-plan.md` to execute this plan in single-flow mode.

**Goal:** Implement visual warning states for the monthly budget feature to alert users when they are near or over their limits.

**Architecture:** We will create pure utility functions to calculate the warning state, define a single source of truth for the styles in `src/constants/budget.ts`, and apply them to the `BudgetCategoryRow` and a newly extracted `DashboardSpendingBreakdown` component. 

**Tech Stack:** Next.js 16 (App Router), Convex, Tailwind CSS, TypeScript

---

### Task 1: Budget Utilities

**Files:**
- Modify: `src/lib/budget.ts`

**Step 1: Implement getBudgetStatus & getBudgetPercentage**

Append the pure functions to `src/lib/budget.ts`:

```typescript
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
```

*Note: Automated tests (Vitest) are explicitly deferred until after manual verification.*

---

### Task 2: Budget Constants

**Files:**
- Modify: `src/constants/budget.ts`

**Step 1: Add BUDGET_STATUS_STYLES**

Append the styling map to `src/constants/budget.ts`:

```typescript
export const BUDGET_STATUS_STYLES = {
  none: {
    bar:        "",
    text:       "text-on-surface-variant",
    iconBg:     "bg-primary/10 text-primary", // fallback default
    inputBorder:"border-outline-variant",
    showPill:   false,
  },
  normal: {
    bar:        "bg-primary",
    text:       "text-primary",
    iconBg:     "bg-primary-container text-on-primary-container",
    inputBorder:"border-outline-variant",
    showPill:   false,
  },
  warning: {
    bar:        "bg-amber-500",
    text:       "text-amber-600",
    iconBg:     "bg-amber-100 text-amber-700",
    inputBorder:"border-outline-variant",
    showPill:   false,
  },
  exceeded: {
    bar:        "bg-error",
    text:       "text-error",
    iconBg:     "bg-error-container text-on-error-container",
    inputBorder:"border-error",
    showPill:   true,
  },
} as const;
```

---

### Task 3: Apply Warning States to BudgetCategoryRow

**Files:**
- Modify: `src/components/budget/budget-category-row.tsx`

**Step 1: Import utilities and constants**

Update imports:
```typescript
import { CATEGORY_SUBTITLES, BUDGET_STATUS_STYLES } from "@/constants/budget";
import { formatCurrency } from "@/lib/formatters";
import { BUDGET_STRINGS as t } from "@/locale/budget";
import { getBudgetStatus, getBudgetPercentage } from "@/lib/budget";
```

**Step 2: Update rendering logic**

Replace the percentage and style calculations:
```typescript
  const status = getBudgetStatus(spent, limit);
  const styles = BUDGET_STATUS_STYLES[status];
  const displayPercentage = hasLimit ? Math.round((spent / limit) * 100) : 0; // uncapped — for label
  const barPercentage = getBudgetPercentage(spent, limit); // capped at 100 — for bar width
```

**Step 3: Apply styles to UI elements**

Update the progress bar:
```tsx
      <div className="flex justify-between items-center font-label-xs text-label-xs mb-1.5">
        <span className={status === "exceeded" ? styles.text : "text-on-surface-variant"}>
          {t.LABEL_SPENT} {formatCurrency(spent)}
        </span>
        <div className="flex items-center gap-2">
          {styles.showPill && (
            <span className="bg-error text-on-error px-2 py-0.5 rounded-full font-label-xs">
              OVER BUDGET
            </span>
          )}
          <span className={`${styles.text} font-medium`}>{displayPercentage}%</span>
        </div>
      </div>
      <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${styles.bar}`}
          style={{ width: `${barPercentage}%` }}
        ></div>
      </div>
```

Update the icon background:
```tsx
        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${styles.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
```

Update the input border (dynamically append `styles.inputBorder` or replace the class if error).

---

### Task 4: Dashboard Spending Breakdown Component

**Files:**
- Create: `src/components/dashboard/dashboard-spending-breakdown.tsx`
- Modify: `src/components/dashboard/index.ts`

**Step 1: Create the Component**

Create `src/components/dashboard/dashboard-spending-breakdown.tsx`:
```tsx
"use client";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { BUDGET_STATUS_STYLES, BUDGET_ELIGIBLE_CATEGORIES } from "@/constants/budget";
import { getBudgetStatus, getBudgetPercentage } from "@/lib/budget";
import { formatCurrency } from "@/lib/formatters";
import { ICON_MAP } from "@/constants/icons";
import { MoreHorizontal } from "lucide-react";

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

  // Filter to show only budgets with a limit > 0
  const validBudgets = budgets.filter(b => b.monthlyLimit > 0);

  if (validBudgets.length === 0) {
    return (
      <div className="mt-8 bg-surface-container-lowest border border-slate-200 rounded-xl p-[24px] shadow-sm">
         <h2 className="font-h3 text-h3 text-on-surface mb-6">Spending Breakdown</h2>
         <p className="text-secondary font-body-sm">No budgets set for this month.</p>
      </div>
    );
  }

  return (
    <div className="mt-8 bg-surface-container-lowest border border-slate-200 rounded-xl p-[24px] shadow-sm">
      <h2 className="font-h3 text-h3 text-on-surface mb-6">Spending Breakdown</h2>
      <div className="space-y-6">
        {validBudgets.map(b => {
          const spent = spentMap[b.category] || 0;
          const status = getBudgetStatus(spent, b.monthlyLimit);
          const styles = BUDGET_STATUS_STYLES[status];
          const width = getBudgetPercentage(spent, b.monthlyLimit);
          
          const catDef = BUDGET_ELIGIBLE_CATEGORIES.find((c) => c.value === b.category);
          const iconKey = catDef?.icon || "more-horizontal";
          const Icon = ICON_MAP[iconKey as keyof typeof ICON_MAP] || MoreHorizontal;

          return (
            <div key={b.category}>
              <div className="flex justify-between items-center font-label-md text-label-md mb-2">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${styles.iconBg}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-on-surface">{b.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  {styles.showPill && (
                     <span className="bg-error text-on-error px-2 py-0.5 rounded-full font-label-xs text-[10px]">
                       OVER BUDGET
                     </span>
                  )}
                  <span className={status === "exceeded" ? styles.text : "text-secondary"}>
                    {formatCurrency(spent)} / {formatCurrency(b.monthlyLimit)}
                  </span>
                </div>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className={`h-2 rounded-full transition-all duration-300 ${styles.bar}`} style={{ width: `${width}%` }}></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

**Step 2: Export in barrel file**

In `src/components/dashboard/index.ts`, add:
```typescript
export * from "./dashboard-spending-breakdown";
```

---

### Task 5: Integrate into Dashboard Page

**Files:**
- Modify: `src/app/dashboard/page.tsx`

**Step 1: Replace static breakdown**

Import the new component:
```tsx
import { DashboardSummary, DashboardSpendingBreakdown } from "@/components/dashboard";
```

Replace the static "Spending Breakdown" section (`<div className="mt-8 bg-surface-container-lowest...`) with:
```tsx
<DashboardSpendingBreakdown />
```

---

**Completion Note:** Tests are explicitly deferred. End execution after Task 5.
