// convex/convex.config.ts
// Convex component configuration.
// Registers the rate-limiter component for brute-force login protection.
import { defineApp } from "convex/server";
import rateLimiter from "@convex-dev/rate-limiter/convex.config.js";

const app = defineApp();
app.use(rateLimiter);

export default app;
