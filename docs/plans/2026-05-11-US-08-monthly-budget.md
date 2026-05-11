# US-08: Set Monthly Budget Per Category Implementation Plan

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agent/workflows/execute-plan.md` to execute this plan in single-flow mode.

**Goal:** Allow users to set and manage monthly budget limits per category to control their spending.

**Architecture:** 
The feature relies on a Convex backend with a `budgets` table tracking limits per category per month. `getBudgets` handles carry-over logic from previous months. `saveBudgets` handles bulk upserts and deletions atomically. The frontend utilizes local state to hold editable row limits before persisting via a single "Save Changes" action. Total budget sums and progress states are computed dynamically using the existing `transactions` records for the month.

**Tech Stack:** Next.js, Tailwind CSS, shadcn/ui, Convex, Zustand (UI Store/Local State), React Hook Form.

---

### Task 1: Budget Constants and Utilities

**Files:**
- Create: `src/constants/budget.ts`
- Create: `src/lib/budget.ts`

**Step 1: Write Budget Constants**
- Export `BUDGET_ELIGIBLE_CATEGORIES` mapping from `EXPENSE_CATEGORIES` (excluding "Savings").
- Export `CATEGORY_SUBTITLES` mapping standard categories to descriptions.

**Step 2: Write Budget Utilities**
- Create `calculateTotalBudget(budgets)` to sum `monthlyLimit` across all valid budget entries.

**Step 3: Commit**
```bash
git add src/constants/budget.ts src/lib/budget.ts
git commit -m "feat: add budget constants and utilities"
```

---

### Task 2: Convex Backend

**Files:**
- Create: `convex/budgets.ts`

**Step 1: Implement `getBudgets` Query**
- Accept `month: string` (YYYY-MM).
- Return current month's budgets.
- If empty, compute the previous month (handling year rollover), fetch previous budgets, and return them as defaults (with no `_id` so they act as transient defaults). **Crucially**, the frontend MUST key its rows by `category`, not `_id`, since carry-over rows won't have an `_id` until saved.

**Step 2: Implement `getSpentPerCategory` Query**
- Accept `month: string`.
- Aggregate transaction amounts using the `by_user_and_date` index to filter by month at the database level (e.g., `.gte("date", \`${args.month}-01\`).lte("date", \`${args.month}-31\`)`), filtering by `type: "expense"` and ignoring `"Savings"`. Do NOT fetch all transactions and filter in memory.
- Return `Record<string, number>`.

**Step 3: Implement `saveBudgets` Mutation**
- Accept `month: string` and `budgets: Array<{category: string, monthlyLimit: number}>`.
- Validate limits > 0.
- Perform a bulk upsert (comparing existing categories vs payload).
- Delete records for categories not present in the payload.

**Step 4: Commit**
```bash
git add convex/budgets.ts
git commit -m "feat: add budget queries and bulk save mutation"
```

---

### Task 3: Budget UI Components (Cards)

**Files:**
- Create: `src/components/budget/budget-summary-card.tsx`
- Create: `src/components/budget/income-allocated-card.tsx`
- Create: `src/components/budget/index.ts`

**Step 1: Implement `BudgetSummaryCard`**
- Show total remaining budget.
- Show "Spent X / Y Budgeted" text.
- Render a simple progress bar indicating overall usage.

**Step 2: Implement `IncomeAllocatedCard`**
- Install recharts (`npm install recharts`).
- Calculate allocated percentage `(allocated / totalIncome) * 100`.
- Display a donut chart using `recharts` directly (do NOT use shadcn `ChartContainer`). Use `<PieChart>`, `<Pie>`, and `<Cell>` with `innerRadius={38}`, `outerRadius={52}`, `startAngle={90}`, `endAngle={-270}`, `strokeWidth={0}`.
- Use `var(--color-primary)` for the filled percentage and `var(--color-surface-container)` for the remaining space.
- Display the percentage text absolutely positioned over the chart hole.
- Show "On Track" or warning badge depending on allocation percentage.

**Step 3: Barrel Export**
- Export both cards from `src/components/budget/index.ts`.

**Step 4: Commit**
```bash
git add src/components/budget/
git commit -m "feat: add budget summary and income allocated cards"
```

---

### Task 4: Budget UI Components (Rows & Modal)

**Files:**
- Create: `src/components/budget/budget-category-row.tsx`
- Create: `src/components/budget/add-category-modal.tsx`
- Modify: `src/components/budget/index.ts`

**Step 1: Extract `ICON_MAP` to a shared constants file**
- Create: `src/constants/icons.ts`
- Move `ICON_MAP` from `src/components/transactions/add-transaction-modal.tsx` and `transaction-row.tsx` to `src/constants/icons.ts` and export it.
- **CRITICAL**: Ensure the `ICON_MAP` includes the `PiggyBank` icon for the "Savings" category (total 10 entries). Do not miss this during extraction!
- Update those components to import `ICON_MAP` from the new constants file.

**Step 2: Implement `BudgetCategoryRow`**
- Render category icon (from the newly extracted `ICON_MAP` in `src/constants/icons.ts`), name, and subtitle.
- Display spent amount, percentage, and progress bar.
- Provide a numeric input (with hidden spinners) for the limit.
- Include a delete (trash) button.

**Step 3: Implement `AddCategoryModal`**
- Controlled modal for entering a custom category name and initial limit.
- On submit, adds the new row to the local state.

**Step 4: Barrel Export**
- Export new components from `src/components/budget/index.ts`.

**Step 5: Commit**
```bash
git add src/components/budget/
git commit -m "feat: add budget row and add category modal"
```

---

### Task 5: Budget Page Integration

**Files:**
- Modify: `src/app/dashboard/budget/page.tsx` (assuming it exists, or create if missing)

**Step 1: Connect State and Data**
- Mark as `"use client"`.
- Query `getBudgets`, `getSpentPerCategory`, and `getTotals`.
- Initialize local state with `getBudgets` data (or default `BUDGET_ELIGIBLE_CATEGORIES` if user has absolutely no history).
- **Important**: Generate the client-side date using the explicit `pad()` pattern (e.g., `const currentMonth = \`${today.getFullYear()}-\${pad(today.getMonth() + 1)}\`;`) rather than `toISOString()`.
- Provide handlers for row changes, row deletion, and the "Save Changes" bulk mutation.
- **Important**: Before calling `saveBudgets`, explicitly strip any rows where the limit is blank or `0`. Only valid numbers `> 0` should be sent in the payload.

**Step 2: Render Layout**
- Render the `BudgetSummaryCard` and `IncomeAllocatedCard` at the top.
- Render a list of `BudgetCategoryRow` components mapped from local state.
- Render the "+ Add Category" button triggering the modal.
- Render the sticky "Save Changes" action button.

**Step 3: Commit**
```bash
git add src/app/dashboard/budget/page.tsx
git commit -m "feat: wire up budget dashboard page"
```

---

## Post-Implementation Audit (US-08 & US-09)

### Part 1 — US-08 Bug Fix (Must Fix Before US-09)
**Root Cause:**
When a user clicked "Save Changes", the `saveBudgets` mutation correctly persisted the non-zero budgets to the Convex database and deleted the others. However, upon reloading the page, the initial component state population (`isInitialized = false`) fetched `budgets` and mapped *only* those persisted items into the `rows` state. Since the blank default categories were deleted from the DB during save, they disappeared from the UI, creating the appearance of a failed save or broken UI. 

**Exact Fix Applied:**
Updated the render phase initialization in `src/app/dashboard/budget/page.tsx` to always map over `BUDGET_ELIGIBLE_CATEGORIES` first, merging any `monthlyLimit` found in the persisted `budgets`. It then appends any custom categories the user created. This ensures the 6 default categories are *always* displayed (either with their saved limits or blank limits) alongside custom ones, fixing the UI rendering after a save/reload. We also added logging and a user-facing alert in `handleSave` to surface any future errors.

### Part 2 — US-08 Wiring Checklist
#### Summary Cards
- ✅ **Wired correctly** - Total Remaining shows `totalBudgeted - totalSpent`
- ✅ **Wired correctly** - "SPENT / BUDGETED" shows `₱X / ₱Y` without truncation
- ✅ **Wired correctly** - Progress bar width reflects `totalSpent / totalBudgeted` capped at 100%
- ✅ **Wired correctly** - "X% Used" and "Y% Left" labels are correct
- ✅ **Wired correctly** - Income Allocated percentage = `sum of limits / totalIncome * 100`
- ✅ **Wired correctly** - Donut chart fills correctly matching the percentage (Recharts PieChart)
- ✅ **Wired correctly** - "₱X unallocated funds" = `totalIncome - sum of limits`
- ✅ **Wired correctly** - "On Track" badge shows when allocated ≤ 100%

#### Category Rows
- ✅ **Wired correctly** - All 6 default categories shown | Food & Dining, Transportation, Load & Bills, Rent, Shopping, Others
- ✅ **Wired correctly** - "Savings" category NOT shown | Excluded from budget page
- ✅ **Wired correctly** - Category subtitle shown below name | From `CATEGORY_SUBTITLES` constant
- ✅ **Wired correctly** - "Spent ₱X" sourced from `getSpentPerCategory`
- ✅ **Wired correctly** - Input value sourced from `getBudgets` for current month
- ✅ **Wired correctly** - Rows keyed by `category` value not `_id`
- ✅ **Wired correctly** - Blank input = no budget set
- ✅ **Wired correctly** - Delete button removes row from local state
- ✅ **Wired correctly** - Save Changes sends only rows with valid limits > 0

#### UX Improvements (Add These)
- ✅ **Wired correctly** - Column header ("Monthly Limit" added)
- ✅ **Wired correctly** - Placeholder text (`placeholder="Set limit"` added)

### Part 3 — US-09 Design Wiring Checklist
#### Per-Category Row Color States
- ✅ **Wired correctly** - `none` (No limit set)
- ✅ **Wired correctly** - `normal` (< 80% spent)
- ✅ **Wired correctly** - `warning` (80–99% spent)
- ✅ **Wired correctly** - `exceeded` (≥ 100% spent)
- ✅ **Wired correctly** - Visual elements (Progress bar color, Icon background, Percentage label, "Spent ₱X" text, Input border, "OVER BUDGET" pill, Progress bar shown)

#### Percentage Label — Uncapped vs Capped
- ✅ **Wired correctly** - Progress bar width (Capped at 100%)
- ✅ **Wired correctly** - Percentage label text (Shows real uncapped value)

#### Dashboard Spending Breakdown
- ✅ **Wired correctly** - Spending Breakdown fetches `getBudgets` for current month
- ✅ **Wired correctly** - Spending Breakdown fetches `getSpentPerCategory` for current month
- ✅ **Wired correctly** - Color states applied to each bar using same `getBudgetStatus` utility
- ⚠️ **Partially wired** -> ✅ **Fixed** - Category with no budget limit shows no color state | Raw amount only (Fixed by rewriting `validBudgets` logic in `dashboard-spending-breakdown.tsx` to include categories from `spentMap` that have no corresponding budget limit).
