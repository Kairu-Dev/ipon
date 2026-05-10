# US-03 Log an Expense Implementation Plan

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agent/workflows/execute-plan.md` to execute this plan in single-flow mode.

**Goal:** Implement the ability for users to log an expense via the "Add Transaction" modal.

**Architecture:** We will update the Convex schema with the new `transactions` table, create the necessary constants, and set up Zod validation. The backend will have an `addTransaction` mutation and a `suggestCategory` action (to securely call the Gemini API). The frontend modal will be moved to the correct feature directory and exported via a barrel file, updated to include missing fields (Title, Payment Method), and wired up to Convex and the UI store.

**Tech Stack:** Next.js 16 (App Router), Convex (DB/Backend), Convex Auth, Tailwind CSS, shadcn/ui, Zustand, Zod.

---

### Task 1: Update Schema & Constants

**Files:**
- Modify: `convex/schema.ts`
- Create: `src/constants/transactions.ts`

**Step 1: Define Constants**
Create `src/constants/transactions.ts` and define `EXPENSE_CATEGORIES`, `INCOME_CATEGORIES`, and `PAYMENT_METHODS` strictly as provided in the ticket. Add `as const` to all arrays.

**Step 2: Update Schema**
Modify `convex/schema.ts` to include the `transactions` table using `defineTable`. Ensure all fields match the ticket specifications and create the `by_user` and `by_user_and_date` indexes.

---

### Task 2: Validation Schema & Response Parser

**Files:**
- Modify: `src/lib/validation.ts`
- Create: `src/lib/gemini-parser.ts`

**Step 1: Add Transaction Validation Schema**
Append a new schema `transactionSchema` to `src/lib/validation.ts`. Ensure amount is > 0 and <= 999999.99, title is required, category and payment method are strings, and note has a max length of 150.

**Step 2: Add Gemini Response Parser**
Create a pure function `parseGeminiCategorySuggestion(response: string, type: "income" | "expense"): string | null` in `src/lib/gemini-parser.ts`. **Crucially**, it must validate the returned category against the `.value` field of `EXPENSE_CATEGORIES` or `INCOME_CATEGORIES` (e.g., "Food & Dining"), NOT the `.label` field.

---

### Task 3: Convex Backend Logic

**Files:**
- Create: `convex/transactions.ts`

**Step 1: Implement `addTransaction` Mutation**
Create the mutation. Use `getAuthUserId(ctx)` to ensure the user is authenticated. Validate the `amount` on the server-side to enforce limits. Insert the record into `transactions`.

**Step 2: Implement `suggestCategory` Action**
Create a Convex action that takes `note` and `type` as arguments. Call the Gemini API endpoint `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}` securely. Use the response parser to return a valid category or null. *Note: `GEMINI_API_KEY` must be set in the Convex dashboard environment variables.*

---

### Task 4: UI Updates & AddTransactionModal Form

**Files:**
- Move & Modify: `src/components/dashboard/add-transaction-modal.tsx` -> `src/components/transactions/add-transaction-modal.tsx`
- Create: `src/components/transactions/index.ts`
- Modify: `src/app/dashboard/transactions/page.tsx`

**Step 1: Relocate the Modal Component & Export via Barrel**
Move the modal to `src/components/transactions/add-transaction-modal.tsx`. Create the barrel file `src/components/transactions/index.ts` and export the modal. Update `src/app/dashboard/transactions/page.tsx` to import via `@/components/transactions`.

**Step 2: Update Modal Form Fields**
Add the missing `Title` text input and `Payment Method` selector to the UI. Ensure the Date picker cannot select future dates. Add character counter to the Note textarea. Both Title and Payment Method must be wired to the mutation.

**Step 3: Render Constants with Static Icon Map**
Create a static lookup map `ICON_MAP` in the component using explicit Lucide React imports (e.g., `import { Utensils, Bus, ... } from "lucide-react"; const ICON_MAP = { utensils: Utensils, bus: Bus, ... } as const;`). Render the category grid using `EXPENSE_CATEGORIES` and resolving the component via `ICON_MAP[category.icon]`.

**Step 4: State Management & Submission**
Install required packages (`npm install react-hook-form @hookform/resolvers`). Wire up form state strictly using **React Hook Form with zodResolver** to natively use the `transactionSchema`. Import the Convex API object (`import { api } from "@/convex/_generated/api";`) and use `useMutation(api.transactions.addTransaction)`. Ensure "Save Entry" button is disabled while submitting. Reset form on close/success.

**Step 5: AI Suggestion Integration**
Add `useAction(api.transactions.suggestCategory)`. Debounce the note input by 500ms and call the action. Display the AI chip if a suggestion is returned, and silently hide it on failure.

---

### Task 5: Automated Testing (Pending Approval)

*Note: Per ticket instructions, Playwright and Vitest tests will be generated after manual verification and explicit approval.*

**Step 1: Unit tests for constants and validation**
**Step 2: Unit tests for Gemini response parser**
**Step 3: Playwright E2E test for the modal submission flow**

---
