"use client";

import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUIStore } from "@/store/ui-store";
import { useMutation, useAction, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { transactionSchema, TransactionInput } from "@/lib/validation";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, PAYMENT_METHODS } from "@/constants/transactions";
import { ICON_MAP } from "@/constants/icons";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { TRANSACTIONS_STRINGS as t } from "@/locale/transactions";

export function AddTransactionModal() {
  const isAddTransactionModalOpen = useUIStore((s) => s.isAddTransactionModalOpen);
  const setAddTransactionModalOpen = useUIStore((s) => s.setAddTransactionModalOpen);

  const addTransaction = useMutation(api.transactions.addTransaction);
  const suggestCategory = useAction(api.transactions.suggestCategory);

  const { register, handleSubmit, control, setValue, reset, formState: { errors, isSubmitting } } = useForm<TransactionInput>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "expense",
      amount: 0,
      title: "",
      category: "",
      paymentMethod: "",
      date: new Date().toISOString().split("T")[0],
      note: "",
    },
  });

  const type = useWatch({ control, name: "type" });
  const note = useWatch({ control, name: "note" });
  const category = useWatch({ control, name: "category" });

  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);

  // Debounced AI Suggestion
  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(async () => {
      if (note && note.length > 5) {
        try {
          const suggestion = await suggestCategory({ note, type });
          if (!isMounted) return;
          if (suggestion) {
            setAiSuggestion(suggestion);
          }
        } catch (error) {
          if (isMounted) {
            console.error("AI Suggestion Error:", error);
          }
        }
      } else {
        setAiSuggestion(null);
      }
    }, 500);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [note, type, suggestCategory]);

  const pad = (n: number) => String(n).padStart(2, "0");
  const currentDate = new Date();
  const currentMonth = `${currentDate.getFullYear()}-${pad(currentDate.getMonth() + 1)}`;
  const customCategories = useQuery(api.budgets.getCustomCategories, { month: currentMonth });

  const categories = type === "expense" 
    ? [
        ...EXPENSE_CATEGORIES.filter(c => c.value !== "Savings"),
        ...(customCategories ?? []),
      ]
    : INCOME_CATEGORIES;
  
  const today = currentDate.toISOString().split("T")[0];

  const onSubmit = async (data: TransactionInput) => {
    try {
      await addTransaction(data);
      reset();
      setAddTransactionModalOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setAddTransactionModalOpen(open);
    if (!open) {
      reset();
      setAiSuggestion(null);
    }
  };

  return (
    <Dialog open={isAddTransactionModalOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md bg-surface p-0 overflow-hidden border-outline-variant/30 flex flex-col max-h-[90vh] rounded-2xl gap-0">
        <DialogHeader className="px-6 py-4 border-b border-outline-variant/50 flex justify-between items-center bg-white/50 rounded-t-2xl">
          <DialogTitle className="font-h3 text-h3 text-on-surface">{t.MODAL_TITLE}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto space-y-8 flex-1">
            
            {/* Segmented Toggle */}
            <div className="flex p-1 bg-surface-container rounded-lg border border-outline-variant/30">
              <button 
                type="button"
                onClick={() => { setValue("type", "expense"); setValue("category", ""); setAiSuggestion(null); }}
                className={cn("flex-1 py-2 text-center rounded-md font-label-md transition-all", type === "expense" ? "bg-primary text-on-primary shadow-sm" : "text-secondary hover:text-on-surface")}
              >
                {t.TYPE_EXPENSE}
              </button>
              <button 
                type="button"
                onClick={() => { setValue("type", "income"); setValue("category", ""); setAiSuggestion(null); }}
                className={cn("flex-1 py-2 text-center rounded-md font-label-md transition-all", type === "income" ? "bg-primary text-on-primary shadow-sm" : "text-secondary hover:text-on-surface")}
              >
                {t.TYPE_INCOME}
              </button>
            </div>

            {/* Amount Input */}
            <div className="flex flex-col items-center justify-center py-4 space-y-2">
              <p className="font-label-xs text-secondary uppercase tracking-wider">{t.LABEL_AMOUNT}</p>
              <div className="flex items-center justify-center gap-1 text-on-surface relative">
                <span className="font-currency text-display text-primary">{t.CURRENCY_SYMBOL}</span>
                <input 
                  type="number"
                  {...register("amount", { valueAsNumber: true })}
                  className="w-full text-center font-currency text-display text-on-surface bg-transparent border-none focus:outline-none focus:ring-0 rounded-lg max-w-[200px] caret-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder={t.PLACEHOLDER_AMOUNT}
                  step="0.01"
                  min="0"
                />
                {/* Invisible spacer to perfectly center the input text relative to the AMOUNT label */}
                <span className="font-currency text-display invisible pointer-events-none" aria-hidden="true">{t.CURRENCY_SYMBOL}</span>
              </div>
              {errors.amount && <span className="text-error font-body-sm">{errors.amount.message}</span>}
            </div>

            {/* Title Input */}
            <div className="space-y-1">
              <label className="font-label-md text-on-surface">{t.LABEL_TITLE}</label>
              <input 
                {...register("title")}
                className="w-full px-3 py-2.5 bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary font-body-sm text-on-surface transition-all" 
                type="text" 
                placeholder={type === "expense" ? t.PLACEHOLDER_TITLE_EXPENSE : t.PLACEHOLDER_TITLE_INCOME}
              />
              {errors.title && <span className="text-error font-body-sm block">{errors.title.message}</span>}
            </div>

            {/* Category Grid */}
            {/* Category Grid */}
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <label className="font-label-md text-on-surface">{t.LABEL_CATEGORY}</label>
                {aiSuggestion && aiSuggestion !== category && (
                  <button 
                    type="button"
                    onClick={() => setValue("category", aiSuggestion, { shouldValidate: true })}
                    className="bg-primary-container/20 text-primary-container px-3 py-1 rounded-full flex items-center gap-1.5 border border-primary-container/30 hover:bg-primary-container/40 active:scale-95 transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                    <span className="font-label-xs">{t.AI_SUGGESTION_LABEL} {categories.find(c => c.value === aiSuggestion)?.label || "..."} ({t.AI_SUGGESTION_ACTION})</span>
                  </button>
                )}
              </div>
              
              <div className={cn("grid gap-3", type === "expense" ? "grid-cols-3" : "grid-cols-2")}>
                {categories.map((cat) => {
                  const Icon = ICON_MAP[cat.icon as keyof typeof ICON_MAP];
                  const isSelected = category === cat.value;
                  return (
                    <button 
                      key={cat.value}
                      type="button"
                      onClick={() => setValue("category", cat.value, { shouldValidate: true })}
                      className={cn("flex flex-col items-center justify-center p-3 rounded-xl border transition-all", isSelected ? "border-2 border-primary bg-primary/5 text-primary shadow-sm" : "border-outline-variant bg-white text-secondary hover:border-primary/50 hover:bg-primary/5")}
                    >
                      <Icon className="mb-1 w-6 h-6" />
                      <span className="font-label-xs">{cat.label}</span>
                    </button>
                  );
                })}
              </div>
              {errors.category && <span className="text-error font-body-sm block">{errors.category.message}</span>}
            </div>

            {/* Payment Method & Date */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="paymentMethod" className="font-label-md text-on-surface">{t.LABEL_PAYMENT_METHOD}</label>
                <select 
                  id="paymentMethod"
                  {...register("paymentMethod")}
                  className="w-full px-3 py-2.5 bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary font-body-sm text-on-surface appearance-none"
                >
                  <option value="" disabled>{t.PLACEHOLDER_SELECT}</option>
                  {PAYMENT_METHODS.map((pm) => (
                    <option key={pm} value={pm}>{pm}</option>
                  ))}
                </select>
                {errors.paymentMethod && <span className="text-error font-body-sm block">{errors.paymentMethod.message}</span>}
              </div>

              <div className="space-y-1">
                <label className="font-label-md text-on-surface">{t.LABEL_DATE}</label>
                <input 
                  {...register("date")}
                  type="date"
                  max={today}
                  className="w-full px-3 py-2.5 bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary font-body-sm text-on-surface transition-all"
                />
                {errors.date && <span className="text-error font-body-sm block">{errors.date.message}</span>}
              </div>
            </div>

            {/* Note Textarea */}
            <div className="space-y-1">
              <label className="font-label-md text-on-surface flex justify-between">
                {t.LABEL_NOTE.split(' ')[0]} <span className="text-outline font-normal">Optional</span>
              </label>
              <textarea 
                {...register("note")}
                className="w-full px-3 py-2.5 bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary font-body-sm text-on-surface placeholder-outline-variant transition-all resize-none" 
                placeholder={t.PLACEHOLDER_NOTE}
                rows={2}
                maxLength={150}
              ></textarea>
              <div className="flex justify-end">
                <span className={cn("font-label-xs", (note?.length || 0) >= 150 ? "text-error" : "text-outline")}>
                  {note?.length || 0}/150
                </span>
              </div>
              {errors.note && <span className="text-error font-body-sm block">{errors.note.message}</span>}
            </div>

          </div>

          {/* Submit */}
          <div className="p-6 border-t border-outline-variant/50 bg-white/50 rounded-b-2xl mt-auto">
            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-primary text-on-primary rounded-xl font-label-md shadow-sm hover:bg-primary-container transition-colors flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
            >
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
              {isSubmitting ? t.BTN_SAVING : t.BTN_SAVE}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
