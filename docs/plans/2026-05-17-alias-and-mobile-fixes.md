# Codebase Cleanup and Chat Mobile Fixes Implementation Plan

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agent/workflows/execute-plan.md` to execute this plan in single-flow mode.

**Goal:** Clean up relative imports using tsconfig aliases and fix mobile responsiveness for the Chat page context panels and capabilities modal.

**Architecture:** We will introduce a `@convex/*` alias in `tsconfig.json` to eliminate deep relative imports (`../../../convex`). We will also use standard `@/` aliases for imports from `convex/` into `src/`. For mobile responsiveness, we will add overflow scrolling to the capabilities modal and introduce a mobile header with a `Sheet` to display the Monthly Context.

**Tech Stack:** Next.js 16, Tailwind CSS, TypeScript, Shadcn UI

---

### Task 1: Update TypeScript Aliases

**Files:**
- Modify: `tsconfig.json:22-25`

**Step 1: Write minimal implementation**

Update `tsconfig.json` to add the `@convex/*` alias alongside the existing `@/*` alias:
```json
    "paths": {
      "@/*": ["./src/*"],
      "@convex/*": ["./convex/*"]
    }
```

**Step 2: Commit**
```bash
git add tsconfig.json
git commit -m "chore: add @convex alias to tsconfig"
```

---

### Task 2: Refactor Imports to Use Aliases

**Files:**
- Modify: All files in `src/` containing relative imports to `convex/`
- Modify: All files in `convex/` containing relative imports to `src/`

**Step 1: Write minimal implementation**

Replace relative imports pointing to `convex` from `src`:
- Replace `from "../../../convex/_generated/api"` with `from "@convex/_generated/api"`
- Replace `from "../../../../convex/_generated/api"` with `from "@convex/_generated/api"`
- Replace `from "../../convex/_generated/dataModel"` with `from "@convex/_generated/dataModel"`
- Replace `from "../../../convex/_generated/dataModel"` with `from "@convex/_generated/dataModel"`

Replace relative imports pointing to `src` from `convex`:
- In `convex/transactions.ts`: 
  - Change `from "../src/lib/gemini-parser"` to `from "@/lib/gemini-parser"`
  - Change `from "../src/constants/transactions"` to `from "@/constants/transactions"`
- In `convex/chat.ts`:
  - Change `from "../src/constants/transactions"` to `from "@/constants/transactions"`

**Step 2: Run test to verify it passes**
Run: `npm run build`
Expected: Build passes with no import errors.

**Step 3: Commit**
```bash
git commit -am "refactor: replace relative imports with aliases"
```

---

### Task 3: Fix Ipon AI Capabilities Modal Mobile Responsiveness

**Files:**
- Modify: `src/components/chat/chat-input.tsx:63-75`

**Step 1: Write minimal implementation**

Add `max-h-[60vh] overflow-y-auto pr-2` to the grid container holding the capabilities to allow scrolling on small devices.

```tsx
<div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
  {capabilities.map((item, i) => (
    // ... existing content
  ))}
</div>
```

**Step 2: Commit**
```bash
git add src/components/chat/chat-input.tsx
git commit -m "fix: make ai capabilities modal scrollable on mobile"
```

---

### Task 4: Make Monthly Context Accessible on Mobile

**Files:**
- Modify: `src/components/chat/monthly-chat-context.tsx:26-55`
- Modify: `src/app/dashboard/chat/page.tsx`

**Step 1: Write minimal implementation**

In `src/components/chat/monthly-chat-context.tsx`, remove the hardcoded wrappers that hide it on mobile.
Change the root `div` from `<div className="right-panel hidden lg:block">` to just `<div className="space-y-8">`.
Change the loading state root `div` from `<div className="right-panel">` to `<div className="space-y-8 animate-pulse">`.

In `src/app/dashboard/chat/page.tsx`, we need to import `Sheet`, `SheetContent`, and `SheetTrigger` from `@/components/ui/sheet`.

Add a mobile header to the top of the chat area (inside the `left-panel` div):
```tsx
        {/* Mobile Header (Chat Page Only) */}
        <div className="lg:hidden flex justify-between items-center px-6 pt-2 pb-4">
          <h1 className="font-h3 text-h3 text-on-surface">Ipon AI</h1>
          <Sheet>
            <SheetTrigger asChild>
              <button className="text-on-surface-variant hover:text-primary transition-colors p-2 hover:bg-primary/5 rounded-full" aria-label="View Monthly Context">
                <span className="material-symbols-outlined text-xl" aria-hidden="true">analytics</span>
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-[400px] overflow-y-auto pt-10">
              <MonthlyChatContext currentMonth={currentMonth} />
            </SheetContent>
          </Sheet>
        </div>
```

Wrap the desktop `MonthlyChatContext` at the bottom of the file to preserve the desktop layout:
```tsx
      {/* Right: Monthly Context Panel (Desktop) */}
      <div className="right-panel hidden lg:block p-6">
        <MonthlyChatContext currentMonth={currentMonth} />
      </div>
```

**Step 2: Run test to verify it passes**
Run: `npm run build`
Expected: Build passes.

**Step 3: Commit**
```bash
git add src/components/chat/monthly-chat-context.tsx src/app/dashboard/chat/page.tsx
git commit -m "feat: add mobile sheet for monthly context in chat"
```
