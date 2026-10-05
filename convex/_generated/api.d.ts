/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as budgets from "../budgets.js";
import type * as chat from "../chat.js";
import type * as constants from "../constants.js";
import type * as crons from "../crons.js";
import type * as goals from "../goals.js";
import type * as insights from "../insights.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_gemini_chat from "../lib/gemini/chat.js";
import type * as lib_gemini_client from "../lib/gemini/client.js";
import type * as lib_gemini_index from "../lib/gemini/index.js";
import type * as lib_gemini_prompts from "../lib/gemini/prompts.js";
import type * as transactions from "../transactions.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  budgets: typeof budgets;
  chat: typeof chat;
  constants: typeof constants;
  crons: typeof crons;
  goals: typeof goals;
  insights: typeof insights;
  "lib/auth": typeof lib_auth;
  "lib/gemini/chat": typeof lib_gemini_chat;
  "lib/gemini/client": typeof lib_gemini_client;
  "lib/gemini/index": typeof lib_gemini_index;
  "lib/gemini/prompts": typeof lib_gemini_prompts;
  transactions: typeof transactions;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
