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
        title: v.string(),
        amount: v.number(),
        category: v.string(),
        paymentMethod: v.string(),
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
        completedAt: v.optional(v.string()),
    }).index("by_user", ["userId"]),
    budgets: defineTable({
        userId: v.id("users"),
        category: v.string(),
        monthlyLimit: v.number(),
        month: v.string(),
    })
        .index("by_user", ["userId"])
        .index("by_user_and_month", ["userId", "month"]),
    insights: defineTable({
        userId: v.id("users"),
        content: v.string(),              // sanitized insight JSON from Gemini
        generatedAt: v.string(),           // ISO datetime "YYYY-MM-DDTHH:mm:ss"
        manualRegenCount: v.number(),      // how many manual regens used today (0-3)
        manualRegenResetAt: v.string(),    // ISO date "YYYY-MM-DD" — resets daily
        transactionCount: v.number(),      // number of transactions used to generate
    }).index("by_user", ["userId"]),
});