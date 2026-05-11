"use client";

// src/components/budget/add-category-modal.tsx
// Modal for adding a custom budget category with name and initial limit.
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BUDGET_STRINGS as t } from "@/locale/budget";

interface AddCategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called with the custom category name and limit when the user submits. */
  onAdd: (category: string, limit: number) => void;
}

export function AddCategoryModal({ open, onOpenChange, onAdd }: AddCategoryModalProps) {
  const [name, setName] = useState("");
  const [limit, setLimit] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError(t.ERROR_CATEGORY_REQUIRED);
      return;
    }

    const parsedLimit = parseFloat(limit);
    if (isNaN(parsedLimit) || parsedLimit <= 0) {
      setError(t.ERROR_BUDGET_ZERO);
      return;
    }

    onAdd(trimmedName, parsedLimit);
    // Reset form
    setName("");
    setLimit("");
    setError(null);
    onOpenChange(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setName("");
      setLimit("");
      setError(null);
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-sm bg-surface p-0 overflow-hidden border-outline-variant/30 rounded-2xl gap-0">
        <DialogHeader className="px-6 py-4 border-b border-outline-variant/50 bg-white/50 rounded-t-2xl">
          <DialogTitle className="font-h3 text-h3 text-on-surface">
            {t.ADD_MODAL_TITLE}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Category Name */}
          <div className="space-y-1">
            <label className="font-label-md text-on-surface">{t.ADD_MODAL_NAME_LABEL}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.ADD_MODAL_NAME_PLACEHOLDER}
              className="w-full px-3 py-2.5 bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary font-body-sm text-on-surface transition-all"
              maxLength={50}
              autoFocus
            />
          </div>

          {/* Monthly Limit */}
          <div className="space-y-1">
            <label className="font-label-md text-on-surface">{t.ADD_MODAL_LIMIT_LABEL}</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-body-sm text-on-surface-variant">
                {t.CURRENCY_SYMBOL}
              </span>
              <input
                type="number"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                placeholder={t.ADD_MODAL_LIMIT_PLACEHOLDER}
                className="w-full pl-7 pr-3 py-2.5 bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary font-body-sm text-on-surface transition-all text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                min="0"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-error font-body-sm">{error}</p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => handleOpenChange(false)}
              className="flex-1 py-2.5 px-4 text-on-surface-variant hover:text-on-surface font-label-md transition-colors rounded-lg border border-outline-variant hover:bg-surface-container-low"
            >
              {t.ADD_MODAL_BTN_CANCEL}
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 bg-primary text-on-primary rounded-lg font-label-md shadow-sm hover:bg-primary-container transition-colors active:scale-95 duration-150"
            >
              {t.ADD_MODAL_BTN_ADD}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
