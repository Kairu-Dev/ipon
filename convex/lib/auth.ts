import { ConvexError } from "convex/values";
import { QueryCtx, MutationCtx, ActionCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";
import { internal } from "../_generated/api";

/**
 * Returns the current authenticated user's Convex users._id, or null if unauthenticated
 * or if ensureUser has not yet created the record.
 */
export async function getCurrentUserId(
  ctx: { auth: { getUserIdentity: () => Promise<{ subject: string } | null> }; db: any }
): Promise<Id<"users"> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", identity.subject))
    .unique();

  return user ? (user._id as Id<"users">) : null;
}

/**
 * Ensures the user is authenticated and returns their Convex users._id.
 * Throws ConvexError("Not authenticated") if unauthenticated or not yet registered.
 */
export async function requireUserId(
  ctx: { auth: { getUserIdentity: () => Promise<{ subject: string } | null> }; db: any }
): Promise<Id<"users">> {
  const userId = await getCurrentUserId(ctx);
  if (!userId) {
    throw new ConvexError("Not authenticated");
  }
  return userId;
}

/**
 * Action-safe helper to resolve the Convex users._id.
 * Actions do not have ctx.db, so this queries internal.users.getIdByClerkId.
 */
export async function getUserIdFromAction(
  ctx: { auth: { getUserIdentity: () => Promise<{ subject: string } | null> }; runQuery: any }
): Promise<Id<"users"> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;

  return await ctx.runQuery(internal.users.getIdByClerkId, {
    clerkId: identity.subject,
  });
}
