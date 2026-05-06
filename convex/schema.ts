// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
    ...authTables,
    users: defineTable({
        name: v.optional(v.string()),
        email: v.optional(v.string()),
        emailVerificationTime: v.optional(v.number()),
        isAnonymous: v.optional(v.boolean()),
    }).index("email", ["email"]),
    transactions: defineTable({
        userId: v.id("users"),
        type: v.union(v.literal("income"), v.literal("expense")),
        amount: v.number(),
        category: v.string(),
        date: v.string(),
        note: v.optional(v.string()),
    })
        .index("by_user", ["userId"])
        .index("by_user_and_date", ["userId", "date"]),
    goals: defineTable({
        userId: v.id("users"),
        name: v.string(),
        icon: v.string(),
        targetAmount: v.number(),
        savedAmount: v.number(),
        deadline: v.string(),
        isCompleted: v.boolean(),
    }).index("by_user", ["userId"]),
    budgets: defineTable({
        userId: v.id("users"),
        category: v.string(),
        monthlyLimit: v.number(),
        month: v.string(),
    })
        .index("by_user", ["userId"])
        .index("by_user_and_month", ["userId", "month"]),
});