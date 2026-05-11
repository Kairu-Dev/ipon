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

    const trimmedName = args.name.trim();
    if (trimmedName.length === 0) {
      throw new ConvexError("Goal name cannot be empty");
    }

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

    const isCompleted = initialDeposit >= args.targetAmount;
    const completedAt = isCompleted ? args.date : undefined;

    const goalId = await ctx.db.insert("goals", {
      userId,
      name: trimmedName,
      icon: args.icon,
      targetAmount: args.targetAmount,
      savedAmount: initialDeposit,
      deadline: args.deadline,
      isCompleted,
      ...(completedAt && { completedAt }),
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

export const getGoal = query({
  args: { id: v.id("goals") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Not authenticated");
    
    const goal = await ctx.db.get(args.id);
    if (!goal || goal.userId !== userId) return null;
    
    return goal;
  },
});

export const contributeToGoal = mutation({
  args: {
    goalId: v.id("goals"),
    amount: v.number(),
    date: v.string(), // ISO date string "YYYY-MM-DD"
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new ConvexError("Not authenticated");

    const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!isoDateRegex.test(args.date)) {
      throw new ConvexError("Invalid date format. Expected YYYY-MM-DD");
    }

    if (args.amount <= 0) {
      throw new ConvexError("Amount must be greater than 0");
    }

    const goal = await ctx.db.get(args.goalId);
    if (!goal || goal.userId !== userId) {
      throw new ConvexError("Goal not found");
    }

    const newSavedAmount = goal.savedAmount + args.amount;
    const isNowCompleted = newSavedAmount >= goal.targetAmount;
    
    // Only update completion state if it wasn't already completed
    const completionUpdate = (!goal.isCompleted && isNowCompleted) 
      ? { isCompleted: true, completedAt: args.date }
      : {};

    await ctx.db.patch(args.goalId, {
      savedAmount: newSavedAmount,
      ...completionUpdate,
    });

    await ctx.db.insert("transactions", {
      userId,
      type: "expense",
      title: `${goal.name} contribution`,
      amount: args.amount,
      category: "Savings",
      paymentMethod: "Main Savings",
      date: args.date,
    });
  },
});
