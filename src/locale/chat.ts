// src/locale/chat.ts
// Static text strings for the AI chat feature.
export const CHAT_STRINGS = {
  // Page header
  PAGE_TITLE: "Chat with Ipon",
  PAGE_SUBTITLE: "Ask me anything about your finances",

  // Input
  INPUT_PLACEHOLDER: "Ask about your finances...",
  SEND_BUTTON: "Send",
  CHAR_LIMIT: 300,

  // Disclaimer
  DISCLAIMER:
    "AI can make mistakes. Consider verifying important financial information.",

  // Confirmation card
  CONFIRM_TRANSACTION_TITLE: "I'll log this for you:",
  CONFIRM_GOAL_TITLE: "I'll contribute to your goal:",
  CONFIRM_YES: "Yes, do it",
  CONFIRM_CANCEL: "Cancel",

  // Action results
  ACTION_CANCELLED: "No problem! Let me know if you need anything else.",

  // Error
  ERROR_TITLE: "Something went wrong",
  ERROR_RETRY: "Retry",

  // Suggestion chips
  CHIP_AFFORD: "Can I afford a ₱3,000 purchase?",
  CHIP_SUMMARIZE_TEMPLATE: "Summarize my {month} spending",
  CHIP_LOWER_TEMPLATE: "How do I lower my {category} costs?",

  // Sidebar
  SIDEBAR_TITLE: "Monthly Overview",
  SIDEBAR_INCOME: "Income",
  SIDEBAR_EXPENSES: "Expenses",
  SIDEBAR_BALANCE: "Remaining",
  SIDEBAR_TOP_SPENDING: "Top Spending",
  SIDEBAR_RECENT: "Recent Transactions",

  // Empty state
  EMPTY_STATE: "Start a conversation with Ipon — your personal finance assistant.",

  // Loading
  LOADING: "Thinking...",
} as const;
