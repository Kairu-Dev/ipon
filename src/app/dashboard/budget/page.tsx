"use client";

// src/app/dashboard/budget/page.tsx
// Budget page — manages monthly spending limits per category.
// Local state holds editable row values; persisted on "Save Changes".
import { useState, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { BUDGET_ELIGIBLE_CATEGORIES } from "@/constants/budget";
import { calculateTotalBudget } from "@/lib/budget";
import { BudgetSummaryCard, IncomeAllocatedCard, BudgetCategoryRow, AddCategoryModal } from "@/components/budget";
import { BUDGET_STRINGS as t } from "@/locale/budget";

/** Pad a number to 2 digits — timezone-safe date formatting. */
const pad = (n: number) => String(n).padStart(2, "0");

/** A single row in the local editable state. */
interface LocalBudgetRow {
  category: string;
  icon: string;
  limitValue: string; // string to allow blank inputs
  description?: string;
}

export default function BudgetPage() {
  // Current month using pad() pattern — not toISOString()
  const today = new Date();
  const currentMonth = `${today.getFullYear()}-${pad(today.getMonth() + 1)}`;

  // Convex queries
  const budgets = useQuery(api.budgets.getBudgets, { month: currentMonth });
  const spentMap = useQuery(api.budgets.getSpentPerCategory, { month: currentMonth });
  const totals = useQuery(api.transactions.getTotals, { month: currentMonth });

  // Mutation
  const saveBudgets = useMutation(api.budgets.saveBudgets);

  // Local state for editable rows
  const [rows, setRows] = useState<LocalBudgetRow[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Initialize local state from query data — only once on first load
  if (!isInitialized && budgets !== undefined) {
    const existingRows: LocalBudgetRow[] = BUDGET_ELIGIBLE_CATEGORIES.map((c) => {
      const persisted = budgets.find((b) => b.category === c.value);
      return {
        category: c.value,
        icon: c.icon,
        limitValue: persisted ? String(persisted.monthlyLimit) : "",
      };
    });

    // Append custom categories that user created (not in default list)
    const customBudgets = budgets.filter(
      (b) => !BUDGET_ELIGIBLE_CATEGORIES.some((c) => c.value === b.category)
    );
    const customRows: LocalBudgetRow[] = customBudgets.map((b) => ({
      category: b.category,
      icon: b.icon || "more-horizontal", // Use persisted icon or fallback
      description: b.description,
      limitValue: String(b.monthlyLimit),
    }));

    setRows([...existingRows, ...customRows]);
    setIsInitialized(true);
  }

  // Row handlers — keyed by category, not _id
  const handleLimitChange = useCallback((category: string, value: string) => {
    setRows((prev) =>
      prev.map((r) => (r.category === category ? { ...r, limitValue: value } : r))
    );
  }, []);

  const handleDeleteRow = useCallback((category: string) => {
    setRows((prev) => prev.filter((r) => r.category !== category));
  }, []);

  const handleAddCategory = useCallback((name: string, limit: number, icon?: string, description?: string) => {
    setRows((prev) => [
      ...prev,
      { 
        category: name, 
        icon: icon || "more-horizontal", 
        limitValue: String(limit),
        description 
      },
    ]);
  }, []);

  // Save — strip blank/zero rows, only send valid limits > 0
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const validBudgets = rows
        .map((r) => ({
          category: r.category,
          icon: r.icon,
          description: r.description,
          monthlyLimit: parseFloat(r.limitValue),
        }))
        .filter((b) => !isNaN(b.monthlyLimit) && b.monthlyLimit > 0);

      console.log("Saving budgets payload:", { month: currentMonth, budgets: validBudgets });
      await saveBudgets({ month: currentMonth, budgets: validBudgets });
    } catch (error: unknown) {
      console.error("Failed to save budgets:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      alert(`Failed to save budgets: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Loading state
  if (budgets === undefined || spentMap === undefined || totals === undefined) {
    return (
      <div id="budget-page">
        <div className="flex items-center justify-center py-20">
          <p className="font-body-sm text-on-surface-variant">{t.LOADING}</p>
        </div>
      </div>
    );
  }

  // Compute summary values
  const validRows = rows
    .map((r) => ({ category: r.category, monthlyLimit: parseFloat(r.limitValue) }))
    .filter((b) => !isNaN(b.monthlyLimit) && b.monthlyLimit > 0);

  const totalBudgeted = calculateTotalBudget(validRows);
  const totalSpent = Object.values(spentMap).reduce((sum, v) => sum + v, 0);
  const totalIncome = totals.totalIncome;

  // Check if any row has a zero error (for disabling save)
  const hasZeroError = rows.some((r) => {
    const val = parseFloat(r.limitValue);
    return r.limitValue.trim() !== "" && !isNaN(val) && val <= 0;
  });

  return (
    <div id="budget-page">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-4">
        <div>
          <h2 className="font-h1 text-h1 text-on-surface">{t.PAGE_TITLE}</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{t.PAGE_SUBTITLE}</p>
        </div>
        <button
          className="header-button"
          onClick={handleSave}
          disabled={isSaving || hasZeroError}
        >
          <span className="material-symbols-outlined text-sm">save</span>
          {isSaving ? t.BTN_SAVING : t.BTN_SAVE}
        </button>
      </div>

      {/* Top Summary Bento */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        <BudgetSummaryCard totalBudgeted={totalBudgeted} totalSpent={totalSpent} />
        <IncomeAllocatedCard totalAllocated={totalBudgeted} totalIncome={totalIncome} />
      </div>

      {/* Categories List */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-h2 text-h2 text-on-surface">{t.CATEGORIES_HEADING}</h3>
          <button
            className="text-primary font-label-md text-label-md hover:text-primary-container flex items-center gap-1 transition-colors"
            onClick={() => setIsAddModalOpen(true)}
          >
            <span className="material-symbols-outlined text-sm">add</span>
            {t.BTN_ADD_CATEGORY}
          </button>
        </div>

        <div className="flex justify-end pr-16 mb-2 hidden sm:flex">
          <span className="font-label-xs text-label-xs text-on-surface-variant uppercase tracking-wider">
            Monthly Limit
          </span>
        </div>

        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden flex flex-col gap-[1px] bg-outline-variant/30">
          {rows.length === 0 ? (
            <div className="p-8 text-center text-on-surface-variant font-body-sm">
              {t.NO_BUDGETS}
            </div>
          ) : (
            rows.map((row) => (
              <BudgetCategoryRow
                key={row.category}
                category={row.category}
                icon={row.icon}
                spent={spentMap[row.category] || 0}
                limitValue={row.limitValue}
                description={row.description}
                onLimitChange={(value) => handleLimitChange(row.category, value)}
                onDelete={() => handleDeleteRow(row.category)}
              />
            ))
          )}
        </div>
      </div>

      {/* Add Category Modal */}
      <AddCategoryModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        existingCategories={rows.map((r) => r.category)}
        onAdd={handleAddCategory}
      />
    </div>
  );
}
