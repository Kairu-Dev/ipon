# US-05 View & Filter Transaction History Implementation Plan

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agent/workflows/execute-plan.md` to execute this plan in single-flow mode.

**Goal:** Implement the paginated, filterable transaction history list in the `/dashboard/transactions` page.

**Architecture:** 
- Add `getTransactions` to Convex backend using `withIndex` and `paginate()`
- Build a pure utility `groupByDate` in `src/lib/transactions.ts` to group transactions by relative dates (Today, Yesterday, Oct 24)
- Create `TransactionRow`, `EmptyTransactionState`, and `TransactionList` components in `src/components/transactions/`
- Replace the static mockup in `src/app/dashboard/transactions/page.tsx` with `TransactionList`
- The `TransactionList` will internally manage the `type` and `category` filter states to avoid polluting the global Zustand store with ephemeral page-specific UI state.

**Tech Stack:** Next.js 16, Convex (`usePaginatedQuery`), Tailwind CSS, Vitest

---

### Task 1: Create `groupByDate` Utility & Tests

**Files:**
- Create: `src/lib/transactions.ts`
- Create: `src/test/transactions.test.ts` (or `src/lib/transactions.test.ts` to match standard)

**Step 1: Write the failing test**

```typescript
// src/lib/transactions.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { groupByDate } from "./transactions";

describe("groupByDate", () => {
  beforeEach(() => {
    // Mock system time to 2026-10-24T12:00:00Z for consistent relative dates
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-24T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("groups transactions correctly with relative date labels", () => {
    const txs = [
      { _id: "1", date: "2026-10-24", amount: 100 },
      { _id: "2", date: "2026-10-24", amount: 200 },
      { _id: "3", date: "2026-10-23", amount: 50 },
      { _id: "4", date: "2026-10-22", amount: 10 }
    ] as any;

    const result = groupByDate(txs);
    
    expect(result).toHaveLength(3);
    expect(result[0].dateLabel).toBe("Today, Oct 24");
    expect(result[0].transactions).toHaveLength(2);
    
    expect(result[1].dateLabel).toBe("Yesterday, Oct 23");
    expect(result[1].transactions).toHaveLength(1);
    
    expect(result[2].dateLabel).toBe("Oct 22");
    expect(result[2].transactions).toHaveLength(1);
  });
});
```

**Step 2: Run test to verify it fails**
Run: `npm run test run`
Expected: FAIL due to missing `transactions.ts`

**Step 3: Write minimal implementation**

```typescript
// src/lib/transactions.ts
export function groupByDate<T extends { date: string }>(transactions: T[]) {
  const groups = new Map<string, T[]>();
  
  for (const tx of transactions) {
    if (!groups.has(tx.date)) {
      groups.set(tx.date, []);
    }
    groups.get(tx.date)!.push(tx);
  }

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const pad = (n: number) => String(n).padStart(2, "0");
  const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
  const yesterdayStr = `${yesterday.getFullYear()}-${pad(yesterday.getMonth() + 1)}-${pad(yesterday.getDate())}`;

  return Array.from(groups.entries()).map(([dateStr, txs]) => {
    const dateObj = new Date(dateStr);
    const month = dateObj.toLocaleString("en-US", { month: "short" });
    const day = dateObj.getDate();
    const formattedDate = `${month} ${day}`;

    let dateLabel = formattedDate;
    if (dateStr === todayStr) {
      dateLabel = `Today, ${formattedDate}`;
    } else if (dateStr === yesterdayStr) {
      dateLabel = `Yesterday, ${formattedDate}`;
    }

    return {
      date: dateStr,
      dateLabel,
      transactions: txs
    };
  });
}
```

**Step 4: Run test to verify it passes**
Run: `npm run test run`
Expected: PASS

**Step 5: Commit**
```bash
git add src/lib/transactions.ts src/lib/transactions.test.ts
git commit -m "feat(lib): add groupByDate utility and tests"
```

---

### Task 2: Create `getTransactions` Query

**Files:**
- Modify: `convex/transactions.ts`

**Step 1: Write the implementation**
```typescript
// Add to convex/transactions.ts
import { paginationOptsValidator } from "convex/server";

export const getTransactions = query({
  args: {
    type: v.optional(v.union(v.literal("income"), v.literal("expense"))),
    category: v.optional(v.string()),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthenticated");

    let q = ctx.db
      .query("transactions")
      .withIndex("by_user_and_date", q => q.eq("userId", userId))
      .order("desc");

    // Apply AND filters
    if (args.type) {
      q = q.filter(q => q.eq(q.field("type"), args.type));
    }
    if (args.category) {
      q = q.filter(q => q.eq(q.field("category"), args.category));
    }

    return await q.paginate(args.paginationOpts);
  },
});
```

**Step 2: Commit**
```bash
git add convex/transactions.ts
git commit -m "feat(convex): add getTransactions paginated query"
```

---

### Task 3: Create `EmptyTransactionState` Component

**Files:**
- Create: `src/components/transactions/empty-transaction-state.tsx`
- Modify: `src/components/transactions/index.ts`

**Step 1: Write the implementation**
```tsx
// src/components/transactions/empty-transaction-state.tsx

export function EmptyTransactionState() {
  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-12 flex flex-col items-center justify-center text-center">
      <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-secondary mb-4">
        <span className="material-symbols-outlined text-3xl">receipt_long</span>
      </div>
      <h3 className="font-h3 text-h3 text-on-surface mb-2">No transactions found</h3>
      <p className="font-body-base text-body-base text-secondary max-w-sm">
        You don't have any transactions matching these filters yet. Log a new transaction to get started.
      </p>
    </div>
  );
}
```

Update `index.ts` to export it.

**Step 2: Commit**
```bash
git add src/components/transactions/empty-transaction-state.tsx src/components/transactions/index.ts
git commit -m "feat(ui): add EmptyTransactionState component"
```

---

### Task 4: Create `TransactionRow` Component

**Files:**
- Create: `src/components/transactions/transaction-row.tsx`
- Modify: `src/components/transactions/index.ts`

**Step 1: Write the implementation**
We will implement an `ICON_MAP` lookup similar to `AddTransactionModal`.

```tsx
// src/components/transactions/transaction-row.tsx
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/constants/transactions";
import { Utensils, Bus, Wifi, Home, ShoppingBag, MoreHorizontal, Briefcase, Layout, Monitor } from "lucide-react";
import { Doc } from "@/convex/_generated/dataModel";

const ICON_MAP = {
  utensils: Utensils,
  bus: Bus,
  wifi: Wifi,
  home: Home,
  "shopping-bag": ShoppingBag,
  "more-horizontal": MoreHorizontal,
  briefcase: Briefcase,
  layout: Layout,
  monitor: Monitor,
} as const;

export function TransactionRow({ transaction }: { transaction: Doc<"transactions"> }) {
  const isIncome = transaction.type === "income";
  const allCategories = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];
  const categoryMeta = allCategories.find(c => c.value === transaction.category);
  const Icon = categoryMeta && ICON_MAP[categoryMeta.icon as keyof typeof ICON_MAP] 
    ? ICON_MAP[categoryMeta.icon as keyof typeof ICON_MAP] 
    : MoreHorizontal;

  const formatCurrency = (amount: number) => {
    const formatted = new Intl.NumberFormat("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
    return isIncome ? `+₱${formatted}` : `-₱${formatted}`;
  };

  return (
    <div className="flex items-center justify-between px-6 py-4 hover:bg-surface-container-low transition-colors group cursor-pointer border-b border-surface-container last:border-0">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isIncome ? 'bg-primary-fixed text-on-primary-fixed' : 'bg-tertiary-fixed text-on-tertiary-fixed'}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex flex-col">
          <span className="font-body-base text-body-base font-semibold text-on-surface">{transaction.title}</span>
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            {transaction.category} • {transaction.paymentMethod || "Cash"}
          </span>
        </div>
      </div>
      <span className={`font-currency text-currency ${isIncome ? 'text-primary' : 'text-error'}`}>
        {formatCurrency(transaction.amount)}
      </span>
    </div>
  );
}
```

Update `index.ts` to export it.

**Step 2: Commit**

---

### Task 5: Create `TransactionList` Component

**Files:**
- Create: `src/components/transactions/transaction-list.tsx`
- Modify: `src/components/transactions/index.ts`

**Step 1: Write the implementation**
```tsx
// src/components/transactions/transaction-list.tsx
"use client";
import { useState } from "react";
import { usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { EmptyTransactionState } from "./empty-transaction-state";
import { TransactionRow } from "./transaction-row";
import { groupByDate } from "@/lib/transactions";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/constants/transactions";

export function TransactionList() {
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("All Categories");

  const queryArgs: {
    type?: "income" | "expense";
    category?: string;
  } = {};
  if (typeFilter !== "all") queryArgs.type = typeFilter;
  if (categoryFilter !== "All Categories") queryArgs.category = categoryFilter;

  const { results, status, loadMore } = usePaginatedQuery(
    api.transactions.getTransactions,
    queryArgs,
    { initialNumItems: 10 }
  );

  const groupedTransactions = groupByDate(results);
  const allCategories = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];

  return (
    <div className="flex flex-col gap-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-sm">
        <div className="flex items-center gap-2">
          <button onClick={() => setTypeFilter("all")} className={`px-4 py-2 rounded-lg font-label-md transition-colors ${typeFilter === 'all' ? 'bg-surface-container-high text-on-surface' : 'text-on-surface-variant hover:bg-surface-container'}`}>All</button>
          <button onClick={() => setTypeFilter("income")} className={`px-4 py-2 rounded-lg font-label-md transition-colors ${typeFilter === 'income' ? 'bg-surface-container-high text-on-surface' : 'text-on-surface-variant hover:bg-surface-container'}`}>Income</button>
          <button onClick={() => setTypeFilter("expense")} className={`px-4 py-2 rounded-lg font-label-md transition-colors ${typeFilter === 'expense' ? 'bg-surface-container-high text-on-surface' : 'text-on-surface-variant hover:bg-surface-container'}`}>Expense</button>
        </div>
        <div className="relative">
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="appearance-none bg-surface border border-outline-variant text-on-surface font-body-sm rounded-lg pl-4 pr-10 py-2 focus:ring-2 focus:ring-primary outline-none cursor-pointer"
          >
            <option value="All Categories">All Categories</option>
            {allCategories.map(c => <option key={c.value} value={c.value}>{c.value}</option>)}
          </select>
          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-sm">expand_more</span>
        </div>
      </div>

      {/* List */}
      {status === "LoadingFirstPage" ? (
        <div className="p-8 text-center text-secondary">Loading...</div>
      ) : results.length === 0 ? (
        <EmptyTransactionState />
      ) : (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
          {groupedTransactions.map((group) => (
            <div key={group.date} className="border-b border-surface-container last:border-0">
              <div className="bg-surface-container-low px-6 py-2 border-b border-surface-container">
                <span className="font-label-md text-on-surface-variant">{group.dateLabel}</span>
              </div>
              <div className="flex flex-col">
                {group.transactions.map((tx) => (
                  <TransactionRow key={tx._id} transaction={tx} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load More */}
      {status === "CanLoadMore" && (
        <div className="flex justify-center mt-2">
          <button 
            onClick={() => loadMore(10)}
            className="border border-primary text-primary font-label-md px-6 py-3 rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span>
            Load more transactions
          </button>
        </div>
      )}
    </div>
  );
}
```

Update `index.ts` to export it.

**Step 2: Commit**

---

### Task 6: Inject `TransactionList` into Page

**Files:**
- Modify: `src/app/dashboard/transactions/page.tsx`

**Step 1: Write the implementation**
Remove the static mockups and inject `<TransactionList />` instead.

```tsx
// src/app/dashboard/transactions/page.tsx
"use client";

import { useUIStore } from "@/store/ui-store";
import { AddTransactionModal, TransactionList } from "@/components/transactions";

export default function TransactionsPage() {
  const setAddTransactionModalOpen = useUIStore((s) => s.setAddTransactionModalOpen);

  return (
    <div className="flex flex-col gap-12">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-h2 text-h2 text-on-surface">Transactions</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Manage and track your income and expenses.</p>
        </div>
        <button 
          onClick={() => setAddTransactionModalOpen(true)}
          className="bg-primary text-on-primary font-label-md text-label-md px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-primary-container transition-colors shadow-sm active:scale-95"
        >
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">add</span>
          Log Transaction
        </button>
      </div>

      <TransactionList />
      <AddTransactionModal />
    </div>
  );
}
```

**Step 2: Commit**
```bash
git add src/app/dashboard/transactions/page.tsx
git commit -m "feat(ui): connect TransactionList to transactions page"
```
