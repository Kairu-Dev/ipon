import { mutation, query } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getGoals = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    
    return await ctx.db
      .query("goals")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const createGoal = mutation({
  args: {
    name: v.string(),
    icon: v.string(),
    targetAmount: v.number(),
    initialDeposit: v.optional(v.number()),
    deadline: v.string(),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Not authenticated");

    if (args.targetAmount <= 0 || args.targetAmount > 9999999) {
      throw new ConvexError("Target amount must be between ₱1 and ₱9,999,999");
    }

    const initialDeposit = args.initialDeposit ?? 0;
    if (initialDeposit > args.targetAmount) {
      throw new ConvexError("Initial deposit cannot exceed target amount");
    }

    if (initialDeposit < 0) {
      throw new ConvexError("Initial deposit cannot be negative");
    }

    if (args.deadline < args.date) {
      throw new ConvexError("Deadline must be in the future");
    }

    const goalId = await ctx.db.insert("goals", {
      userId,
      name: args.name.trim(),
      icon: args.icon,
      targetAmount: args.targetAmount,
      savedAmount: initialDeposit,
      deadline: args.deadline,
      isCompleted: false,
    });

    if (initialDeposit > 0) {
      await ctx.db.insert("transactions", {
        userId,
        type: "expense",
        title: `Goal Deposit: ${args.name.trim()}`,
        amount: initialDeposit,
        category: "Savings",
        paymentMethod: "Main Savings",
        date: args.date,
      });
    }

    return goalId;
  },
});
