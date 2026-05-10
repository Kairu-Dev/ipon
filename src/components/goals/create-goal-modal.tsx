"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUIStore } from "@/store/ui-store";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { createGoalSchema, CreateGoalInput } from "@/lib/validation";
import { GOAL_ICONS, GOAL_ICON_MAP } from "@/constants/goals";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function CreateGoalModal() {
  const isCreateGoalModalOpen = useUIStore((s) => s.isCreateGoalModalOpen);
  const setCreateGoalModalOpen = useUIStore((s) => s.setCreateGoalModalOpen);
  
  const createGoal = useMutation(api.goals.createGoal);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm<CreateGoalInput>({
    resolver: zodResolver(createGoalSchema),
    defaultValues: {
      icon: GOAL_ICONS[0].value,
      name: "",
      targetAmount: undefined,
      initialDeposit: undefined,
      deadline: "",
      date: new Date().toLocaleDateString("en-CA"), // YYYY-MM-DD
    },
  });

  const selectedIcon = useWatch({ control, name: "icon" });
  const nameValue = useWatch({ control, name: "name" });

  const onSubmit = async (data: CreateGoalInput) => {
    try {
      setIsSubmitting(true);
      setServerError(null);
      await createGoal(data);
      reset();
      setCreateGoalModalOpen(false);
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Failed to create goal");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      reset();
      setServerError(null);
      setCreateGoalModalOpen(false);
    }
  };

  return (
    <Dialog open={isCreateGoalModalOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md bg-surface-container-lowest p-0 overflow-hidden border-slate-200">
        <DialogHeader className="px-6 py-5 border-b border-slate-100 bg-surface-bright">
          <DialogTitle className="font-h2 text-h2 text-on-surface">Create New Goal</DialogTitle>
        </DialogHeader>

        <div className="p-6 overflow-y-auto max-h-[60vh] flex-1">
          <form id="create-goal-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
            
            {serverError && (
              <div className="p-3 bg-error/10 text-error rounded-lg text-sm font-medium">
                {serverError}
              </div>
            )}

            {/* Icon Selector Row */}
            <div>
              <label className="font-label-md text-label-md text-on-surface block mb-3">Choose an Icon</label>
              <div className="flex gap-3 justify-between">
                {GOAL_ICONS.map((item) => {
                  const Icon = GOAL_ICON_MAP[item.icon as keyof typeof GOAL_ICON_MAP];
                  const isSelected = selectedIcon === item.value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setValue("icon", item.value)}
                      aria-label={item.label}
                      className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all focus:outline-none",
                        isSelected
                          ? "bg-primary-container text-on-primary-container border-primary ring-2 ring-primary/20"
                          : "bg-surface-variant text-on-surface-variant border-transparent hover:border-slate-300"
                      )}
                    >
                      <Icon className="w-6 h-6" />
                    </button>
                  );
                })}
              </div>
              {errors.icon && <p className="text-error text-xs mt-1">{errors.icon.message}</p>}
            </div>

            {/* Goal Name Input */}
            <div>
              <div className="flex justify-between items-end mb-2">
                <label className="font-label-md text-label-md text-on-surface" htmlFor="goal-name">Goal Name</label>
                <span className={cn("text-xs", (nameValue?.length || 0) > 40 ? "text-error" : "text-slate-400")}>
                  {nameValue?.length || 0}/40
                </span>
              </div>
              <input 
                {...register("name")}
                className={cn(
                  "w-full px-4 py-3 bg-surface-bright border rounded-lg focus:outline-none focus:ring-1 text-body-base font-body-base transition-all placeholder:text-slate-400",
                  errors.name ? "border-error focus:border-error focus:ring-error/50" : "border-slate-200 focus:border-primary focus:ring-primary/50"
                )}
                id="goal-name" 
                placeholder="e.g. Japan Trip 2024" 
                type="text" 
              />
              {errors.name && <p className="text-error text-xs mt-1">{errors.name.message}</p>}
            </div>

            {/* Target Amount Input */}
            <div>
              <label className="font-label-md text-label-md text-on-surface block mb-2" htmlFor="target-amount">Target Amount</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-currency text-currency text-on-surface-variant">₱</span>
                <input 
                  {...register("targetAmount", { valueAsNumber: true })}
                  className={cn(
                    "w-full pl-10 pr-4 py-3 bg-surface-bright border rounded-lg focus:outline-none focus:ring-1 text-body-base font-body-base transition-all placeholder:text-slate-400",
                    errors.targetAmount ? "border-error focus:border-error focus:ring-error/50" : "border-slate-200 focus:border-primary focus:ring-primary/50"
                  )}
                  id="target-amount" 
                  placeholder="0.00" 
                  type="number" 
                  step="any"
                />
              </div>
              {errors.targetAmount && <p className="text-error text-xs mt-1">{errors.targetAmount.message}</p>}
            </div>

            {/* Initial Deposit Input (Optional) */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="font-label-md text-label-md text-on-surface" htmlFor="initial-deposit">Initial Deposit</label>
                <span className="font-label-xs text-label-xs text-slate-400">Optional</span>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-currency text-currency text-on-surface-variant">₱</span>
                <input 
                  {...register("initialDeposit", { valueAsNumber: true })}
                  className={cn(
                    "w-full pl-10 pr-4 py-3 bg-surface-bright border rounded-lg focus:outline-none focus:ring-1 text-body-base font-body-base transition-all placeholder:text-slate-400",
                    errors.initialDeposit ? "border-error focus:border-error focus:ring-error/50" : "border-slate-200 focus:border-primary focus:ring-primary/50"
                  )}
                  id="initial-deposit" 
                  placeholder="0.00" 
                  type="number" 
                  step="any"
                />
              </div>
              {errors.initialDeposit && <p className="text-error text-xs mt-1">{errors.initialDeposit.message}</p>}
            </div>

            {/* Deadline Date Picker */}
            <div>
              <label className="font-label-md text-label-md text-on-surface block mb-2" htmlFor="deadline-date">Target Deadline</label>
              <div className="relative">
                <Calendar className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  {...register("deadline")}
                  className={cn(
                    "w-full pl-12 pr-4 py-3 bg-surface-bright border rounded-lg focus:outline-none focus:ring-1 text-body-base font-body-base text-on-surface transition-all appearance-none",
                    errors.deadline ? "border-error focus:border-error focus:ring-error/50" : "border-slate-200 focus:border-primary focus:ring-primary/50"
                  )}
                  id="deadline-date" 
                  type="date" 
                  min={new Date().toLocaleDateString("en-CA")}
                />
              </div>
              {errors.deadline && <p className="text-error text-xs mt-1">{errors.deadline.message}</p>}
            </div>
            
            {/* Hidden date field for server submission */}
            <input type="hidden" {...register("date")} />
          </form>
        </div>

        <div className="px-6 py-5 bg-surface-bright border-t border-slate-100 flex flex-col gap-3">
          <button 
            form="create-goal-form"
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md rounded-lg transition-colors flex items-center justify-center shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Creating..." : "Create Goal"}
          </button>
          <button 
            onClick={handleClose}
            disabled={isSubmitting}
            className="w-full py-2 px-4 text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-colors text-center bg-transparent border-none disabled:opacity-50" 
            type="button"
          >
            Cancel
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
