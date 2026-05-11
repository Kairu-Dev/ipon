// src/locale/goals.ts
// Centralized location for Savings Goals static strings (i18n ready)

export const GOALS_STRINGS = {
  // Empty State
  EMPTY_STATE_TITLE: "No Savings Goals Yet",
  EMPTY_STATE_DESC: "Start building your future by setting up a savings goal. We'll help you track your progress.",

  // Create Goal Modal
  MODAL_TITLE: "Create New Goal",
  LABEL_ICON: "Choose an Icon",
  LABEL_NAME: "Goal Name",
  PLACEHOLDER_NAME: "e.g. Japan Trip 2024",
  LABEL_TARGET: "Target Amount",
  PLACEHOLDER_TARGET: "0.00",
  LABEL_DEPOSIT: "Initial Deposit",
  LABEL_OPTIONAL: "Optional",
  LABEL_DEADLINE: "Target Deadline",
  BTN_SUBMIT: "Create Goal",
  BTN_SUBMITTING: "Creating...",
  BTN_CANCEL: "Cancel",
  ERR_GENERIC_CREATE: "Failed to create goal",

  // Goal Card
  LABEL_ACHIEVED: "Achieved",
  LABEL_SAVED: "Saved",
  LABEL_COMPLETED: "Completed",

  // Contribute Panel
  PANEL_TITLE: "Contribute to Goal",
  LABEL_CURRENT_BALANCE: "Current Balance",
  LABEL_REMAINING: "Remaining",
  LABEL_AMOUNT_TO_ADD: "Amount to Add",
  LABEL_FROM_ACCOUNT: "From Account",
  MAIN_SAVINGS: "Main Savings",
  LABEL_AVAILABLE: "Available",
  BTN_ADD_CONTRIBUTION: "Add Contribution",
  WARNING_EXCEEDS_BALANCE_1: "This contribution exceeds your available balance by ",
  WARNING_EXCEEDS_BALANCE_2: ". You can still proceed, but your balance will go negative.",
} as const;
