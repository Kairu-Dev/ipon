export const EXPENSE_CATEGORIES = [
  { value: "Food & Dining",   label: "Food",     icon: "utensils" },
  { value: "Transportation",  label: "Transpo",  icon: "bus" },
  { value: "Load & Bills",    label: "Load",     icon: "wifi" },
  { value: "Rent",            label: "Rent",     icon: "home" },
  { value: "Shopping",        label: "Shopping", icon: "shopping-bag" },
  { value: "Others",          label: "Others",   icon: "more-horizontal" },
] as const;

export const INCOME_CATEGORIES = [
  { value: "Salary",     label: "Salary",     icon: "briefcase" },
  { value: "Allowance",  label: "Allowance",  icon: "layout" },
  { value: "Freelance",  label: "Freelance",  icon: "monitor" },
  { value: "Others",     label: "Others",     icon: "more-horizontal" },
] as const;

export const PAYMENT_METHODS = [
  "Cash",
  "Debit Card",
  "GCash",
  "Bank Transfer",
  "Others",
] as const;
