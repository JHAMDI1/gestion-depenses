/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as analytics from "../analytics.js";
import type * as balance from "../balance.js";
import type * as budgets from "../budgets.js";
import type * as categories from "../categories.js";
import type * as crons from "../crons.js";
import type * as debts from "../debts.js";
import type * as goals from "../goals.js";
import type * as helpers_security from "../helpers/security.js";
import type * as http from "../http.js";
import type * as recurring_generator from "../recurring_generator.js";
import type * as recurrings from "../recurrings.js";
import type * as stats from "../stats.js";
import type * as transactions from "../transactions.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  analytics: typeof analytics;
  balance: typeof balance;
  budgets: typeof budgets;
  categories: typeof categories;
  crons: typeof crons;
  debts: typeof debts;
  goals: typeof goals;
  "helpers/security": typeof helpers_security;
  http: typeof http;
  recurring_generator: typeof recurring_generator;
  recurrings: typeof recurrings;
  stats: typeof stats;
  transactions: typeof transactions;
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
