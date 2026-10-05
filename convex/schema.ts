// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
export default defineSchema({
    users: defineTable({
        clerkId: v.string(),
        name: v.optional(v.string()),
        email: v.optional(v.string()),
        currency: v.optional(v.string()),
        defaultPaymentMethod: v.optional(v.string()),
        paydayCycle: v.optional(v.string()),
        aiSuggestions: v.optional(v.boolean()),
    })
        .index("by_clerk_id", ["clerkId"])
        .index("email", ["email"]),
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
        icon: v.optional(v.string()),
        description: v.optional(v.string()),
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
    chatMessages: defineTable({
        userId: v.id("users"),
        role: v.union(v.literal("user"), v.literal("assistant")),
        content: v.string(),
        createdAt: v.string(), // ISO datetime
    })
        .index("by_user", ["userId"])
        .index("by_created_at", ["createdAt"]), // for cron cleanup
});