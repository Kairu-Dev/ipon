import { mutation, query, internalQuery } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { getCurrentUserId } from "./lib/auth";

/**
 * Returns the current authenticated user's document, or null if not logged in.
 * Used by the dashboard greeting and profile views.
 */
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getCurrentUserId(ctx);
    if (!userId) return null;
    return await ctx.db.get(userId);
  },
});

/**
 * Upserts a user record for the authenticated Clerk user.
 * Reads verified identity claims from the session token.
 * Returns the users._id.
 */
export const ensureUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    const clerkId = identity.subject;
    const name = identity.name ? String(identity.name) : undefined;
    const email = identity.email ? String(identity.email) : undefined;

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .unique();

    if (existingUser) {
      const updates: { name?: string; email?: string } = {};
      if (name && existingUser.name !== name) updates.name = name;
      if (email && existingUser.email !== email) updates.email = email;
      if (Object.keys(updates).length > 0) {
        await ctx.db.patch(existingUser._id, updates);
      }
      return existingUser._id;
    }

    return await ctx.db.insert("users", {
      clerkId,
      name,
      email,
    });
  },
});

/**
 * Internal query used by action-safe helpers to resolve users._id from clerkId.
 */
export const getIdByClerkId = internalQuery({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .unique();
    return user ? user._id : null;
  },
});

/**
 * Updates financial preferences for the authenticated user.
 */
export const updatePreferences = mutation({
  args: {
    currency: v.optional(v.string()),
    defaultPaymentMethod: v.optional(v.string()),
    paydayCycle: v.optional(v.string()),
    aiSuggestions: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Not authenticated");
    }

    const clerkId = identity.subject;
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .unique();

    if (!user) {
      throw new ConvexError("User not found");
    }

    const updates: {
      currency?: string;
      defaultPaymentMethod?: string;
      paydayCycle?: string;
      aiSuggestions?: boolean;
    } = {};

    if (args.currency !== undefined) updates.currency = args.currency;
    if (args.defaultPaymentMethod !== undefined) updates.defaultPaymentMethod = args.defaultPaymentMethod;
    if (args.paydayCycle !== undefined) updates.paydayCycle = args.paydayCycle;
    if (args.aiSuggestions !== undefined) updates.aiSuggestions = args.aiSuggestions;

    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(user._id, updates);
    }

    return user._id;
  },
});

