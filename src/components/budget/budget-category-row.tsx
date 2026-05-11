"use client";

// src/components/budget/budget-category-row.tsx
// A single editable budget category row with icon, progress, limit input, and delete.
import { ICON_MAP } from "@/constants/icons";
import { CATEGORY_SUBTITLES } from "@/constants/budget";
import { formatCurrency } from "@/lib/formatters";
import { BUDGET_STRINGS as t } from "@/locale/budget";
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
  onLimitChange,
  onDelete,
}: BudgetCategoryRowProps) {
  const Icon = ICON_MAP[icon as keyof typeof ICON_MAP] || MoreHorizontal;
  const subtitle = CATEGORY_SUBTITLES[category] || "";
  const limit = parseFloat(limitValue);
  const hasLimit = !isNaN(limit) && limit > 0;

  // Calculate percentage and determine if the limit value is invalid (zero)
  const percentage = hasLimit ? Math.min(Math.round((spent / limit) * 100), 999) : 0;
  const isZeroError = limitValue.trim() !== "" && (limit === 0 || (limitValue.trim() !== "" && !isNaN(limit) && limit <= 0));

  // Progress bar rendering (shared between desktop and mobile)
  const progressBar = hasLimit ? (
    <div>
      <div className="flex justify-between font-label-xs text-label-xs mb-1.5">
        <span className="text-on-surface-variant">
          {t.LABEL_SPENT} {formatCurrency(spent)}
        </span>
        <span className="text-primary font-medium">{percentage}%</span>
      </div>
      <div className="h-2 w-full bg-primary/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-300"
          style={{ width: `${Math.min(percentage, 100)}%` }}
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
        <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
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
            className={isZeroError ? "category-input-error" : "category-input"}
            type="number"
            value={limitValue}
            onChange={(e) => onLimitChange(e.target.value)}
            placeholder="—"
            min="0"
            style={{
              MozAppearance: "textfield",
              WebkitAppearance: "none",
            }}
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
