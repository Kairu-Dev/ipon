# Payment Method Selector & Mobile Context Fix

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agent/workflows/execute-plan.md` to execute this plan in single-flow mode.

**Goal:** Replace the AI's "ask for payment method" prompt with a user-selectable payment method on the confirmation card, and fix the Monthly Context sheet overflow on small mobile screens (iPhone SE+).

**Architecture:** The confirmation card already has a pattern for selectable UI (icon selector for goals). We will follow the same pattern to add a payment method selector for `addTransaction` actions. The system prompt in `convex/chat.ts` will be updated to default to "Cash" instead of asking. The Monthly Context component will get tighter padding and responsive text for small screens.

**Tech Stack:** Next.js 16, Tailwind CSS, TypeScript, Convex

---

### Task 1: Update System Prompt — Stop Asking for Payment Method

**Files:**
- Modify: `convex/chat.ts:265,272`

**Step 1: Write minimal implementation**

In `convex/chat.ts`, update two lines in the system prompt:

Line 265 — change:
```
- addTransaction → ONLY for logging actual spending or income. ALWAYS ask for the payment method if unknown.
```
to:
```
- addTransaction → ONLY for logging actual spending or income. If the user doesn't specify a payment method, default to "Cash". Do NOT ask.
```

Line 272 — change:
```
- PAYMENT METHOD: If the user doesn't specify how they paid, ASK THEM: "What payment method did you use? (e.g. Cash, GCash, Bank Transfer)". Do NOT assume. If you must use a default, use "Cash" and nothing else.
```
to:
```
- PAYMENT METHOD: If the user specifies a payment method, use it. If they don't, default to "Cash". Do NOT ask — the user can change it on the confirmation card before confirming.
```

**Step 2: Verify**
Run: `npm run lint`

---

### Task 2: Add Payment Method Selector to Confirmation Card

**Files:**
- Modify: `src/components/chat/action-confirmation-card.tsx`

**Step 1: Write minimal implementation**

Import `PAYMENT_METHODS` from `@/constants/transactions`.

Add a `selectedPaymentMethod` state initialized from `action.params.paymentMethod || "Cash"`.

After the action details `<ul>` and before the icon selector block, add a new payment method selector block that renders **only when `action.actionType === "addTransaction"`**:

```tsx
{/* Payment Method Selector (only for addTransaction) */}
{action.actionType === "addTransaction" && (
  <div className="mb-4 bg-surface-container-low p-3 rounded-xl border border-surface-variant">
    <p className="text-xs font-label-md text-on-surface-variant mb-2">Payment Method</p>
    <div className="flex flex-wrap gap-2">
      {PAYMENT_METHODS.map((method) => (
        <button
          key={method}
          onClick={() => setSelectedPaymentMethod(method)}
          className={`px-3 py-1.5 rounded-lg text-xs font-label-md transition-colors ${
            selectedPaymentMethod === method
              ? "bg-primary text-on-primary"
              : "bg-surface text-on-surface-variant hover:bg-surface-variant"
          }`}
          aria-label={`Select ${method}`}
        >
          {method}
        </button>
      ))}
    </div>
  </div>
)}
```

Update the `onConfirm` call in the "Yes, do it" button handler to include `paymentMethod: selectedPaymentMethod` when the action is `addTransaction`:

```tsx
onClick={() => {
  if (action.actionType === "createGoal" || (action.actionType === "setBudgetLimit" && action.params.isNew === true)) {
    onConfirm({ icon: selectedIcon });
  } else if (action.actionType === "addTransaction") {
    onConfirm({ paymentMethod: selectedPaymentMethod });
  } else {
    onConfirm();
  }
}}
```

Also update the `getDetails` for `addTransaction` to show the selected payment method dynamically. This requires the component to re-render the details with the current state. The simplest approach: change the detail line to use a placeholder that will be visually overridden by the selector, OR remove `paymentMethod` from the detail string since the selector is now visible. We'll keep the details simple:

```tsx
addTransaction: {
    title: "Log this transaction?",
    icon: "receipt_long",
    getDetails: (p) => [
      (p.title as string) || "Untitled",
      `${safeAmount(p.amount)} · ${p.category || "—"}`,
      `Date: ${p.date || "Today"}`,
    ],
  },
```

Remove `· ${p.paymentMethod || "Cash"}` from the detail string since it's now shown in the selector.

**Step 2: Verify**
Run: `npm run build`

---

### Task 3: Fix Monthly Context Sheet for Small Mobile Screens

**Files:**
- Modify: `src/components/chat/monthly-chat-context.tsx`
- Modify: `src/app/dashboard/chat/page.tsx`

**Step 1: Write minimal implementation**

In `monthly-chat-context.tsx`:

1. Change the outer wrapper padding from `p-6` to `p-4 sm:p-6` for tighter padding on small screens.
2. Change `font-currency text-currency` on the income/expense values to add responsive sizing: wrap them in a class that uses `text-[16px] sm:text-currency` so on very small screens the peso amounts don't overflow.
3. On the Recent transactions section, add `min-w-0` to the text container and `truncate` to the transaction title to prevent text overflow:
```tsx
<div className="min-w-0">
  <p className="font-label-md text-label-md text-on-surface truncate">{tx.title || tx.category}</p>
  <p className="font-label-xs text-label-xs text-on-surface-variant">{tx.date}</p>
</div>
```
4. On the amount text in recent transactions, add `shrink-0 text-right` to prevent wrapping:
```tsx
<p className={`font-body-sm text-body-sm font-medium shrink-0 text-right ${isIncome ? 'text-primary' : 'text-on-surface'}`}>
```

In `src/app/dashboard/chat/page.tsx`:

Update the `SheetContent` className to use `w-[85vw] sm:w-[400px]` instead of `w-full sm:w-[400px]` so on iPhone SE it doesn't completely cover the screen:
```tsx
<SheetContent side="right" className="w-[85vw] sm:w-[400px] overflow-y-auto pt-10">
```

**Step 2: Verify**
Run: `npm run build`
