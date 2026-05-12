// convex/users.ts
// Queries for the users table.
// Uses getAuthUserId(ctx) — never tokenIdentifier — per Ipon standards.
import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Returns the current authenticated user's document, or null if not logged in.
// Used by the dashboard greeting to display the user's name.
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return await ctx.db.get(userId);
  },
});
