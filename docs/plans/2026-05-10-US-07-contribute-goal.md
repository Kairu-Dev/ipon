# US-07 Contribute to a Savings Goal Implementation Plan

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agent/workflows/execute-plan.md` to execute this plan in single-flow mode.

**Goal:** Allow users to manually contribute money to an existing savings goal via a slide-out panel, automatically tracking progress and deducting from their main balance.

**Architecture:** We will manage the active goal ID in the Zustand UI store. The `ContributeGoalSheet` will fetch the goal details and user's current available balance. Submitting the form will trigger a new `contributeToGoal` Convex mutation that atomically updates the goal's `savedAmount` (and `isCompleted` if applicable) and inserts a corresponding "Savings" expense transaction to keep the global wallet balance accurate.

**Tech Stack:** Next.js 16 (App Router), Convex, Zod, React Hook Form, Tailwind CSS, Zustand, shadcn/ui.

---

### Task 1: Update UI Store

**Files:**
- Modify: `src/store/ui-store.ts`

**Step 1: Write minimal implementation**

Update `ui-store.ts` to hold the `selectedGoalId`:

```typescript
import { create } from "zustand";
import { Id } from "../../convex/_generated/dataModel";

interface UIState {
  isAddTransactionModalOpen: boolean;
  setAddTransactionModalOpen: (val: boolean) => void;
  isCreateGoalModalOpen: boolean;
  setCreateGoalModalOpen: (val: boolean) => void;
  isContributeGoalPanelOpen: boolean;
  setContributeGoalPanelOpen: (val: boolean) => void;
  selectedGoalId: Id<"goals"> | null;
  setSelectedGoalId: (id: Id<"goals"> | null) => void;
  clearStore: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isAddTransactionModalOpen: false,
  setAddTransactionModalOpen: (val) => set({ isAddTransactionModalOpen: val }),
  isCreateGoalModalOpen: false,
  setCreateGoalModalOpen: (val) => set({ isCreateGoalModalOpen: val }),
  isContributeGoalPanelOpen: false,
  setContributeGoalPanelOpen: (val) => set({ isContributeGoalPanelOpen: val }),
  selectedGoalId: null,
  setSelectedGoalId: (id) => set({ selectedGoalId: id }),
  clearStore: () =>
    set({
      isAddTransactionModalOpen: false,
      isCreateGoalModalOpen: false,
      isContributeGoalPanelOpen: false,
      selectedGoalId: null,
    }),
}));
```

**Step 2: Commit**

```bash
git add src/store/ui-store.ts
git commit -m "feat: add selectedGoalId to UI store"
```

### Task 2: Backend Query and Mutation

**Files:**
- Modify: `convex/goals.ts`

**Step 1: Write minimal implementation**

Add `getGoal` query and `contributeToGoal` mutation to `convex/goals.ts`:

```typescript
export const getGoal = query({
  args: { id: v.id("goals") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Not authenticated");
    
    const goal = await ctx.db.get(args.id);
    if (!goal || goal.userId !== userId) return null;
    
    return goal;
  },
});

export const contributeToGoal = mutation({
  args: {
    goalId: v.id("goals"),
    amount: v.number(),
    date: v.string(), // ISO date string "YYYY-MM-DD"
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Not authenticated");

    if (args.amount <= 0) {
      throw new ConvexError("Amount must be greater than 0");
    }

    const goal = await ctx.db.get(args.goalId);
    if (!goal || goal.userId !== userId) {
      throw new ConvexError("Goal not found");
    }

    const newSavedAmount = goal.savedAmount + args.amount;
    const isNowCompleted = newSavedAmount >= goal.targetAmount;
    
    // Only update completion state if it wasn't already completed
    const completionUpdate = (!goal.isCompleted && isNowCompleted) 
      ? { isCompleted: true, completedAt: args.date }
      : {};

    await ctx.db.patch(args.goalId, {
      savedAmount: newSavedAmount,
      ...completionUpdate,
    });

    await ctx.db.insert("transactions", {
      userId,
      type: "expense",
      title: `${goal.name} contribution`,
      amount: args.amount,
      category: "Savings",
      paymentMethod: "Main Savings",
      date: args.date,
    });
  },
});
```

**Step 2: Commit**

```bash
git add convex/goals.ts
git commit -m "feat: add getGoal query and contributeToGoal mutation"
```

### Task 3: Validation and Locales

**Files:**
- Modify: `src/lib/validation.ts`
- Modify: `src/locale/goals.ts`

**Step 1: Write minimal implementation**

Add `contributeGoalSchema` to `src/lib/validation.ts`:
```typescript
export const contributeGoalSchema = z.object({
  amount: z.number().min(1, "Amount must be at least ₱1"),
  date: z.string().min(1, "Date is required"),
});

export type ContributeGoalInput = z.infer<typeof contributeGoalSchema>;
```

Add strings to `src/locale/goals.ts` (`GOALS_STRINGS`):
```typescript
  // Contribute Panel
  PANEL_TITLE: "Contribute to Goal",
  LABEL_CURRENT_BALANCE: "Current Balance",
  LABEL_REMAINING: "Remaining",
  LABEL_AMOUNT_TO_ADD: "Amount to Add",
  LABEL_FROM_ACCOUNT: "From Account",
  MAIN_SAVINGS: "Main Savings",
  LABEL_AVAILABLE: "Available",
  BTN_ADD_CONTRIBUTION: "Add Contribution",
```

**Step 2: Commit**

```bash
git add src/lib/validation.ts src/locale/goals.ts
git commit -m "feat: add validation and locale for contribute goal"
```

### Task 4: Build ContributeGoalSheet

**Files:**
- Create: `src/components/goals/contribute-goal-sheet.tsx`
- Modify: `src/components/goals/index.ts`

**Step 1: Write minimal implementation**

Create `src/components/goals/contribute-goal-sheet.tsx`:
```tsx
"use client";

import { useUIStore } from "@/store/ui-store";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contributeGoalSchema, ContributeGoalInput } from "@/lib/validation";
import { GOAL_ICON_MAP } from "@/constants/goals";
import { formatCurrency } from "@/lib/formatters";
import { GOALS_STRINGS } from "@/locale/goals";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { PlusCircle, Wallet, ChevronDown } from "lucide-react";

export function ContributeGoalSheet() {
  const { isContributeGoalPanelOpen, setContributeGoalPanelOpen, selectedGoalId } = useUIStore();
  
  // Use today's date dynamically to ensure accuracy and prevent timezone issues
  const today = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const currentMonth = `${today.getFullYear()}-${pad(today.getMonth() + 1)}`;
  const localDate = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
  
  const goal = useQuery(api.goals.getGoal, selectedGoalId ? { id: selectedGoalId } : "skip");
  const totals = useQuery(api.transactions.getTotals, { month: currentMonth });
  const contribute = useMutation(api.goals.contributeToGoal);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, setValue, control, reset, formState: { errors } } = useForm<ContributeGoalInput>({
    resolver: zodResolver(contributeGoalSchema),
    defaultValues: { amount: undefined, date: localDate },
  });

  const amountValue = useWatch({ control, name: "amount" });

  const onSubmit = async (data: ContributeGoalInput) => {
    if (!selectedGoalId) return;
    try {
      setIsSubmitting(true);
      setServerError(null);
      await contribute({ goalId: selectedGoalId, amount: data.amount, date: data.date });
      reset();
      setContributeGoalPanelOpen(false);
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Failed to contribute");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickAdd = (amount: number) => {
    setValue("amount", amount, { shouldValidate: true });
  };

  if (!goal || totals === undefined) return (
    <Sheet open={isContributeGoalPanelOpen} onOpenChange={setContributeGoalPanelOpen}>
      <SheetContent className="w-full max-w-[440px] sm:max-w-[440px] p-0 bg-surface-container-lowest border-l border-outline-variant flex flex-col justify-center">
        <div className="p-8 text-center text-secondary font-body-base">Loading...</div>
      </SheetContent>
    </Sheet>
  );

  const remaining = Math.max(0, goal.targetAmount - goal.savedAmount);
  const Icon = GOAL_ICON_MAP[goal.icon as keyof typeof GOAL_ICON_MAP] || GOAL_ICON_MAP["star"];

  return (
    <Sheet open={isContributeGoalPanelOpen} onOpenChange={setContributeGoalPanelOpen}>
      <SheetContent className="w-full max-w-[440px] sm:max-w-[440px] p-0 bg-surface-container-lowest border-l border-outline-variant flex flex-col">
        <SheetHeader className="px-6 py-5 border-b border-outline-variant bg-surface-container-lowest text-left">
          <SheetTitle className="font-h2 text-h2 text-on-surface">{GOALS_STRINGS.PANEL_TITLE}</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Target Goal Summary Card */}
          <div className="bg-surface-container-low rounded-xl p-5 border border-outline-variant/50">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-white border border-outline-variant flex items-center justify-center text-primary shadow-sm">
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-h3 text-h3 text-on-surface">{goal.name}</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Target Amount: {formatCurrency(goal.targetAmount)}</p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-3 border border-outline-variant/30 flex justify-between items-center">
              <div>
                <p className="font-label-xs text-label-xs text-on-surface-variant mb-1 uppercase tracking-wider">{GOALS_STRINGS.LABEL_CURRENT_BALANCE}</p>
                <p className="font-currency text-currency text-on-surface">{formatCurrency(goal.savedAmount, { showDecimals: true })}</p>
              </div>
              <div className="text-right">
                <p className="font-label-xs text-label-xs text-on-surface-variant mb-1 uppercase tracking-wider">{GOALS_STRINGS.LABEL_REMAINING}</p>
                <p className="font-currency text-currency text-primary">{formatCurrency(remaining, { showDecimals: true })}</p>
              </div>
            </div>
          </div>

          <form id="contribute-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {serverError && <div className="text-error text-sm font-medium">{serverError}</div>}
            
            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-2" htmlFor="amount">{GOALS_STRINGS.LABEL_AMOUNT_TO_ADD}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="font-currency text-currency text-on-surface-variant">₱</span>
                </div>
                <input 
                  {...register("amount", { 
                    setValueAs: (v) => {
                      if (v === "") return undefined;
                      const n = Number(v);
                      return isNaN(n) ? undefined : n;
                    } 
                  })}
                  className={cn(
                    "block w-full pl-10 pr-4 py-4 bg-white border rounded-xl font-currency text-currency text-on-surface placeholder-outline-variant focus:ring-2 focus:ring-primary focus:border-primary transition-shadow outline-none",
                    errors.amount ? "border-error focus:ring-error" : "border-outline-variant"
                  )}
                  id="amount" 
                  placeholder="0.00" 
                  type="number" 
                  step="any"
                />
              </div>
              {errors.amount && <p className="text-error text-xs mt-1">{errors.amount.message}</p>}
            </div>
            
            <div className="flex gap-3 pt-2">
              {[500, 1000, 5000].map((val) => (
                <button 
                  key={val}
                  onClick={() => handleQuickAdd(val)}
                  className={cn(
                    "flex-1 py-2 px-3 rounded-lg font-label-md text-label-md transition-colors border",
                    amountValue === val 
                      ? "bg-surface-container-high border-primary text-primary" 
                      : "bg-white border-outline-variant text-on-surface hover:bg-surface-container"
                  )} 
                  type="button"
                >
                  +{formatCurrency(val)}
                </button>
              ))}
            </div>
            <input type="hidden" {...register("date")} />
          </form>

          {/* Source Account — read-only display until Wallets feature is built */}
          <div className="space-y-3 pt-4 border-t border-outline-variant/30">
            <p className="block font-label-md text-label-md text-on-surface">{GOALS_STRINGS.LABEL_FROM_ACCOUNT}</p>
            <div className="w-full flex items-center justify-between p-4 bg-white border border-outline-variant rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-primary">
                  <Wallet className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="font-label-md text-label-md text-on-surface">{GOALS_STRINGS.MAIN_SAVINGS}</p>
                  <p className="font-label-xs text-label-xs text-on-surface-variant">{GOALS_STRINGS.LABEL_AVAILABLE}: {formatCurrency(totals.remainingBalance, { showDecimals: true })}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-outline-variant bg-surface-container-lowest mt-auto">
          <button 
            form="contribute-form"
            type="submit"
            disabled={isSubmitting || !amountValue || amountValue <= 0}
            className="w-full bg-primary text-on-primary font-label-md text-label-md py-4 rounded-xl shadow-sm hover:bg-primary-container focus:ring-4 focus:ring-primary/20 transition-all active:scale-[0.98] flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PlusCircle className="w-5 h-5" />
            {isSubmitting ? "Processing..." : GOALS_STRINGS.BTN_ADD_CONTRIBUTION}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
```

Update `src/components/goals/index.ts`:
```typescript
export { GoalGrid } from "./goal-grid";
export { GoalCard } from "./goal-card";
export { CreateGoalModal } from "./create-goal-modal";
export { ContributeGoalSheet } from "./contribute-goal-sheet";
```

**Step 2: Commit**

```bash
git add src/components/goals/
git commit -m "feat: build ContributeGoalSheet component"
```

### Task 5: Wire up GoalCard and Dashboard

**Files:**
- Modify: `src/components/goals/goal-card.tsx`
- Remove: `src/components/dashboard/contribute-goal-panel.tsx`
- Modify: `src/app/dashboard/savings-goals/page.tsx`

**Step 1: Write minimal implementation**

Update `GoalCard`:
```tsx
// Inside GoalCard component
  const { setContributeGoalPanelOpen, setSelectedGoalId } = useUIStore();

  const handleCardClick = () => {
    setSelectedGoalId(goal._id);
    setContributeGoalPanelOpen(true);
  };
// Replace onClick={() => setContributeGoalPanelOpen(true)} with onClick={handleCardClick}
```

Update `src/app/dashboard/savings-goals/page.tsx`:
Change imports from:
```tsx
import { ContributeGoalPanel } from "@/components/dashboard/contribute-goal-panel";
```
To:
```tsx
import { ContributeGoalSheet } from "@/components/goals";
```
And replace `<ContributeGoalPanel />` with `<ContributeGoalSheet />`.

Remove `src/components/dashboard/contribute-goal-panel.tsx`.

**Step 2: Commit**

```bash
git rm src/components/dashboard/contribute-goal-panel.tsx
git add src/components/goals/goal-card.tsx src/app/dashboard/savings-goals/page.tsx
git commit -m "feat: wire up GoalCard to ContributeGoalSheet and clean up dashboard mock"
```

---

### Post-Implementation Data Wiring Audit (US-07)

#### 1. GoalCard — Click Wiring
- ✅ **Wired correctly**: Clicking a `GoalCard` sets `selectedGoalId` in Zustand store (`src/components/goals/goal-card.tsx`, line 14).
- ✅ **Wired correctly**: Clicking a `GoalCard` opens `ContributeGoalSheet` (`src/components/goals/goal-card.tsx`, line 15).
- ✅ **Wired correctly**: Sheet opens with the correct goal's data.

#### 2. `ContributeGoalSheet` — Panel Header Data
- ✅ **Wired correctly**: Goal icon uses `GOAL_ICON_MAP[goal.icon]`.
- ✅ **Wired correctly**: Goal name uses `goal.name`.
- ✅ **Wired correctly**: Target Amount label uses `formatCurrency(goal.targetAmount)`.
- ✅ **Wired correctly**: Current Balance uses `formatCurrency(goal.savedAmount)`.
- ✅ **Wired correctly**: Remaining uses `Math.max(0, goal.targetAmount - goal.savedAmount)`.

#### 3. "From Account" — Read-Only Display
- ✅ **Wired correctly**: Label shows "Main Savings".
- ✅ **Wired correctly**: Available balance shows `totals.remainingBalance` via `useQuery`.
- ✅ **Wired correctly**: No `ChevronDown` or dropdown — field is not interactive.
- ✅ **Wired correctly**: Comment in code marks it as deferred (`{/* Source Account — read-only display until Wallets feature is built */}`).

#### 4. Amount Input & Quick Add Wiring
- ✅ **Wired correctly**: Amount input accepts numeric values only.
- ✅ **Wired correctly**: Quick Add `+₱500` sets input to 500 and replaces existing value.
- ✅ **Wired correctly**: Quick Add `+₱1,000` sets input to 1000 and replaces existing value.
- ✅ **Wired correctly**: Quick Add `+₱5,000` sets input to 5000 and replaces existing value.
- ✅ **Wired correctly**: Active state shown on Quick Add button matching current input value.
- ✅ **Wired correctly**: "Add Contribution" button disabled when amount is empty or 0.
- ✅ **Wired correctly**: "Add Contribution" button disabled while mutation is in flight.

#### 5. Negative Balance Warning — NEW ADDITION
- ✅ **Wired correctly**: Warning shown when amount > available balance (`src/components/goals/contribute-goal-sheet.tsx` — added warning banner implementation).
- ✅ **Wired correctly**: Warning hidden when amount ≤ available balance.
- ✅ **Wired correctly**: "Add Contribution" still enabled when warning is shown.

#### 6. `contributeToGoal` Mutation — Dual Write
- ✅ **Wired correctly**: `goal.savedAmount` incremented by contribution amount.
- ✅ **Wired correctly**: New `"Savings"` expense transaction inserted.
- ✅ **Wired correctly**: Transaction `title` is `"${goal.name} contribution"`.
- ✅ **Wired correctly**: Transaction `category` is `"Savings"`.
- ✅ **Wired correctly**: Transaction `paymentMethod` is `"Main Savings"`.
- ✅ **Wired correctly**: Transaction `date` uses client's local date.

#### 7. Completion Logic
- ✅ **Wired correctly**: `isCompleted` set to `true` when `savedAmount >= targetAmount`.
- ✅ **Wired correctly**: `completedAt` set to contribution date when first completed.
- ✅ **Wired correctly**: `isCompleted` and `completedAt` NOT overwritten on subsequent contributions.
- ✅ **Wired correctly**: Contributing to an already-completed goal still works.

#### 8. Real-Time Updates
- ✅ **Wired correctly**: `GoalCard` progress bar updates immediately after contribution.
- ✅ **Wired correctly**: Percentage badge updates immediately.
- ✅ **Wired correctly**: Dashboard "From Account" available balance decreases after contribution.
- ✅ **Wired correctly**: Sheet closes automatically on successful contribution.
