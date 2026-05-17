// convex/insights.ts
// AI Spending Insights — generates and caches Gemini-powered spending insights.
// Architecture: public query (UI reads) → internal query (data aggregation) →
// action (Gemini call) → internal mutation (DB write).

import { query, action, internalQuery, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v, ConvexError } from "convex/values";
import { Id } from "./_generated/dataModel";
import { getAuthUserId } from "@convex-dev/auth/server";
import { askGemini } from "./lib/gemini/client";
import { buildInsightPrompt } from "./lib/gemini/prompts";

// Return type for the generateInsight action
export type InsightResult =
  | { status: "cached" | "success"; content: string }
  | { status: "fallback" | "error" | "rate_limit"; content: null };

// Shape of the data returned by getInsightData
interface InsightData {
  isCached: boolean;
  insight: {
    _id: Id<"insights">;
    content: string;
    generatedAt: string;
    manualRegenCount: number;
    manualRegenResetAt: string;
  } | null;
  transactions: { type: string; amount: number; category: string }[];
  prevTransactions: { type: string; amount: number; category: string }[];
  budgets: { category: string; monthlyLimit: number }[];
  goals: { name: string; targetAmount: number; savedAmount: number; deadline: string }[];
  transactionCount: number;
  regenLimitReached?: boolean;
}

// Maximum number of manual regenerations allowed per day
const MAX_DAILY_REGENS = 3;

// Minimum transactions required before calling Gemini
const MIN_TRANSACTIONS_FOR_INSIGHT = 5;

// Cache validity period in milliseconds (24 hours)
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * Public query — returns the latest cached insight for the authenticated user.
 * The UI subscribes to this reactively via useQuery.
 */
export const getInsight = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    // Fetch the most recent insight for this user
    const insight = await ctx.db
      .query("insights")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .first();

    return insight;
  },
});

/**
 * Internal query — aggregates all data needed by the generateInsight action.
 * Returns cached insight, transaction breakdown, and budget limits.
 * Actions cannot access ctx.db directly, so this query bridges that gap.
 */
export const getInsightData = internalQuery({
  args: {
    userId: v.id("users"),
    force: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Fetch cached insight
    const insight = await ctx.db
      .query("insights")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .first();

    // Check cache validity — if insight is fresh and not forced, skip Gemini
    if (insight && !args.force) {
      const generatedTime = new Date(insight.generatedAt).getTime();
      const now = Date.now();

      // Also check if any new transaction was added after the insight was generated
      // by comparing _creationTime of the latest transaction
      const latestTransaction = await ctx.db
        .query("transactions")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .order("desc")
        .first();

      const hasNewTransaction = latestTransaction
        ? latestTransaction._creationTime > generatedTime
        : false;

      if (now - generatedTime < CACHE_TTL_MS && !hasNewTransaction) {
        return { isCached: true, insight, transactions: [], prevTransactions: [], budgets: [], goals: [], transactionCount: 0 };
      }
    }

    // Check manual regen limits if forced
    if (args.force && insight) {
      const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"
      const resetDate = insight.manualRegenResetAt;

      // Reset counter if it's a new day
      const count = resetDate === today ? insight.manualRegenCount : 0;

      if (count >= MAX_DAILY_REGENS) {
        return {
          isCached: false,
          insight,
          transactions: [],
          prevTransactions: [],
          budgets: [],
          goals: [],
          transactionCount: 0,
          regenLimitReached: true,
        };
      }
    }

    // Fetch last 30 days of transactions using the compound date index
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const startDate = thirtyDaysAgo.toISOString().split("T")[0]; // "YYYY-MM-DD"
    const endDate = now.toISOString().split("T")[0];

    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_user_and_date", (q) =>
        q.eq("userId", args.userId)
          .gte("date", startDate)
          .lte("date", endDate)
      )
      .collect();

    // Fetch current month budget limits
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const budgets = await ctx.db
      .query("budgets")
      .withIndex("by_user_and_month", (q) =>
        q.eq("userId", args.userId).eq("month", currentMonth)
      )
      .collect();

    const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthStr = `${previousMonth.getFullYear()}-${String(previousMonth.getMonth() + 1).padStart(2, "0")}`;

    const prevTransactions = await ctx.db
      .query("transactions")
      .withIndex("by_user_and_date", (q) =>
        q.eq("userId", args.userId)
          .gte("date", `${prevMonthStr}-01`)
          .lte("date", `${prevMonthStr}-31`)
      )
      .collect();

    const goals = await ctx.db
      .query("goals")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    return {
      isCached: false,
      insight,
      transactions: transactions.map((t) => ({
        type: t.type,
        amount: t.amount,
        category: t.category,
      })),
      prevTransactions: prevTransactions.map((t) => ({
        type: t.type,
        amount: t.amount,
        category: t.category,
      })),
      budgets: budgets.map((b) => ({
        category: b.category,
        monthlyLimit: b.monthlyLimit,
      })),
      goals: goals.map((g) => ({
        name: g.name,
        targetAmount: g.targetAmount,
        savedAmount: g.savedAmount,
        deadline: g.deadline,
      })),
      transactionCount: transactions.length,
    };
  },
});

export const consumeManualRegen = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const today = new Date().toISOString().split("T")[0];
    const insight = await ctx.db
      .query("insights")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .first();

    if (!insight) return true;

    const count = insight.manualRegenResetAt === today ? insight.manualRegenCount : 0;
    if (count >= MAX_DAILY_REGENS) return false;

    await ctx.db.patch(insight._id, {
      manualRegenCount: count + 1,
      manualRegenResetAt: today,
    });
    return true;
  },
});

/**
 * Internal mutation — persists the generated insight to the database.
 * Called by the generateInsight action after a successful Gemini response.
 */
export const saveInsight = internalMutation({
  args: {
    userId: v.id("users"),
    content: v.string(),
    transactionCount: v.number(),
    force: v.boolean(),
    existingInsightId: v.optional(v.id("insights")),
  },
  handler: async (ctx, args) => {
    const now = new Date();
    const today = now.toISOString().split("T")[0]; // "YYYY-MM-DD"
    const generatedAt = now.toISOString(); // "YYYY-MM-DDTHH:mm:ss.sssZ"

    if (args.existingInsightId) {
      // Update existing insight record
      const existing = await ctx.db.get(args.existingInsightId);

      // Preserve existing manual regen state (already incremented by consumeManualRegen if forced)
      let manualRegenCount = 0;
      let manualRegenResetAt = today;

      if (existing) {
        manualRegenCount = existing.manualRegenCount;
        manualRegenResetAt = existing.manualRegenResetAt;
      }

      await ctx.db.patch(args.existingInsightId, {
        content: args.content,
        generatedAt,
        transactionCount: args.transactionCount,
        manualRegenCount,
        manualRegenResetAt,
      });
    } else {
      // Insert new insight record
      await ctx.db.insert("insights", {
        userId: args.userId,
        content: args.content,
        generatedAt,
        manualRegenCount: args.force ? 1 : 0,
        manualRegenResetAt: today,
        transactionCount: args.transactionCount,
      });
    }
  },
});

/**
 * Public action — orchestrates insight generation.
 * 1. Fetches data via internal query (transactions, budgets, cache state)
 * 2. Returns cached result if still valid
 * 3. Returns fallback if fewer than 5 transactions
 * 4. Calls Gemini API with structured prompt
 * 5. Parses and sanitizes JSON response
 * 6. Saves result via internal mutation
 */
export const generateInsight = action({
  args: {
    force: v.optional(v.boolean()),
  },
  handler: async (ctx, args): Promise<InsightResult> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Not authenticated");

    const force = args.force ?? false;

    // Fetch all data via internal query — typed to break circularity
    const data: InsightData = await ctx.runQuery(internal.insights.getInsightData, {
      userId,
      force,
    });

    // Return cached insight if valid
    if (data.isCached && data.insight) {
      return { status: "cached" as const, content: data.insight.content };
    }

    // Check if manual regen limit was reached
    if ("regenLimitReached" in data && data.regenLimitReached) {
      throw new ConvexError("Daily refresh limit reached. Try again tomorrow.");
    }

    // Fallback if too few transactions
    if (data.transactionCount < MIN_TRANSACTIONS_FOR_INSIGHT) {
      return { status: "fallback" as const, content: null };
    }

    // Construct the Gemini prompt using the extracted helper
    const prompt = buildInsightPrompt({
      transactions: data.transactions,
      prevTransactions: data.prevTransactions,
      budgets: data.budgets,
      goals: data.goals,
    });

    // Call Gemini API — wrapped in try/catch for resilience
    // If forced, atomically consume a manual regen token first
    if (force) {
      const canRegen = await ctx.runMutation(internal.insights.consumeManualRegen, { userId });
      if (!canRegen) {
        throw new ConvexError("Daily refresh limit reached. Try again tomorrow.");
      }
    }
    let rawResponse: string | null = null;
    try {
      rawResponse = await askGemini(prompt);
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "RATE_LIMIT") {
        return { status: "rate_limit" as const, content: null };
      }
      return { status: "error" as const, content: null };
    }

    if (!rawResponse) {
      return { status: "error" as const, content: null };
    }

    // Parse and sanitize the JSON response
    // Gemini sometimes wraps JSON in markdown code fences — strip them
    const cleanText = rawResponse
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let parsed: { alert: string; detail: string; bullets?: string[] };
    try {
      parsed = JSON.parse(cleanText);

      // Validate required fields exist and are strings
      if (typeof parsed.alert !== "string" || typeof parsed.detail !== "string") {
        return { status: "error" as const, content: null };
      }

      // Ensure bullets is an array of strings (or default to empty)
      if (!Array.isArray(parsed.bullets)) {
        parsed.bullets = [];
      } else {
        parsed.bullets = parsed.bullets.filter((b): b is string => typeof b === "string");
      }
    } catch {
      // Malformed JSON from Gemini — return error fallback
      return { status: "error" as const, content: null };
    }

    // Sanitize — Only strip internal technical values — keep peso amounts
    const sanitize = (text: string): string =>
      text.replace(/[a-z0-9]{20,}/g, ""); // strip any Convex document IDs that leaked

    const sanitizedContent = JSON.stringify({
      alert: sanitize(parsed.alert),
      detail: sanitize(parsed.detail),
      bullets: parsed.bullets.map(sanitize),
    });

    // Save the result via internal mutation
    await ctx.runMutation(internal.insights.saveInsight, {
      userId,
      content: sanitizedContent,
      transactionCount: data.transactionCount,
      force,
      existingInsightId: data.insight?._id,
    });

    return { status: "success" as const, content: sanitizedContent };
  },
});
