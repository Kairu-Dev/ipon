# US-11: AI Spending Insights Implementation Plan

## Objective
Implement an AI-powered spending insight feature that analyzes the last 30 days of transactions, highlights overspending, and provides actionable advice using the Gemini API.

## Technical Architecture
Since Convex actions run in isolated V8 environments without direct DB access, the logic must be split across:
1. **Public Query** (`getInsight`): Returns the current cached insight for the user, if any.
2. **Internal Query** (`getInsightData`): Fetches the last 30 days of transactions, current budget limits, and the latest insight to check cache validity and manual regen limits.
3. **Action** (`generateInsight`): Validates auth, runs the internal query to check cache/limits, calls the Gemini API, and then calls the internal mutation to save the result.
4. **Internal Mutation** (`saveInsight`): Stores the parsed Gemini response into the database.

## Tasks

### 1. Schema Update (`convex/schema.ts`)
- Add the `insights` table with fields: `userId`, `content`, `generatedAt`, `manualRegenCount`, `manualRegenResetAt`, `transactionCount`.
- Add index `by_user` on `userId`.

### 2. Backend Logic (`convex/insights.ts`)
- **Query `getInsight`**: Fetch latest insight for `getAuthUserId(ctx)`.
- **Internal Query `getInsightData`**: 
  - Fetch latest insight.
  - Check manual regen count if `force=true`.
  - Fetch last 30 days of transactions (calculate category breakdown).
  - Fetch budget limits.
  - Return `{ insight, transactions, budgets, isCached, transactionCount }`.
- **Action `generateInsight`**: 
  - Call `getInsightData`. 
  - If cached and not forced, return cached.
  - If `transactionCount < 5`, return fallback message.
  - Construct prompt and call `askGemini`.
  - Parse JSON and sanitize response.
  - Call `saveInsight` mutation.
- **Internal Mutation `saveInsight`**: Insert or update the insight and increment manual regen counters if forced.

### 3. Frontend Component (`src/components/dashboard/ipon-ai-insights.tsx`)
- Implement the `IponAIInsights` component based on the mockup in `src/app/dashboard/page.tsx`.
- Use `useQuery(api.insights.getInsight)`.
- Trigger `generateInsight` action on mount if no valid cache exists.
- Render SMART ALERT badge, detail, and bullets.
- Render Refresh button with 3 pips for manual regeneration.
- Handle fallback and error states.

### 4. Integration
- Replace static HTML in `src/app/dashboard/page.tsx` with `<IponAIInsights />`.
- Export component from `src/components/dashboard/index.ts`.

## Verification
- Ensure `getInsightData` correctly filters transactions for the last 30 days.
- Ensure manual regen count respects the 3-per-day limit and resets correctly based on the `YYYY-MM-DD` date string.
- Ensure UI properly handles loading, fallback, error, and success states.
