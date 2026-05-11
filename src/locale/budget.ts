// src/locale/budget.ts
// Static strings for the budget feature.
// Centralised here for future i18n readiness.

export const BUDGET_STRINGS = {
  // Page header
  PAGE_TITLE: "Budget Setup",
  PAGE_SUBTITLE: "Manage your monthly spending limits.",
  BTN_SAVE: "Save Changes",
  BTN_SAVING: "Saving…",

  // Summary card
  SUMMARY_TITLE: "Total Remaining",
  SUMMARY_SPENT_LABEL: "Spent / Budgeted",
  SUMMARY_USED: "Used",
  SUMMARY_LEFT: "Left",

  // Income allocated card
  INCOME_TITLE: "Income Allocated",
  INCOME_ALLOCATED: "Allocated",
  INCOME_UNALLOCATED_SUFFIX: "unallocated funds",
  INCOME_ON_TRACK: "On Track",
  INCOME_OVER_ALLOCATED: "Over Allocated",

  // Category rows
  CATEGORIES_HEADING: "Expense Categories",
  BTN_ADD_CATEGORY: "Add Category",
  LABEL_SPENT: "Spent",
  CURRENCY_SYMBOL: "₱",

  // Add category modal
  ADD_MODAL_TITLE: "Add Custom Category",
  ADD_MODAL_NAME_LABEL: "Category Name",
  ADD_MODAL_NAME_PLACEHOLDER: "e.g. Entertainment",
  ADD_MODAL_LIMIT_LABEL: "Monthly Limit",
  ADD_MODAL_LIMIT_PLACEHOLDER: "0",
  ADD_MODAL_BTN_ADD: "Add Category",
  ADD_MODAL_BTN_CANCEL: "Cancel",

  // Validation
  ERROR_BUDGET_ZERO: "Budget must be greater than ₱0",
  ERROR_CATEGORY_REQUIRED: "Category name is required",

  // Loading / empty
  LOADING: "Loading budgets…",
  NO_BUDGETS: "No budgets set for this month.",
} as const;
