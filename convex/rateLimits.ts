// convex/rateLimits.ts
// Rate limiting definitions for the Ipon authentication layer.
// Uses token bucket: allows 5 failed login attempts per 15 minutes per email.
// After exhausting the bucket, the user must wait before retrying.
import { RateLimiter, MINUTE } from "@convex-dev/rate-limiter";
import { components } from "./_generated/api";

export const rateLimiter = new RateLimiter(components.rateLimiter, {
  // 5 failed login attempts per 15-minute window, per email
  failedLogin: {
    kind: "token bucket",
    rate: 5,
    period: 15 * MINUTE,
    capacity: 5,
  },
});
