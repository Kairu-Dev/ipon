"use client";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { calculateGoalProgress } from "@/lib/goals";
import { GOAL_ICON_MAP } from "@/constants/goals";
import { MoreHorizontal } from "lucide-react";

interface GoalProgressCardProps {
  goalId: string | null; // null = show all goals
}

export function GoalProgressCard({ goalId }: GoalProgressCardProps) {
  const allGoals = useQuery(api.goals.getGoals);

  if (allGoals === undefined) {
    return <div className="animate-pulse h-24 rounded-xl bg-surface-container w-full" />;
  }

  const goals = goalId
    ? allGoals.filter(g => g._id === goalId)
    : allGoals;

  if (goals.length === 0) {
    return (
      <div className="bg-surface-container-lowest border border-outline-variant
                      rounded-xl p-4 text-secondary font-body-sm">
        No savings goals found.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 w-full max-w-sm">
      {goals.map(goal => {
        const percentage = calculateGoalProgress(goal.savedAmount, goal.targetAmount);
        const remaining = Math.max(0, goal.targetAmount - goal.savedAmount);
        const Icon = GOAL_ICON_MAP[goal.icon as keyof typeof GOAL_ICON_MAP] ?? MoreHorizontal;

        return (
          <div
            key={goal._id}
            className="bg-surface-container-lowest border border-outline-variant
                       rounded-xl p-4 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-primary-container
                              flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-on-primary-container" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-label-md text-on-surface truncate">{goal.name}</p>
                <p className="font-body-sm text-secondary">
                  ₱{goal.savedAmount.toLocaleString()} / ₱{goal.targetAmount.toLocaleString()}
                </p>
              </div>
              <span className={`font-label-md shrink-0 ${
                goal.isCompleted ? "text-primary" : "text-on-surface-variant"
              }`}>
                {goal.isCompleted ? "Completed ✓" : `${percentage}%`}
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-surface-container-high rounded-full h-2 mb-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>

            {!goal.isCompleted && (
              <p className="font-body-sm text-secondary">
                ₱{remaining.toLocaleString()} remaining · Deadline: {goal.deadline}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
