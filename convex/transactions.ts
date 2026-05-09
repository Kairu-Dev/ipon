import { mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { parseGeminiCategorySuggestion } from "../src/lib/gemini-parser";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "../src/constants/transactions";

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
    if (!userId) throw new Error("Not authenticated");

    if (args.amount <= 0 || args.amount > 999999.99) {
      throw new Error("Amount must be greater than 0 and up to 999,999.99");
    }

    return await ctx.db.insert("transactions", {
      userId,
      type: args.type,
      title: args.title,
      amount: args.amount,
      category: args.category,
      paymentMethod: args.paymentMethod,
      date: args.date,
      note: args.note,
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

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY environment variable is not set in Convex dashboard.");
      return null;
    }

    const categories = args.type === "expense" 
      ? EXPENSE_CATEGORIES.map(c => c.value).join(", ") 
      : INCOME_CATEGORIES.map(c => c.value).join(", ");

    const prompt = `You are a finance categorization assistant. Based on this transaction note: "${args.note}", suggest the most appropriate category from this exact list: [${categories}]. Respond with ONLY the exact category name from the list, nothing else. If none fit perfectly, return "Others".`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 200 }
        }),
      });

      if (!response.ok) {
        console.error("Failed to fetch from Gemini API", await response.text());
        return null;
      }

      const data = await response.json();
      console.log("Full Gemini Response Data:", JSON.stringify(data, null, 2));

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      console.log("Gemini Raw Text:", text);

      if (!text) return null;

      // Clean quotes and spaces before parsing
      const cleanText = text.replace(/["']/g, "").trim();
      const parsed = parseGeminiCategorySuggestion(cleanText, args.type);
      
      console.log("Parsed Category:", parsed);
      return parsed;
    } catch (err) {
      console.error("Error calling Gemini API:", err);
      return null;
    }
  },
});
