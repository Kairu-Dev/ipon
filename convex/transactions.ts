import { mutation, action, query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import { v, ConvexError } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { SAVINGS_CATEGORY } from "./constants";
import { parseGeminiCategorySuggestion } from "@/lib/gemini-parser";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/constants/transactions";
import { askGemini } from "./lib/gemini/client";

export const addTransaction = mutation({
  args: {
    type: v.union(v.literal("income"), v.literal("expense")),
    title: v.string(),
    amount: v.number(),
    category: v.string(),
    paymentMethod: v.string(),
    date: v.string(),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Not authenticated");

    if (args.amount <= 0 || args.amount > 999999.99) {
      throw new ConvexError("Amount must be greater than 0 and up to 999,999.99");
    }

    const trimmedTitle = args.title.trim();
    const trimmedCategory = args.category.trim();
    const trimmedPaymentMethod = args.paymentMethod.trim();
    
    const trimmedNote = args.note?.trim() || undefined;
    if (trimmedNote && trimmedNote.length > 150) {
      throw new ConvexError("Note cannot exceed 150 characters");
    }

    if (!trimmedTitle || !trimmedCategory || !trimmedPaymentMethod) {
      throw new ConvexError("Title, category, and payment method cannot be empty or just whitespace");
    }

    return await ctx.db.insert("transactions", {
      userId,
      type: args.type,
      title: trimmedTitle,
      amount: args.amount,
      category: trimmedCategory,
      paymentMethod: trimmedPaymentMethod,
      date: args.date,
      note: trimmedNote,
    });
  },
});

export const suggestCategory = action({
  args: {
    note: v.string(),
    type: v.union(v.literal("income"), v.literal("expense")),
  },
  handler: async (ctx, args) => {
    if (!args.note.trim()) return null;

    const categories = args.type === "expense" 
      ? EXPENSE_CATEGORIES.map(c => c.value).join(", ") 
      : INCOME_CATEGORIES.map(c => c.value).join(", ");

    const prompt = `You are a finance categorization assistant. Based on this transaction note: "${args.note}", suggest the most appropriate category from this exact list: [${categories}]. Respond with ONLY the exact category name from the list, nothing else. If none fit perfectly, return "Others".`;

    const text = await askGemini(prompt);
    if (!text) return null;

    const cleanText = text.replace(/["']/g, "").trim();
    return parseGeminiCategorySuggestion(cleanText, args.type);
  },
});

export const getTotals = query({
  args: { month: v.string() }, // "YYYY-MM" format expected
  handler: async (ctx, args) => {
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(args.month)) {
      throw new ConvexError("Invalid month format. Expected YYYY-MM.");
    }

    const userId = await getAuthUserId(ctx);
    if (!userId) return { totalIncome: 0, totalExpenses: 0, remainingBalance: 0 };

    const currentMonthTx = await ctx.db
      .query("transactions")
      .withIndex("by_user_and_date", (q) => 
        q.eq("userId", userId)
         .gte("date", `${args.month}-01`)
         .lte("date", `${args.month}-31`)
      )
      .collect();

    const totalIncome = currentMonthTx
      .filter(tx => tx.type === "income")
      .reduce((sum, tx) => sum + tx.amount, 0);
      
    const totalExpenses = currentMonthTx
      .filter(tx => tx.type === "expense")
      .reduce((sum, tx) => sum + tx.amount, 0);

    return {
      totalIncome,
      totalExpenses,
      remainingBalance: totalIncome - totalExpenses
    };
  }
});

// Paginated query for the transaction history page.
// Supports optional type and category filters applied at the query level.
export const getTransactions = query({
  args: {
    type: v.optional(v.union(v.literal("income"), v.literal("expense"))),
    category: v.optional(v.string()),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Not authenticated");

    // Use the compound index for efficient user-scoped date-ordered retrieval
    let q = ctx.db
      .query("transactions")
      .withIndex("by_user_and_date", (q) => q.eq("userId", userId))
      .order("desc");

    // Apply optional filters (AND logic)
    if (args.type) {
      q = q.filter((q) => q.eq(q.field("type"), args.type));
    }
    if (args.category) {
      q = q.filter((q) => q.eq(q.field("category"), args.category));
    }

    return await q.paginate(args.paginationOpts);
  },
});

// Compares income and expense totals between two months to calculate % change.
// Used by DashboardSummary to show month-over-month trend indicators.
export const getMonthOverMonthTrend = query({
  args: {
    currentMonth: v.string(),  // "YYYY-MM"
    previousMonth: v.string(), // "YYYY-MM"
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const sumForMonth = async (month: string) => {
      const txs = await ctx.db
        .query("transactions")
        .withIndex("by_user_and_date", (q) =>
          q.eq("userId", userId)
           .gte("date", `${month}-01`)
           .lte("date", `${month}-31`)
        )
        .collect();

      const income = txs
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);

      // Exclude Savings — goal contributions skew expense trends
      const expenses = txs
        .filter((t) => t.type === "expense" && t.category !== SAVINGS_CATEGORY)
        .reduce((sum, t) => sum + t.amount, 0);

      return { income, expenses };
    };

    const current = await sumForMonth(args.currentMonth);
    const previous = await sumForMonth(args.previousMonth);

    const calcTrend = (curr: number, prev: number): number | null => {
      if (prev === 0) return null; // no previous data — show N/A
      return Math.round(((curr - prev) / prev) * 100);
    };

    return {
      incomeTrend: calcTrend(current.income, previous.income),
      expenseTrend: calcTrend(current.expenses, previous.expenses),
    };
  },
});
