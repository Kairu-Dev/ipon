# US-12 AI Chat Interface Implementation Plan

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agent/workflows/execute-plan.md` to execute this plan in single-flow mode.

**Goal:** Build a chat interface where users can ask financial questions and the AI can automatically log transactions or contribute to goals using agentic function calling.

**Architecture:** A Next.js App Router page for the chat UI with local state for pending AI actions. Convex backend handles storing messages and provides a Convex `action` to communicate with the Gemini API using the existing `askGemini` wrapper. The action uses `ctx.runQuery` to fetch context and `ctx.runMutation` to save chat history. A cron job deletes messages older than 7 days using a dedicated index.

**Tech Stack:** Next.js 16, Tailwind CSS, shadcn/ui, Convex (Queries, Mutations, Actions, Crons), Gemini API.

---

### Task 1: Update Schema and Add Environment Variables

**Files:**
- Modify: `convex/schema.ts`

**Step 1: Write minimal implementation**
```ts
// In convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
// ... existing imports

export default defineSchema({
  // ... existing tables
  chatMessages: defineTable({
    userId: v.id("users"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    createdAt: v.string(), // ISO datetime
  })
    .index("by_user", ["userId"])
    .index("by_created_at", ["createdAt"]), // for cron cleanup
});
```

**Step 2: Commit**
```bash
git add convex/schema.ts
git commit -m "feat(schema): add chatMessages table with indexes"
```

---

### Task 2: Create Internal Queries and Mutations for Chat Action

**Files:**
- Create: `convex/chat.ts`

**Step 1: Write minimal implementation**
We need internal queries for the action to fetch context, and internal mutations to save messages.
```ts
import { internalQuery, internalMutation, query, mutation, action } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { internal, api } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";

// Public query for UI
export const getChatHistory = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    
    return await ctx.db
      .query("chatMessages")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("asc")
      .collect();
  },
});

// Internal query to gather context for the AI
export const getContextForAI = internalQuery({
  args: { month: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Not authenticated");
    
    // Fetch real data
    const [transactions, budgets, goals] = await Promise.all([
      ctx.db
        .query("transactions")
        .withIndex("by_user_and_date", (q) =>
          q.eq("userId", userId)
           .gte("date", `${args.month}-01`)
           .lte("date", `${args.month}-31`)
        )
        .collect(),
      ctx.db
        .query("budgets")
        .withIndex("by_user_and_month", (q) =>
          q.eq("userId", userId).eq("month", args.month)
        )
        .collect(),
      ctx.db
        .query("goals")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect(),
    ]);

    // Compute totals
    let totalIncome = 0;
    let totalExpenses = 0;
    for (const tx of transactions) {
      if (tx.type === "income") totalIncome += tx.amount;
      if (tx.type === "expense" && tx.category !== "Savings") totalExpenses += tx.amount;
    }

    return {
      totals: { totalIncome, totalExpenses, remainingBalance: totalIncome - totalExpenses },
      budgets: budgets.map(b => ({ category: b.category, limit: b.monthlyLimit })),
      goals: goals.map(g => ({ _id: g._id, name: g.name, target: g.targetAmount, saved: g.savedAmount }))
    };
  }
});

// Internal mutation to save a message
export const saveMessage = internalMutation({
  args: {
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string()
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Not authenticated");
    
    return await ctx.db.insert("chatMessages", {
      userId,
      role: args.role,
      content: args.content,
      createdAt: new Date().toISOString()
    });
  }
});
```

**Step 2: Commit**
```bash
git add convex/chat.ts
git commit -m "feat(chat): internal queries and mutations for chat"
```

---

### Task 3: Implement sendMessage Action using askGemini

**Files:**
- Modify: `convex/lib/gemini.ts` (if tools support missing)
- Modify: `convex/chat.ts`

**Step 1: Write minimal implementation**
Ensure `askGemini` supports passing `tools`. Then use it in `sendMessage`:
```ts
// Add to convex/chat.ts
import { askGemini } from "./lib/gemini"; // Existing wrapper

export const sendMessage = action({
  args: { userMessage: v.string(), month: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Not authenticated");
    if (args.userMessage.trim().length === 0 || args.userMessage.length > 300) {
      throw new ConvexError("Invalid message length");
    }

    // 1. Fetch real context
    const contextData = await ctx.runQuery(internal.chat.getContextForAI, { month: args.month });
    
    // 2. Fetch history
    const history = await ctx.runQuery(api.chat.getChatHistory);
    
    // 3. Define Tools
    const tools = [{
      functionDeclarations: [
        {
          name: "addTransaction",
          description: "Log an income or expense transaction",
          parameters: {
            type: "object",
            properties: {
              title: { type: "string" },
              amount: { type: "number" },
              type: { type: "string", enum: ["income", "expense"] },
              category: { type: "string" },
              paymentMethod: { type: "string" },
              date: { type: "string" },
              note: { type: "string" },
            },
            required: ["title", "amount", "type", "category", "paymentMethod", "date"],
          },
        },
        {
          name: "contributeToGoal",
          description: "Add money to a savings goal",
          parameters: {
            type: "object",
            properties: {
              goalId: { type: "string" },
              goalName: { type: "string" },
              amount: { type: "number" },
            },
            required: ["goalId", "goalName", "amount"],
          },
        }
      ]
    }];

    const systemPrompt = `You are Ipon, a personal budgeting assistant... 
Totals: ${JSON.stringify(contextData.totals)}
Budgets: ${JSON.stringify(contextData.budgets)}
Goals: ${JSON.stringify(contextData.goals)}`;

    // 4. Run Gemini using existing wrapper
    const response = await askGemini({
      prompt: args.userMessage,
      systemInstruction: systemPrompt,
      tools: tools,
      // Pass history here if supported by wrapper, or format into prompt
    });

    // 5. Handle response
    if (response.functionCall) {
      // Do NOT save message yet, return to UI for confirmation
      return { 
        pendingAction: {
          actionType: response.functionCall.name,
          params: response.functionCall.args
        } 
      };
    } else {
      // Text response: Save user message and AI message
      await ctx.runMutation(internal.chat.saveMessage, { role: "user", content: args.userMessage });
      await ctx.runMutation(internal.chat.saveMessage, { role: "assistant", content: response.text });
      return { text: response.text };
    }
  }
});

export const executeAction = action({
  args: {
    userMessage: v.string(),
    actionType: v.union(v.literal("addTransaction"), v.literal("contributeToGoal")),
    params: v.object({
      title: v.optional(v.string()),
      amount: v.optional(v.number()),
      type: v.optional(v.union(v.literal("income"), v.literal("expense"))),
      category: v.optional(v.string()),
      paymentMethod: v.optional(v.string()),
      date: v.optional(v.string()),
      goalId: v.optional(v.id("goals")),
      goalName: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Not authenticated");

    // Execute real mutation based on actionType
    if (args.actionType === "addTransaction") {
      await ctx.runMutation(api.transactions.addTransaction, {
        title: args.params.title!,
        amount: args.params.amount!,
        type: args.params.type as any,
        category: args.params.category!,
        paymentMethod: args.params.paymentMethod!,
        date: args.params.date!,
        note: args.params.note,
      });
    } else if (args.actionType === "contributeToGoal") {
      await ctx.runMutation(api.goals.contribute, {
        goalId: args.params.goalId!,
        amount: args.params.amount!,
      });
    }

    // Save history
    await ctx.runMutation(internal.chat.saveMessage, { role: "user", content: args.userMessage });
    const successMsg = `Done! Successfully processed your request.`;
    await ctx.runMutation(internal.chat.saveMessage, { role: "assistant", content: successMsg });

    return { success: true, message: successMsg };
  }
});
```

**Step 2: Commit**
```bash
git add convex/chat.ts convex/lib/gemini.ts
git commit -m "feat(chat): implement sendMessage and executeAction actions"
```

---

### Task 4: Implement Cron Job for Deleting Old Messages

**Files:**
- Create/Modify: `convex/crons.ts`
- Modify: `convex/chat.ts`

**Step 1: Write minimal implementation**
```ts
// Add to convex/chat.ts
export const clearOldMessages = internalMutation({
  args: {},
  handler: async (ctx) => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const threshold = sevenDaysAgo.toISOString();
    
    // Use the index to quickly find old messages
    const oldMessages = await ctx.db
      .query("chatMessages")
      .withIndex("by_created_at")
      .filter((q) => q.lt(q.field("createdAt"), threshold))
      .collect();
      
    for (const msg of oldMessages) {
      await ctx.db.delete(msg._id);
    }
  }
});

// In convex/crons.ts
import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.daily(
  "clear old chat messages",
  { hourUTC: 0, minuteUTC: 0 },
  internal.chat.clearOldMessages
);

export default crons;
```

**Step 2: Commit**
```bash
git add convex/chat.ts convex/crons.ts
git commit -m "feat(chat): add cron job to clear old messages"
```

---

### Task 5: Build Chat UI Components

**Files:**
- Create: `src/components/chat/chat-message.tsx`
- Create: `src/components/chat/action-confirmation-card.tsx`
- Create: `src/components/chat/chat-input.tsx`
- Create: `src/components/chat/suggestion-chips.tsx`
- Create: `src/components/chat/monthly-chat-context.tsx`
- Create: `src/components/chat/index.ts`

**Step 1: Write minimal implementation**
Implement the presentation components strictly following Tailwind and shadcn conventions.

**Step 2: Commit**
```bash
git add src/components/chat/
git commit -m "feat(chat): UI components for chat"
```

---

### Task 6: Build Chat Page

**Files:**
- Create: `src/app/dashboard/chat/page.tsx`

**Step 1: Write minimal implementation**
Assemble the UI components, wire up `useAction(api.chat.sendMessage)` and `useAction(api.chat.executeAction)`. Manage the pending action state locally.

**Step 2: Commit**
```bash
git add src/app/dashboard/chat/page.tsx
git commit -m "feat(chat): assemble chat page"
```
