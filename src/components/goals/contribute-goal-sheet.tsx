"use client";

import { useUIStore } from "@/store/ui-store";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contributeGoalSchema, ContributeGoalInput } from "@/lib/validation";
import { GOAL_ICON_MAP } from "@/constants/goals";
import { formatCurrency } from "@/lib/formatters";
import { GOALS_STRINGS } from "@/locale/goals";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { PlusCircle, Wallet } from "lucide-react";

export function ContributeGoalSheet() {
  const { isContributeGoalPanelOpen, setContributeGoalPanelOpen, selectedGoalId } = useUIStore();
  
  // Use today's date dynamically to ensure accuracy and prevent timezone issues
  const today = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const currentMonth = `${today.getFullYear()}-${pad(today.getMonth() + 1)}`;
  const localDate = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
  
  const goal = useQuery(api.goals.getGoal, selectedGoalId ? { id: selectedGoalId } : "skip");
  const totals = useQuery(api.transactions.getTotals, { month: currentMonth });
  const contribute = useMutation(api.goals.contributeToGoal);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, setValue, control, reset, formState: { errors } } = useForm<ContributeGoalInput>({
    resolver: zodResolver(contributeGoalSchema),
    defaultValues: { amount: undefined, date: localDate },
  });

  const amountValue = useWatch({ control, name: "amount" });

  const onSubmit = async (data: ContributeGoalInput) => {
    if (!selectedGoalId) return;
    try {
      setIsSubmitting(true);
      setServerError(null);
      await contribute({ goalId: selectedGoalId, amount: data.amount, date: data.date });
      reset();
      setContributeGoalPanelOpen(false);
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Failed to contribute");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickAdd = (amount: number) => {
    setValue("amount", amount, { shouldValidate: true });
  };

  if (!goal || totals === undefined) return (
    <Sheet open={isContributeGoalPanelOpen} onOpenChange={setContributeGoalPanelOpen}>
      <SheetContent className="w-full max-w-[440px] sm:max-w-[440px] p-0 bg-surface-container-lowest border-l border-outline-variant flex flex-col justify-center">
        <div className="p-8 text-center text-secondary font-body-base">Loading...</div>
      </SheetContent>
    </Sheet>
  );

  const remaining = Math.max(0, goal.targetAmount - goal.savedAmount);
  const Icon = GOAL_ICON_MAP[goal.icon as keyof typeof GOAL_ICON_MAP] || GOAL_ICON_MAP["star"];

  return (
    <Sheet open={isContributeGoalPanelOpen} onOpenChange={setContributeGoalPanelOpen}>
      <SheetContent className="w-full max-w-[440px] sm:max-w-[440px] p-0 bg-surface-container-lowest border-l border-outline-variant flex flex-col">
        <SheetHeader className="px-6 py-5 border-b border-outline-variant bg-surface-container-lowest text-left">
          <SheetTitle className="font-h2 text-h2 text-on-surface">{GOALS_STRINGS.PANEL_TITLE}</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Target Goal Summary Card */}
          <div className="bg-surface-container-low rounded-xl p-5 border border-outline-variant/50">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-white border border-outline-variant flex items-center justify-center text-primary shadow-sm">
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-h3 text-h3 text-on-surface">{goal.name}</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Target Amount: {formatCurrency(goal.targetAmount)}</p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-3 border border-outline-variant/30 flex justify-between items-center">
              <div>
                <p className="font-label-xs text-label-xs text-on-surface-variant mb-1 uppercase tracking-wider">{GOALS_STRINGS.LABEL_CURRENT_BALANCE}</p>
                <p className="font-currency text-currency text-on-surface">{formatCurrency(goal.savedAmount, { showDecimals: true })}</p>
              </div>
              <div className="text-right">
                <p className="font-label-xs text-label-xs text-on-surface-variant mb-1 uppercase tracking-wider">{GOALS_STRINGS.LABEL_REMAINING}</p>
                <p className="font-currency text-currency text-primary">{formatCurrency(remaining, { showDecimals: true })}</p>
              </div>
            </div>
          </div>

          <form id="contribute-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {serverError && <div className="text-error text-sm font-medium">{serverError}</div>}
            
            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-2" htmlFor="amount">{GOALS_STRINGS.LABEL_AMOUNT_TO_ADD}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="font-currency text-currency text-on-surface-variant">₱</span>
                </div>
                <input 
                  {...register("amount", { 
                    setValueAs: (v) => {
                      if (v === "") return undefined;
                      const n = Number(v);
                      return isNaN(n) ? undefined : n;
                    } 
                  })}
                  className={cn(
                    "block w-full pl-10 pr-4 py-4 bg-white border rounded-xl font-currency text-currency text-on-surface placeholder-outline-variant focus:ring-2 focus:ring-primary focus:border-primary transition-shadow outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                    errors.amount ? "border-error focus:ring-error" : "border-outline-variant"
                  )}
                  id="amount" 
                  placeholder="0.00" 
                  type="number" 
                  step="any"
                />
              </div>
              {errors.amount && <p className="text-error text-xs mt-1">{errors.amount.message}</p>}
            </div>
            
            <div className="flex gap-3 pt-2">
              {[500, 1000, 5000].map((val) => (
                <button 
                  key={val}
                  onClick={() => handleQuickAdd(val)}
                  className={cn(
                    "flex-1 py-2 px-3 rounded-lg font-label-md text-label-md transition-colors border",
                    amountValue === val 
                      ? "bg-surface-container-high border-primary text-primary" 
                      : "bg-white border-outline-variant text-on-surface hover:bg-surface-container"
                  )} 
                  type="button"
                >
                  +{formatCurrency(val)}
                </button>
              ))}
            </div>
            <input type="hidden" {...register("date")} />
          </form>

          {/* Show warning when contribution would exceed available balance */}
          {amountValue > 0 && totals && amountValue > totals.remainingBalance && (
            <div className="flex items-start gap-2 p-3 bg-error-container rounded-lg border border-error/20">
              <span className="material-symbols-outlined text-error text-sm mt-0.5">warning</span>
              <p className="font-body-sm text-body-sm text-error">
                {GOALS_STRINGS.WARNING_EXCEEDS_BALANCE_1}{formatCurrency(amountValue - totals.remainingBalance)}{GOALS_STRINGS.WARNING_EXCEEDS_BALANCE_2}
              </p>
            </div>
          )}

          {/* Source Account — read-only display until Wallets feature is built */}
          <div className="space-y-3 pt-4 border-t border-outline-variant/30">
            <p className="block font-label-md text-label-md text-on-surface">{GOALS_STRINGS.LABEL_FROM_ACCOUNT}</p>
            <div className="w-full flex items-center justify-between p-4 bg-white border border-outline-variant rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-primary">
                  <Wallet className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="font-label-md text-label-md text-on-surface">{GOALS_STRINGS.MAIN_SAVINGS}</p>
                  <p className="font-label-xs text-label-xs text-on-surface-variant mt-0.5">{GOALS_STRINGS.LABEL_AVAILABLE}: {formatCurrency(totals.remainingBalance, { showDecimals: true })}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-outline-variant bg-surface-container-lowest mt-auto">
          <button 
            form="contribute-form"
            type="submit"
            disabled={isSubmitting || !amountValue || amountValue <= 0}
            className="w-full bg-primary text-on-primary font-label-md text-label-md py-4 rounded-xl shadow-sm hover:bg-primary-container focus:ring-4 focus:ring-primary/20 transition-all active:scale-[0.98] flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PlusCircle className="w-5 h-5" />
            {isSubmitting ? "Processing..." : GOALS_STRINGS.BTN_ADD_CONTRIBUTION}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
