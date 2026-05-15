"use client";

// src/components/budget/budget-category-row.tsx
// A single editable budget category row with icon, progress, limit input, and delete.
import { ICON_MAP } from "@/constants/icons";
import { CATEGORY_SUBTITLES, BUDGET_STATUS_STYLES } from "@/constants/budget";
import { formatCurrency } from "@/lib/formatters";
import { BUDGET_STRINGS as t } from "@/locale/budget";
import { getBudgetStatus, getBudgetPercentage } from "@/lib/budget";
import { MoreHorizontal, Trash2 } from "lucide-react";

interface BudgetCategoryRowProps {
  /** The category value string (e.g. "Food & Dining") */
  category: string;
  /** The icon key matching ICON_MAP (e.g. "utensils") */
  icon: string;
  /** Current month spent amount for this category */
  spent: number;
  /** The editable monthly limit value — empty string means no limit set */
  limitValue: string;
  /** Optional custom description */
  description?: string;
  /** Called when the limit input changes */
  onLimitChange: (value: string) => void;
  /** Called when the delete button is clicked */
  onDelete: () => void;
}

export function BudgetCategoryRow({
  category,
  icon,
  spent,
  limitValue,
  description,
  onLimitChange,
  onDelete,
}: BudgetCategoryRowProps) {
  const Icon = ICON_MAP[icon as keyof typeof ICON_MAP] || MoreHorizontal;
  const subtitle = description || CATEGORY_SUBTITLES[category] || "Custom category";
  const limit = parseFloat(limitValue);
  const hasLimit = !isNaN(limit) && limit > 0;

  // Calculate percentage and determine if the limit value is invalid (zero)
  const status = getBudgetStatus(spent, hasLimit ? limit : null);
  const styles = BUDGET_STATUS_STYLES[status];
  const displayPercentage = hasLimit ? Math.round((spent / limit) * 100) : 0; // uncapped — for label
  const barPercentage = getBudgetPercentage(spent, hasLimit ? limit : null); // capped at 100 — for bar width
  const isZeroError = limitValue.trim() !== "" && (limit === 0 || (limitValue.trim() !== "" && !isNaN(limit) && limit <= 0));

  // Progress bar rendering (shared between desktop and mobile)
  const progressBar = hasLimit ? (
    <div>
      <div className="flex justify-between items-center font-label-xs text-label-xs mb-1.5">
        <span className={status === "exceeded" ? styles.text : "text-on-surface-variant"}>
          {t.LABEL_SPENT} {formatCurrency(spent)}
        </span>
        <div className="flex items-center gap-2">
          {styles.showPill && (
            <span className="bg-error text-on-error px-2 py-0.5 rounded-full font-label-xs">
              OVER BUDGET
            </span>
          )}
          <span className={`${styles.text} font-medium`}>{displayPercentage}%</span>
        </div>
      </div>
      <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${styles.bar}`}
          style={{ width: `${barPercentage}%` }}
        ></div>
      </div>
    </div>
  ) : spent > 0 ? (
    <div>
      <span className="font-label-xs text-label-xs text-on-surface-variant">
        {t.LABEL_SPENT} {formatCurrency(spent)}
      </span>
    </div>
  ) : null;

  return (
    <div className="category-row">
      {/* Icon + Name + Subtitle */}
      <div className="flex items-center gap-4 flex-1">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${styles.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-label-md text-label-md text-on-surface">{category}</h4>
          {subtitle && (
            <p className="font-label-xs text-label-xs text-on-surface-variant mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Desktop Progress */}
      <div className="desktop-progress-panel">
        {progressBar}
      </div>

      {/* Limit Input + Delete */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 font-body-sm text-on-surface-variant">
            {t.CURRENCY_SYMBOL}
          </span>
          <input
            className={isZeroError ? "category-input-error" : `category-input ${styles.inputBorder}`}
            type="number"
            value={limitValue}
            onChange={(e) => onLimitChange(e.target.value)}
            placeholder="Set Limit"
            min="0"
          />
        </div>
        <button
          type="button"
          onClick={onDelete}
          className="delete-button"
          aria-label={`Delete ${category} budget`}
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile Progress */}
      <div className="mobile-progress-panel">
        {progressBar}
      </div>

      {/* Zero error message */}
      {isZeroError && (
        <p className="text-error font-label-xs w-full text-right pr-14 -mt-2">
          {t.ERROR_BUDGET_ZERO}
        </p>
      )}
    </div>
  );
}
