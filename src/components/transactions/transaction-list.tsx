"use client";

import { useState, useMemo } from "react";
import { usePaginatedQuery, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { EmptyTransactionState } from "./empty-transaction-state";
import { TransactionRow } from "./transaction-row";
import { groupByDate } from "@/lib/transactions";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/constants/transactions";

/** All unique categories merged for the "All" type filter. */
const ALL_CATEGORIES = Array.from(
  new Map([...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES].map((c) => [c.value, c])).values()
);

/**
 * Main transaction history list with type/category filters and pagination.
 * Filter state is local (useState) — not Zustand — because it's
 * ephemeral, page-specific UI state that doesn't need to persist.
 */
export function TransactionList() {
  // Local filter state — ephemeral, page-scoped, no Zustand needed
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("All Categories");

  // Fetch custom categories to resolve icons for custom categories
  const currentMonth = useMemo(() => {
    const pad = (n: number) => String(n).padStart(2, "0");
    const currentDate = new Date();
    return `${currentDate.getFullYear()}-${pad(currentDate.getMonth() + 1)}`;
  }, []);

  const customCategories = useQuery(api.budgets.getCustomCategories, { month: currentMonth });

  // Create a mapping of category name -> icon for quick lookup in rows
  const customIconMap = useMemo(() => {
    return new Map(customCategories?.map(c => [c.value, c.icon]) ?? []);
  }, [customCategories]);

  // Build strongly-typed query args — only include filters when active
  const queryArgs: {
    type?: "income" | "expense";
    category?: string;
  } = {};
  if (typeFilter !== "all") queryArgs.type = typeFilter;
  if (categoryFilter !== "All Categories") queryArgs.category = categoryFilter;

  // Convex paginated query — fetches 10 items at a time, ordered desc by date
  const { results, status, loadMore } = usePaginatedQuery(
    api.transactions.getTransactions,
    queryArgs,
    { initialNumItems: 10 },
  );

  // Group flat results into date-labeled sections for display
  const groupedTransactions = groupByDate(results);

  // Determine which categories to show based on the selected type filter
  const displayedCategories =
    typeFilter === "income"
      ? INCOME_CATEGORIES
      : typeFilter === "expense"
        ? EXPENSE_CATEGORIES
        : ALL_CATEGORIES;

  return (
    <div className="flex flex-col gap-6">
      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-[0_2px_4px_-2px_rgb(0,0,0,0.05)]">
        {/* Type toggle: All / Income / Expense */}
        <div className="flex items-center gap-2">
          {(["all", "income", "expense"] as const).map((type) => (
            <button
              key={type}
              onClick={() => {
                setTypeFilter(type);
                setCategoryFilter("All Categories");
              }}
              className={`px-4 py-2 rounded-lg font-label-md text-label-md transition-colors ${
                typeFilter === type
                  ? "bg-surface-container-high text-on-surface"
                  : "text-on-surface-variant hover:bg-surface-container"
              }`}
            >
              {type === "all" ? "All" : type === "income" ? "Income" : "Expense"}
            </button>
          ))}
        </div>

        {/* Category dropdown */}
        <div className="relative">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="appearance-none bg-surface border border-outline-variant text-on-surface font-body-sm text-body-sm rounded-lg pl-4 pr-10 py-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none cursor-pointer"
            aria-label="Category filter"
          >
            <option value="All Categories">All Categories</option>
            {displayedCategories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.value}
              </option>
            ))}
          </select>
          <span
            className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none"
            aria-hidden="true"
          >
            expand_more
          </span>
        </div>
      </div>

      {/* Transaction list content */}
      {status === "LoadingFirstPage" ? (
        <div className="p-8 text-center text-secondary">Loading...</div>
      ) : results.length === 0 ? (
        <EmptyTransactionState />
      ) : (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-[0_4px_6px_-1px_rgb(0,0,0,0.05)] overflow-hidden">
          {groupedTransactions.map((group) => (
            <div key={group.date} className="border-b border-surface-container last:border-0">
              {/* Date group header */}
              <div className="bg-surface-container-low px-6 py-2 border-b border-surface-container">
                <span className="font-label-md text-label-md text-on-surface-variant">
                  {group.dateLabel}
                </span>
              </div>
              {/* Transactions within this date */}
              <div className="flex flex-col">
                {group.transactions.map((tx) => (
                  <TransactionRow 
                    key={tx._id} 
                    transaction={tx} 
                    customIcon={customIconMap.get(tx.category)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load More button — only shown when more pages are available */}
      {status === "CanLoadMore" && (
        <div className="flex justify-center mt-4">
          <button
            onClick={() => loadMore(10)}
            className="border border-primary text-primary font-label-md text-label-md px-6 py-3 rounded-lg hover:bg-primary-container hover:text-on-primary-container hover:border-transparent transition-all active:scale-95 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
              refresh
            </span>
            Load more transactions
          </button>
        </div>
      )}
    </div>
  );
}
