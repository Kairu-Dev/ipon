"use client";

import { useUIStore } from "@/store/ui-store";
import { Doc } from "../../../convex/_generated/dataModel";
import { GOAL_ICON_MAP } from "@/constants/goals";
import { calculateGoalProgress } from "@/lib/goals";
import { formatCurrency, formatGoalDate } from "@/lib/formatters";
import { Check, Calendar } from "lucide-react";
import { GOALS_STRINGS } from "@/locale/goals";

export function GoalCard({ goal }: { goal: Doc<"goals"> }) {
  const { setContributeGoalPanelOpen, setSelectedGoalId } = useUIStore();

  const handleCardClick = () => {
    setSelectedGoalId(goal._id);
    setContributeGoalPanelOpen(true);
  };

  const percentage = calculateGoalProgress(goal.savedAmount, goal.targetAmount);
  const isCompletedState = goal.isCompleted;
  
  // Look up icon from constants, fallback to star
  const Icon = GOAL_ICON_MAP[goal.icon as keyof typeof GOAL_ICON_MAP] || GOAL_ICON_MAP["star"];

  // Format deadline date to Mon YYYY
  const displayDateStr = isCompletedState && goal.completedAt ? goal.completedAt : goal.deadline;
  const formattedDate = formatGoalDate(displayDateStr);

  return (
    <div 
      onClick={handleCardClick}
      className={`bg-surface-container-lowest rounded-xl p-[24px] shadow-sm relative flex flex-col group hover:shadow-md transition-shadow cursor-pointer ${
        isCompletedState ? "border border-primary/30" : "border border-slate-200"
      }`}
    >
      {isCompletedState ? (
        <div className="absolute top-6 right-6 bg-primary text-on-primary px-3 py-1 rounded-full font-label-xs text-label-xs flex items-center gap-1 shadow-sm">
          {GOALS_STRINGS.LABEL_COMPLETED} <Check className="w-3.5 h-3.5" />
        </div>
      ) : (
        <div className="absolute top-6 right-6 bg-primary-container text-on-primary-container px-3 py-1 rounded-full font-label-xs text-label-xs">
          {percentage}%
        </div>
      )}

      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-4 ${
        isCompletedState ? "bg-primary/10 text-primary" : "bg-surface-container text-on-surface"
      }`}>
        <Icon className="w-6 h-6" />
      </div>

      <h3 className="font-h3 text-h3 text-on-surface mb-1">{goal.name}</h3>
      <p className="font-body-sm text-body-sm text-on-surface-variant mb-4 flex items-center gap-1">
        <Calendar className="w-4 h-4" />
        {isCompletedState ? `${GOALS_STRINGS.LABEL_ACHIEVED} ${formattedDate}` : formattedDate}
      </p>

      <div className="mt-auto">
        <div className="flex justify-between items-end mb-2">
          <span className="font-body-sm text-body-sm text-on-surface-variant">{GOALS_STRINGS.LABEL_SAVED}</span>
          <div className="text-right">
            <span className="font-currency text-currency text-primary">{formatCurrency(goal.savedAmount)}</span>
            <span className="font-body-sm text-body-sm text-on-surface-variant"> / {formatCurrency(goal.targetAmount)}</span>
          </div>
        </div>
        <div className="w-full bg-primary/10 rounded-full h-2.5 overflow-hidden">
          <div className="bg-primary h-full rounded-full transition-all" style={{ width: `${percentage}%` }}></div>
        </div>
      </div>
    </div>
  );
}
