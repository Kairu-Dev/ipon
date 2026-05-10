import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/constants/transactions";
import { Utensils, Bus, Wifi, Home, ShoppingBag, MoreHorizontal, Briefcase, Layout, Monitor } from "lucide-react";
import { Doc } from "../../../convex/_generated/dataModel";

/**
 * Static mapping from category icon string → Lucide component.
 * Matches the same pattern used in AddTransactionModal.
 */
const ICON_MAP = {
  utensils: Utensils,
  bus: Bus,
  wifi: Wifi,
  home: Home,
  "shopping-bag": ShoppingBag,
  "more-horizontal": MoreHorizontal,
  briefcase: Briefcase,
  layout: Layout,
  monitor: Monitor,
} as const;

/** All categories merged so we can look up icon metadata by value. */
const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

/**
 * Renders a single transaction row with icon, title, category, and amount.
 * Used inside TransactionList grouped by date.
 */
export function TransactionRow({ transaction }: { transaction: Doc<"transactions"> }) {
  const isIncome = transaction.type === "income";

  // Look up the icon component for this category
  const categoryMeta = ALL_CATEGORIES.find((c) => c.value === transaction.category);
  const Icon =
    categoryMeta && ICON_MAP[categoryMeta.icon as keyof typeof ICON_MAP]
      ? ICON_MAP[categoryMeta.icon as keyof typeof ICON_MAP]
      : MoreHorizontal;

  // Format the amount with PHP currency formatting
  const formatCurrency = (amount: number) => {
    const formatted = new Intl.NumberFormat("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
    return isIncome ? `+₱${formatted}` : `-₱${formatted}`;
  };

  return (
    <div className="flex items-center justify-between px-6 py-4 hover:bg-surface-container-low transition-colors group cursor-pointer border-b border-surface-container last:border-0">
      <div className="flex items-center gap-4">
        {/* Category icon circle — income gets primary tint, expense gets tertiary */}
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center ${
            isIncome
              ? "bg-primary-fixed text-on-primary-fixed"
              : "bg-tertiary-fixed text-on-tertiary-fixed"
          }`}
        >
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex flex-col">
          {/* title is a required schema field — always present */}
          <span className="font-body-base text-body-base font-semibold text-on-surface">
            {transaction.title}
          </span>
          {/* paymentMethod is a required schema field — no fallback needed */}
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            {transaction.category} • {transaction.paymentMethod}
          </span>
        </div>
      </div>
      {/* Amount — green for income, red for expense */}
      <span
        className={`font-currency text-currency ${isIncome ? "text-primary" : "text-error"}`}
      >
        {formatCurrency(transaction.amount)}
      </span>
    </div>
  );
}
