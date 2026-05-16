// convex/budgets.ts
// Queries and mutations for monthly budget management.
// Uses the `budgets` table defined in schema.ts.
import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Returns all budget records for the given month.
 * If no records exist for the current month, copies the previous month's
 * limits as transient defaults (without _id — not persisted until user saves).
 */
export const getBudgets = query({
  args: { month: v.string() },
  handler: async (ctx, args) => {
    // Validate YYYY-MM format
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(args.month)) {
      throw new ConvexError("Invalid month format. Expected YYYY-MM.");
    }

    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    // Query current month using the compound index
    const currentBudgets = await ctx.db
      .query("budgets")
      .withIndex("by_user_and_month", (q) =>
        q.eq("userId", userId).eq("month", args.month)
      )
      .collect();

    if (currentBudgets.length > 0) {
      return currentBudgets;
    }

    // Carry-over: compute previous month (handling year rollover)
    const [yearStr, monthStr] = args.month.split("-");
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    const prevMonthKey = `${prevYear}-${String(prevMonth).padStart(2, "0")}`;

    const previousBudgets = await ctx.db
      .query("budgets")
      .withIndex("by_user_and_month", (q) =>
        q.eq("userId", userId).eq("month", prevMonthKey)
      )
      .collect();

    // Return previous month limits as transient defaults (no _id)
    return previousBudgets.map((b) => ({
      category: b.category,
      icon: b.icon,
      description: b.description,
      monthlyLimit: b.monthlyLimit,
      month: args.month,
      userId: b.userId,
    }));
  },
});

/**
 * Returns expense spending grouped by category for the given month.
 * Excludes "Savings" — those are goal contributions, not discretionary spending.
 * Uses the by_user_and_date index to avoid full table scans.
 */
export const getSpentPerCategory = query({
  args: { month: v.string() },
  handler: async (ctx, args) => {
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(args.month)) {
      throw new ConvexError("Invalid month format. Expected YYYY-MM.");
    }

    const userId = await getAuthUserId(ctx);
    if (!userId) return {};

    // Use the compound index for efficient month-scoped retrieval
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_user_and_date", (q) =>
        q
          .eq("userId", userId)
          .gte("date", `${args.month}-01`)
          .lte("date", `${args.month}-31`)
      )
      .collect();

    // Aggregate: only expenses, exclude Savings
    const spentMap: Record<string, number> = {};
    for (const tx of transactions) {
      if (tx.type === "expense" && tx.category !== "Savings") {
        spentMap[tx.category] = (spentMap[tx.category] || 0) + tx.amount;
      }
    }

    return spentMap;
  },
});

/**
 * Bulk-saves all budget rows for a month in a single call.
 * - Upserts: updates existing records, inserts new ones.
 * - Deletes: any existing budget category NOT in the payload is removed.
 * - Validates each monthlyLimit > 0 server-side.
 * The frontend must strip blank/zero rows before calling this.
 */
export const saveBudgets = mutation({
  args: {
    month: v.string(),
    budgets: v.array(
      v.object({
        category: v.string(),
        monthlyLimit: v.number(),
        icon: v.optional(v.string()),
        description: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    // Validate month format
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(args.month)) {
      throw new ConvexError("Invalid month format. Expected YYYY-MM.");
    }

    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Not authenticated");

    // Validate all limits > 0
    for (const b of args.budgets) {
      if (b.monthlyLimit <= 0) {
        throw new ConvexError(
          `Budget for "${b.category}" must be greater than ₱0.`
        );
      }
    }

    // Detect duplicate categories in the payload
    const payloadCategories = new Set(args.budgets.map((b) => b.category));
    if (payloadCategories.size !== args.budgets.length) {
      throw new ConvexError("Duplicate categories found in the payload.");
    }

    const existing = await ctx.db
      .query("budgets")
      .withIndex("by_user_and_month", (q) =>
        q.eq("userId", userId).eq("month", args.month)
      )
      .collect();


    // Upsert: update existing or insert new
    for (const budget of args.budgets) {
      const existingBudget = existing.find((e) => e.category === budget.category);
      if (existingBudget) {
        await ctx.db.patch(existingBudget._id, {
          monthlyLimit: budget.monthlyLimit,
          icon: budget.icon,
          description: budget.description,
        });
      } else {
        await ctx.db.insert("budgets", {
          userId,
          category: budget.category,
          icon: budget.icon,
          description: budget.description,
          monthlyLimit: budget.monthlyLimit,
          month: args.month,
        });
      }
    }

    // Delete: remove categories not in the payload
    for (const existingBudget of existing) {
      if (!payloadCategories.has(existingBudget.category)) {
        await ctx.db.delete(existingBudget._id);
      }
    }
  },
});

/**
 * Returns custom categories created by the user for the given month.
 */
export const getCustomCategories = query({
  args: { month: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const budgets = await ctx.db
      .query("budgets")
      .withIndex("by_user_and_month", q =>
        q.eq("userId", userId).eq("month", args.month)
      )
      .collect();

    // Return only categories not in the standard EXPENSE_CATEGORIES list
    const standardValues = [
      "Food & Dining", "Transportation", "Load & Bills",
      "Rent", "Shopping", "Savings", "Others"
    ];

    return budgets
      .filter(b => !standardValues.includes(b.category))
      .map(b => ({
        value: b.category,
        label: b.category,
        icon: b.icon || "more-horizontal",
        description: b.description,
      }));
  },
});

export const patchBudget = internalMutation({
  args: {
    id: v.id("budgets"),
    monthlyLimit: v.number(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      monthlyLimit: args.monthlyLimit,
      ...(args.description !== undefined ? { description: args.description } : {}),
    });
  },
});

export const insertBudget = internalMutation({
  args: {
    userId: v.id("users"),
    category: v.string(),
    monthlyLimit: v.number(),
    month: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("budgets", {
      userId: args.userId,
      category: args.category,
      monthlyLimit: args.monthlyLimit,
      month: args.month,
      description: args.description,
    });
  },
});
