"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { GoalCard } from "./goal-card";
import { Target } from "lucide-react";
import { GOALS_STRINGS } from "@/locale/goals";

export function GoalGrid() {
  const goals = useQuery(api.goals.getGoals);

  if (goals === undefined) {
    // Loading state
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-surface border border-outline-variant rounded-xl p-[24px] shadow-sm animate-pulse h-[200px]" />
        ))}
      </div>
    );
  }

  if (goals.length === 0) {
    return (
      <div className="bg-surface-container-lowest border border-outline-variant border-dashed rounded-xl p-12 text-center flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
          <Target className="w-8 h-8" />
        </div>
        <h3 className="font-h3 text-h3 text-on-surface mb-2">{GOALS_STRINGS.EMPTY_STATE_TITLE}</h3>
        <p className="font-body-sm text-body-sm text-on-surface-variant max-w-md">
          {GOALS_STRINGS.EMPTY_STATE_DESC}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {goals.map((goal) => (
        <GoalCard key={goal._id} goal={goal} />
      ))}
    </div>
  );
}
