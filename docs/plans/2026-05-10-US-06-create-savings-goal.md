# US-06 Create Savings Goal Implementation Plan

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agent/workflows/execute-plan.md` to execute this plan in single-flow mode.

**Goal:** Enable users to create a savings goal with an optional initial deposit, and display their goals in a dynamic grid.

**Architecture:** 
Update the Convex schema to include the missing `completedAt` field. Add shared constants for goal icons. Create a pure utility for calculating goal progress percentage with tests. Implement the `createGoal` mutation (which inserts the goal and, if an initial deposit is provided, an accompanying "Savings" expense transaction to keep wallet balances accurate) and the `getGoals` query. Finally, build the `CreateGoalModal`, `GoalCard`, and `GoalGrid` UI components in `src/components/goals/` using React Hook Form and Zod for validation, and integrate them into the Savings Goals page.

**Tech Stack:** Next.js 16 (App Router), Convex, Zod, React Hook Form, Tailwind CSS, Lucide Icons, Vitest.

---

### Task 1: Update Schema

**Files:**
- Modify: `convex/schema.ts`

**Step 1: Write minimal implementation**

```typescript
// Add to goals table definition in convex/schema.ts
  completedAt: v.optional(v.string()), // ISO date string — set when isCompleted flips to true
```

**Step 2: Commit**

```bash
git add convex/schema.ts
git commit -m "feat: add completedAt to goals schema"
```

### Task 2: Update Transactions Constants

**Files:**
- Modify: `src/constants/transactions.ts`
- Modify: `src/components/transactions/add-transaction-modal.tsx`
- Modify: `src/components/transactions/transaction-row.tsx`

**Step 1: Write minimal implementation**

Update `EXPENSE_CATEGORIES` and `PAYMENT_METHODS` in `src/constants/transactions.ts`:
```typescript
export const EXPENSE_CATEGORIES = [
  { value: "Food & Dining",   label: "Food",     icon: "utensils" },
  { value: "Transportation",  label: "Transpo",  icon: "bus" },
  { value: "Load & Bills",    label: "Load",     icon: "wifi" },
  { value: "Rent",            label: "Rent",     icon: "home" },
  { value: "Shopping",        label: "Shopping", icon: "shopping-bag" },
  { value: "Savings",         label: "Savings",  icon: "piggy-bank" },
  { value: "Others",          label: "Others",   icon: "more-horizontal" },
] as const;

// ... INCOME_CATEGORIES ...

export const PAYMENT_METHODS = [
  "Cash",
  "Debit Card",
  "GCash",
  "Bank Transfer",
  "Main Savings",
  "Others",
] as const;
```

Update `ICON_MAP` and imports in both `src/components/transactions/add-transaction-modal.tsx` and `src/components/transactions/transaction-row.tsx`:
```typescript
import { Utensils, Bus, Wifi, Home, ShoppingBag, MoreHorizontal, Briefcase, Layout, Monitor, PiggyBank } from "lucide-react";

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
  "piggy-bank": PiggyBank,
} as const;
```

**Step 2: Commit**

```bash
git add src/constants/transactions.ts src/components/transactions/
git commit -m "feat: add Savings category and Main Savings payment method"
```

### Task 3: Create Goals Constants

**Files:**
- Create: `src/constants/goals.ts`

**Step 1: Write minimal implementation**

```typescript
import { Plane, Laptop, Home, Heart, Star, Gift } from "lucide-react";

export const GOAL_ICONS = [
  { value: "plane",   label: "Travel",    icon: "plane"   },
  { value: "laptop",  label: "Tech",      icon: "laptop"  },
  { value: "home",    label: "Home",      icon: "home"    },
  { value: "heart",   label: "Health",    icon: "heart"   },
  { value: "star",    label: "Personal",  icon: "star"    },
  { value: "gift",    label: "Gift",      icon: "gift"    },
] as const;

export const GOAL_ICON_MAP = {
  plane:  Plane,
  laptop: Laptop,
  home:   Home,
  heart:  Heart,
  star:   Star,
  gift:   Gift,
} as const;
```

**Step 2: Commit**

```bash
git add src/constants/goals.ts
git commit -m "feat: add goal icon constants"
```

### Task 4: Percentage Utility & Tests

**Files:**
- Create: `src/lib/goals.test.ts`
- Create: `src/lib/goals.ts`

**Step 1: Write the failing test**

```typescript
// src/lib/goals.test.ts
import { describe, it, expect } from "vitest";
import { calculateGoalProgress } from "./goals";

describe("calculateGoalProgress", () => {
  it("returns 0 when target amount is 0", () => {
    expect(calculateGoalProgress(100, 0)).toBe(0);
  });

  it("returns 0 when savedAmount is 0", () => {
    expect(calculateGoalProgress(0, 100000)).toBe(0);
  });

  it("returns correct percentage", () => {
    expect(calculateGoalProgress(75000, 100000)).toBe(75);
  });

  it("caps at 100 when saved amount exceeds target", () => {
    expect(calculateGoalProgress(110000, 100000)).toBe(100);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/goals.test.ts`
Expected: FAIL with module not found.

**Step 3: Write minimal implementation**

```typescript
// src/lib/goals.ts
export function calculateGoalProgress(savedAmount: number, targetAmount: number): number {
  if (targetAmount === 0) return 0;
  return Math.min(Math.round((savedAmount / targetAmount) * 100), 100);
}
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/goals.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/lib/goals.test.ts src/lib/goals.ts
git commit -m "feat: add calculateGoalProgress utility and tests"
```

### Task 5: Backend Mutation and Query

**Files:**
- Create: `convex/goals.ts`

**Step 1: Write minimal implementation**

```typescript
// convex/goals.ts
import { mutation, query } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getGoals = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    
    return await ctx.db
      .query("goals")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const createGoal = mutation({
  args: {
    name: v.string(),
    icon: v.string(),
    targetAmount: v.number(),
    initialDeposit: v.optional(v.number()),
    deadline: v.string(),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Not authenticated");

    if (args.targetAmount <= 0 || args.targetAmount > 9999999) {
      throw new ConvexError("Target amount must be between ₱1 and ₱9,999,999");
    }

    const initialDeposit = args.initialDeposit ?? 0;
    if (initialDeposit > args.targetAmount) {
      throw new ConvexError("Initial deposit cannot exceed target amount");
    }

    if (initialDeposit < 0) {
      throw new ConvexError("Initial deposit cannot be negative");
    }

    if (args.deadline < args.date) {
      throw new ConvexError("Deadline must be in the future");
    }

    const goalId = await ctx.db.insert("goals", {
      userId,
      name: args.name.trim(),
      icon: args.icon,
      targetAmount: args.targetAmount,
      savedAmount: initialDeposit,
      deadline: args.deadline,
      isCompleted: false,
    });

    if (initialDeposit > 0) {
      await ctx.db.insert("transactions", {
        userId,
        type: "expense",
        title: `Goal Deposit: ${args.name.trim()}`,
        amount: initialDeposit,
        category: "Savings",
        paymentMethod: "Main Savings",
        date: args.date,
      });
    }

    return goalId;
  },
});
```

**Step 2: Commit**

```bash
git add convex/goals.ts
git commit -m "feat: add getGoals query and createGoal mutation"
```

### Task 6: Zod Schema and Components

**Files:**
- Modify: `src/lib/validation.ts`
- Create: `src/components/goals/create-goal-modal.tsx`
- Create: `src/components/goals/goal-card.tsx`
- Create: `src/components/goals/goal-grid.tsx`
- Create: `src/components/goals/index.ts`
- Remove: `src/components/dashboard/create-goal-modal.tsx`

**Step 1: Write Zod schema**

Add to `src/lib/validation.ts`:
```typescript
export const createGoalSchema = z.object({
  name: z.string().min(1, "Goal name is required").max(40, "Goal name must be 40 characters or less"),
  icon: z.string().min(1, "Icon is required"),
  targetAmount: z.number().min(1, "Target amount must be greater than ₱0").max(9999999, "Target amount cannot exceed ₱9,999,999"),
  initialDeposit: z.number().min(0, "Initial deposit cannot be negative").optional(),
  deadline: z.string().min(1, "Target deadline is required"),
  date: z.string().min(1, "Date is required"),
}).refine((data) => {
  if (data.initialDeposit && data.initialDeposit > data.targetAmount) {
    return false;
  }
  return true;
}, {
  message: "Initial deposit cannot exceed target amount",
  path: ["initialDeposit"],
});

export type CreateGoalInput = z.infer<typeof createGoalSchema>;
```

**Step 2: Build Components**

1. `src/components/goals/goal-card.tsx`:
   - Implement `GoalCard` receiving a goal document.
   - Use `calculateGoalProgress`.
   - Format deadline using `Intl.DateTimeFormat`.
   - Render completed state or progress bar.

2. `src/components/goals/create-goal-modal.tsx`:
   - Delete `src/components/dashboard/create-goal-modal.tsx`.
   - Recreate in `src/components/goals/` using `react-hook-form` + `@hookform/resolvers/zod`.
   - Map `GOAL_ICONS` using Lucide components for the selection UI.
   - Set `icon` default to `GOAL_ICONS[0].value`.
   - `useMutation(api.goals.createGoal)` on form submit.

3. `src/components/goals/goal-grid.tsx`:
   - Use `useQuery(api.goals.getGoals)`.
   - Return empty state or grid of `GoalCard` components.

4. `src/components/goals/index.ts`:
   - Export `CreateGoalModal`, `GoalGrid`, and `GoalCard`.

**Step 3: Commit**

```bash
git rm src/components/dashboard/create-goal-modal.tsx
git add src/lib/validation.ts src/components/goals/
git commit -m "feat: build goal components and schemas"
```

### Task 7: Page Integration

**Files:**
- Modify: `src/app/dashboard/savings-goals/page.tsx`

**Step 1: Write minimal implementation**

Replace the static mockups in `src/app/dashboard/savings-goals/page.tsx` with `<GoalGrid />` and update imports to use the new `src/components/goals` barrel file.

**Step 2: Commit**

```bash
git add src/app/dashboard/savings-goals/page.tsx
git commit -m "feat: integrate goal components into savings goals page"
```
