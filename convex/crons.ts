// convex/crons.ts
// Scheduled jobs for automated maintenance tasks.
import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Delete chat messages older than 7 days — manages Convex free tier storage
crons.daily(
  "clear old chat messages",
  { hourUTC: 0, minuteUTC: 0 },
  internal.chat.clearOldMessages
);

export default crons;
