// src/locale/transactions.ts
// Temporary location for all transaction-related strings (i18n ready)

export const TRANSACTIONS_STRINGS = {
  // Modal Headings
  MODAL_TITLE: "Add Transaction",

  // Tabs / Types
  TYPE_INCOME: "Income",
  TYPE_EXPENSE: "Expense",

  // Labels
  LABEL_AMOUNT: "Amount",
  LABEL_TITLE: "Title",
  LABEL_CATEGORY: "Category",
  LABEL_PAYMENT_METHOD: "Payment Method",
  LABEL_DATE: "Date",
  LABEL_NOTE: "Note (Optional)",

  // Placeholders
  PLACEHOLDER_AMOUNT: "0",
  PLACEHOLDER_TITLE_EXPENSE: "e.g. Jollibee Lunch",
  PLACEHOLDER_TITLE_INCOME: "e.g. Freelance project",
  PLACEHOLDER_NOTE: "e.g. Lunch with coworkers",
  PLACEHOLDER_SELECT: "Select...",

  // Buttons
  BTN_SAVE: "Save Entry",
  BTN_SAVING: "Saving...",

  // AI Suggestion
  AI_SUGGESTION_LABEL: "AI Suggestion:",
  AI_SUGGESTION_ACTION: "Fill",

  // Currency
  CURRENCY_SYMBOL: "₱",
} as const;
