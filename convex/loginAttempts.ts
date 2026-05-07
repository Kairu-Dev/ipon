// convex/loginAttempts.ts
// Server-side functions for login rate limiting.
// checkLoginAllowed: called BEFORE signIn() to verify the email isn't rate-limited.
// recordFailedLogin: called AFTER a failed signIn() to consume a token.
// resetLoginAttempts: called AFTER a successful signIn() to clear the bucket.
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { rateLimiter } from "./rateLimits";

// Check if this email is allowed to attempt login
export const checkLoginAllowed = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const status = await rateLimiter.check(ctx, "failedLogin", {
      key: email,
    });
    return {
      ok: status.ok,
      retryAfter: status.retryAfter ?? 0,
    };
  },
});

// Record a failed login attempt (consumes one token)
export const recordFailedLogin = mutation({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    await rateLimiter.limit(ctx, "failedLogin", {
      key: email,
    });
  },
});

// Reset attempts after successful login
export const resetLoginAttempts = mutation({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    await rateLimiter.reset(ctx, "failedLogin", {
      key: email,
    });
  },
});
