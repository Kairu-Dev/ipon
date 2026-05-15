// convex/chat.ts
// Queries, mutations, and actions for the AI chat feature.
// Uses chatMessages table defined in schema.ts.
import { internalQuery, internalMutation, query, action } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { internal, api } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";
import { SAVINGS_CATEGORY } from "./constants";
import { askGeminiChat } from "./lib/geminiChat";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, PAYMENT_METHODS } from "../src/constants/transactions";

// ---------------------------------------------------------------------------
// Public query — used by the UI to render chat history
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Internal query — fetch chat history for the action (no auth context)
// ---------------------------------------------------------------------------
export const getRecentHistory = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(10);

    // Reverse so oldest first — Gemini expects chronological order
    return messages.reverse();
  },
});

// ---------------------------------------------------------------------------
// Internal query — gather financial context for the AI system prompt
// ---------------------------------------------------------------------------
export const getContextForAI = internalQuery({
  args: { userId: v.id("users"), month: v.string() },
  handler: async (ctx, args) => {
    // Fetch real data in parallel
    const [transactions, budgets, goals] = await Promise.all([
      ctx.db
        .query("transactions")
        .withIndex("by_user_and_date", (q) =>
          q.eq("userId", args.userId)
           .gte("date", `${args.month}-01`)
           .lte("date", `${args.month}-31`)
        )
        .collect(),
      ctx.db
        .query("budgets")
        .withIndex("by_user_and_month", (q) =>
          q.eq("userId", args.userId).eq("month", args.month)
        )
        .collect(),
      ctx.db
        .query("goals")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .collect(),
    ]);

    // Compute totals (exclude Savings from expenses — those are goal contributions)
    let totalIncome = 0;
    let totalExpenses = 0;
    for (const tx of transactions) {
      if (tx.type === "income") totalIncome += tx.amount;
      if (tx.type === "expense" && tx.category !== SAVINGS_CATEGORY) totalExpenses += tx.amount;
    }

    // Spending by category for the prompt
    const categoryTotals: Record<string, number> = {};
    for (const tx of transactions) {
      if (tx.type === "expense" && tx.category !== SAVINGS_CATEGORY) {
        categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + tx.amount;
      }
    }

    // Top spending categories sorted descending
    const topCategories = Object.entries(categoryTotals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([cat, amount]) => `${cat}: ₱${amount.toLocaleString()}`);

    const spentPerCategory: Record<string, number> = {};
    for (const tx of transactions) {
      if (tx.type === "expense" && tx.category !== SAVINGS_CATEGORY) {
        spentPerCategory[tx.category] = (spentPerCategory[tx.category] ?? 0) + tx.amount;
      }
    }

    return {
      totals: {
        totalIncome,
        totalExpenses,
        remainingBalance: totalIncome - totalExpenses,
      },
      topCategories,
      budgets: budgets.map((b) => ({
        category: b.category,
        limit: b.monthlyLimit,
        spent: categoryTotals[b.category] || 0,
      })),
      // Include _id for goals so Gemini can reference goalId in contributeToGoal
      goals: goals
        .filter((g) => !g.isCompleted)
        .map((g) => ({
          _id: g._id,
          name: g.name,
          target: g.targetAmount,
          saved: g.savedAmount,
          deadline: g.deadline,
        })),
      spentPerCategory,
    };
  },
});

// ---------------------------------------------------------------------------
// Internal mutation — save a single chat message
// ---------------------------------------------------------------------------
export const saveMessage = internalMutation({
  args: {
    userId: v.id("users"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("chatMessages", {
      userId: args.userId,
      role: args.role,
      content: args.content,
      createdAt: new Date().toISOString(),
    });
  },
});

// ---------------------------------------------------------------------------
// Gemini function tool declarations for agentic actions
// ---------------------------------------------------------------------------
const VALID_EXPENSE_CATEGORIES = EXPENSE_CATEGORIES.map((c) => c.value);
const VALID_INCOME_CATEGORIES = INCOME_CATEGORIES.map((c) => c.value);
const VALID_PAYMENT_METHODS = [...PAYMENT_METHODS];

const CHAT_TOOLS = [{
  functionDeclarations: [
    {
      name: "addTransaction",
      description: "Log an income or expense transaction for the user. Use this ONLY for logging actual spending or income — never for budget adjustments.",
      parameters: {
        type: "object",
        properties: {
          title:         { type: "string", description: "Short label e.g. 'Jollibee lunch'" },
          amount:        { type: "number", description: "Amount in Philippine Peso" },
          type:          { type: "string", enum: ["income", "expense"] },
          category:      { type: "string", description: "Must match a valid expense or income category" },
          paymentMethod: { type: "string", description: "e.g. Cash, GCash, Debit Card, Bank Transfer" },
          date:          { type: "string", description: "ISO date YYYY-MM-DD" },
          note:          { type: "string" },
        },
        required: ["title", "amount", "type", "category", "paymentMethod", "date"],
      },
    },
    {
      name: "contributeToGoal",
      description: "Add money to one of the user's savings goals.",
      parameters: {
        type: "object",
        properties: {
          goalId:   { type: "string", description: "Exact Convex ID of the goal" },
          goalName: { type: "string", description: "Human-readable goal name for confirmation UI" },
          amount:   { type: "number", description: "Amount in Philippine Peso" },
          date:     { type: "string", description: "ISO date YYYY-MM-DD" },
        },
        required: ["goalId", "goalName", "amount", "date"],
      },
    },
    {
      name: "setBudgetLimit",
      description: "Set or update a monthly spending limit for a budget category. Use this when the user asks to adjust, set, or change a budget limit — NEVER use addTransaction for budget changes.",
      parameters: {
        type: "object",
        properties: {
          category:    { type: "string", description: "Category name e.g. 'Food & Dining'" },
          limit:       { type: "number", description: "New monthly limit in Philippine Peso" },
          description: { type: "string", description: "Optional short description of the category" },
          isNew:       { type: "boolean", description: "true if this is a new custom category, false if updating existing" },
        },
        required: ["category", "limit", "isNew"],
      },
    },
    {
      name: "getGoalProgress",
      description: "Show visual progress for one or all savings goals. Use this when the user asks about their goal progress, contribution status, or savings targets.",
      parameters: {
        type: "object",
        properties: {
          goalId: { type: "string", description: "Specific goal ID — omit to show all goals" },
        },
        required: [],
      },
    },
  ],
}];

// ---------------------------------------------------------------------------
// Build the system prompt with real financial context
// ---------------------------------------------------------------------------
function buildChatSystemPrompt(contextData: {
  totals: { totalIncome: number; totalExpenses: number; remainingBalance: number };
  topCategories: string[];
  budgets: { category: string; limit: number; spent: number }[];
  goals: { _id: string; name: string; target: number; saved: number; deadline: string }[];
  spentPerCategory: Record<string, number>;
}): string {
  return `You are Ipon, a personal budgeting assistant for Filipino users.
You have access to the user's real financial data provided below.

=== FINANCIAL CONTEXT ===
Total Income this month: ₱${contextData.totals.totalIncome.toLocaleString()}
Total Expenses this month: ₱${contextData.totals.totalExpenses.toLocaleString()}
Remaining Balance: ₱${contextData.totals.remainingBalance.toLocaleString()}

Budget limits:
${contextData.budgets.length > 0
  ? contextData.budgets.map(b => {
      const spent = contextData.spentPerCategory?.[b.category] ?? 0;
      const pct = b.limit > 0 ? Math.round((spent / b.limit) * 100) : 0;
      return `- ${b.category}: ₱${b.limit.toLocaleString()} limit, ₱${spent.toLocaleString()} spent (${pct}%)`;
    }).join("\n")
  : "No budget limits set."}

Savings goals:
${contextData.goals.length > 0
  ? contextData.goals.map(g => {
      const pct = Math.floor((g.saved / g.target) * 100);
      const remaining = g.target - g.saved;
      return `- ${g.name} (ID: ${g._id}): ${pct}% saved, ₱${g.saved.toLocaleString()} / ₱${g.target.toLocaleString()}, ₱${remaining.toLocaleString()} remaining`;
    }).join("\n")
  : "No savings goals set."}

=== TOOL USAGE RULES — READ CAREFULLY ===
- addTransaction → ONLY for logging actual spending or income
- setBudgetLimit → ONLY for setting or adjusting budget category limits
- contributeToGoal → ONLY for adding money to a savings goal
- getGoalProgress → ONLY when user asks to see goal progress visually
- NEVER use addTransaction for budget adjustments — this is a critical rule
- PROACTIVE LOGGING: If a user asks "can I afford X" and then says "log it" or "buy it", use addTransaction IMMEDIATELY with the details from the previous message.
- DEFAULT VALUES: Use "Cash" as the default payment method if unknown. Use the most relevant category from the affordability check.

=== CUSTOM CATEGORY RULES ===
- You can create new budget categories using setBudgetLimit with isNew: true
- Ask for a description if the user doesn't provide one
- Valid new categories can be anything the user names — not restricted to existing ones
- After creating, confirm the category name, limit, and description

=== STRICT RULES ===
1. Only discuss budgeting, spending, and saving. Analyzing if a user can afford a purchase (e.g. shoes, food, gadgets) is a core part of your role.
2. If asked about investments, stocks, crypto: "I can only help with budgeting and savings topics."
3. Never give legal or tax advice
4. Always use real numbers from the financial context above
5. Keep responses concise — max 4 sentences for simple questions
6. Be direct — no filler phrases like "It is recommended" or "You may want to"
7. Write like a knowledgeable friend — not a bank, not a hype bot
8. Never use cringe phrases: "You've got this!", "Amazing!", "Superstar!", "Keep it up!"
9. Maximum one exclamation mark per response
10. No emojis in any response — not in text, not in confirmations
11. Do not force Filipino slang — GCash, Jollibee, commute are fine naturally
12. Short sentences — this is a mobile app, not a report
13. Dry wit is allowed — the situation can be lightly funny, never the user's punchline
14. Do not render markdown asterisks — write in plain text only, no **bold** formatting

=== AFFORDABILITY QUESTIONS ===
When user asks "can I afford X?" or similar:
- Give a clear verdict: "Yes, you can afford it" or "This would stretch your budget"
- Show remaining balance after the purchase
- NEVER use bullet points (•) for budget limits. Use the tag:
  |||BUDGET_BREAKDOWN|||[{"category":"Food & Dining","limit":5000,"spent":6750,"percentage":135}]|||END|||
- Always include at the END of your response:
  |||VERDICT|||{"verdict":"safe","verdict_reason":"Impact on savings: Minimal"}|||END|||
  Valid verdict values: "safe" | "caution" | "risk"

=== BUDGET LIMIT QUERIES ===
When user asks "what is my budget for X" or "what's my X limit":
- State the category name, monthly limit, amount spent so far, and percentage used
- NEVER use bullet points (•) for budget limits. Use the |||BUDGET_BREAKDOWN||| tag.
- Do NOT use setBudgetLimit for queries — only for setting or changing limits

=== FORMAT RULES ===
- Plain text only — no markdown asterisks, no bold, no headers
- Use bullet points (•) for general lists ONLY — never for budget numbers
- No emojis anywhere

Valid expense categories: ${VALID_EXPENSE_CATEGORIES.join(", ")}
Valid income categories: ${VALID_INCOME_CATEGORIES.join(", ")}
Valid payment methods: ${VALID_PAYMENT_METHODS.join(", ")}`;
}

// ---------------------------------------------------------------------------
// Action — send a user message and get an AI response
// ---------------------------------------------------------------------------
export const sendMessage = action({
  args: { userMessage: v.string(), month: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Not authenticated");

    const trimmed = args.userMessage.trim();
    if (trimmed.length === 0) throw new ConvexError("Message cannot be empty");
    if (args.userMessage.length > 300) throw new ConvexError("Message too long (max 300 characters)");

    // 1. Fetch financial context
    const contextData = await ctx.runQuery(internal.chat.getContextForAI, {
      userId,
      month: args.month,
    });

    // 2. Fetch recent conversation history
    const recentMessages = await ctx.runQuery(internal.chat.getRecentHistory, {
      userId,
    });

    // Format history for Gemini (role: "user" | "model")
    const history = recentMessages.map((m: { role: string; content: string }) => ({
      role: m.role === "user" ? ("user" as const) : ("model" as const),
      parts: [{ text: m.content }],
    }));

    // 3. Build system prompt
    const systemPrompt = buildChatSystemPrompt(contextData);

    // 4. Call Gemini
    const result = await askGeminiChat({
      systemInstruction: systemPrompt,
      history,
      userMessage: trimmed,
      tools: CHAT_TOOLS,
    });

    // 5. Handle response
    if (result.functionCall) {
      const { name, args: functionArgs } = result.functionCall;

      // getGoalProgress — no confirmation needed, render visual card directly
      if (name === "getGoalProgress") {
        await ctx.runMutation(internal.chat.saveMessage, {
          userId,
          role: "user",
          content: trimmed,
        });
        await ctx.runMutation(internal.chat.saveMessage, {
          userId,
          role: "assistant",
          content: JSON.stringify({
            type: "goalProgress",
            goalId: functionArgs.goalId ?? null, // null = show all goals
          }),
        });
        return {
          type: "text" as const,
          text: JSON.stringify({
            type: "goalProgress",
            goalId: functionArgs.goalId ?? null,
          }),
        };
      }

      // All other function calls → return pending action for confirmation
      return {
        type: "pendingAction" as const,
        pendingAction: {
          actionType: name,
          params: functionArgs,
        },
      };
    }

    if (result.text) {
      // Save both messages to history
      await ctx.runMutation(internal.chat.saveMessage, {
        userId,
        role: "user",
        content: trimmed,
      });
      await ctx.runMutation(internal.chat.saveMessage, {
        userId,
        role: "assistant",
        content: result.text,
      });

      return { type: "text" as const, text: result.text };
    }

    // Gemini returned nothing — API error
    return { type: "error" as const, error: "AI failed to respond. Please try again." };
  },
});

// ---------------------------------------------------------------------------
// Action — execute a confirmed agentic action (after user taps confirm)
// ---------------------------------------------------------------------------
export const executeAction = action({
  args: {
    userMessage: v.string(),
    actionType: v.union(
      v.literal("addTransaction"),
      v.literal("contributeToGoal"),
      v.literal("setBudgetLimit")
    ),
    params: v.object({
      // addTransaction params
      title: v.optional(v.string()),
      amount: v.optional(v.number()),
      type: v.optional(v.union(v.literal("income"), v.literal("expense"))),
      category: v.optional(v.string()),
      paymentMethod: v.optional(v.string()),
      date: v.optional(v.string()),
      note: v.optional(v.string()),
      // contributeToGoal params
      goalId: v.optional(v.string()),
      goalName: v.optional(v.string()),
      // setBudgetLimit params
      limit: v.optional(v.number()),
      description: v.optional(v.string()),
      isNew: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Not authenticated");

    let successMsg: string;

    if (args.actionType === "setBudgetLimit") {
      const today = new Date();
      const pad = (n: number) => String(n).padStart(2, "0");
      const currentMonth = `${today.getFullYear()}-${pad(today.getMonth() + 1)}`;

      // Check if budget record already exists for this category + month
      const existing = await ctx.runQuery(internal.chat.getBudgetRecord, {
        userId,
        category: args.params.category!,
        month: currentMonth,
      });

      if (existing) {
        await ctx.runMutation(internal.budgets.patchBudget, {
          id: existing._id,
          monthlyLimit: args.params.limit!,
          description: args.params.description,
        });
      } else {
        await ctx.runMutation(internal.budgets.insertBudget, {
          userId,
          category: args.params.category!,
          monthlyLimit: args.params.limit!,
          month: currentMonth,
          description: args.params.description,
        });
      }

      const action = args.params.isNew ? "created" : "updated";
      successMsg = `Done! Budget ${action} — ${args.params.category} limit set to ₱${args.params.limit!.toLocaleString()}/month.`;

    } else if (args.actionType === "addTransaction") {
      // Validate required fields
      const { title, amount, type, category, paymentMethod, date } =
        args.params;
      if (!title || !amount || !type || !category || !paymentMethod || !date) {
        throw new ConvexError("Missing required transaction fields");
      }

      // Server-side validation — never trust AI values blindly
      if (amount <= 0 || amount > 999999.99) {
        throw new ConvexError("Invalid amount");
      }

      await ctx.runMutation(api.transactions.addTransaction, {
        title,
        amount,
        type,
        category,
        paymentMethod,
        date,
        note: args.params.note,
      });

      successMsg = `Done! ₱${amount.toLocaleString()} logged for "${title}". 🎉`;
    } else {
      // contributeToGoal
      const { goalId, goalName, amount, date } = args.params;
      if (!goalId || !goalName || !amount || !date) {
        throw new ConvexError("Missing required goal contribution fields");
      }

      if (amount <= 0) {
        throw new ConvexError("Contribution amount must be greater than 0");
      }

      // goalId comes as string from Gemini — we pass it through and let
      // the mutation validate it against the goals table
      await ctx.runMutation(api.goals.contributeToGoal, {
        goalId: goalId as unknown as import('./_generated/dataModel').Id<'goals'>,
        amount,
        date,
      });

      successMsg = `Done! ₱${amount.toLocaleString()} contributed to "${goalName}". 🎉`;
    }

    // Save user message and AI confirmation to history
    await ctx.runMutation(internal.chat.saveMessage, {
      userId,
      role: "user",
      content: args.userMessage,
    });
    await ctx.runMutation(internal.chat.saveMessage, {
      userId,
      role: "assistant",
      content: successMsg,
    });

    return { success: true, message: successMsg };
  },
});

// ---------------------------------------------------------------------------
// Internal mutation — cron: delete messages older than 7 days
// ---------------------------------------------------------------------------
export const clearOldMessages = internalMutation({
  args: {},
  handler: async (ctx) => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const threshold = sevenDaysAgo.toISOString();

    // Use index range constraint — no full table scan
    const oldMessages = await ctx.db
      .query("chatMessages")
      .withIndex("by_created_at", (q) => q.lt("createdAt", threshold))
      .collect();

    for (const msg of oldMessages) {
      await ctx.db.delete(msg._id);
    }
  },
});

export const getBudgetRecord = internalQuery({
  args: { userId: v.id("users"), category: v.string(), month: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("budgets")
      .withIndex("by_user_and_month", (q) =>
        q.eq("userId", args.userId).eq("month", args.month)
      )
      .filter((q) => q.eq(q.field("category"), args.category))
      .first();
  },
});
