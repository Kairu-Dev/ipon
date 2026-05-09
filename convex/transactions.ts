import { mutation, action, query } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { parseGeminiCategorySuggestion } from "../src/lib/gemini-parser";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "../src/constants/transactions";
import { askGemini } from "./lib/gemini";

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
