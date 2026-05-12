"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import { GoalCard } from "@/components/goals";
import { dashboardLocale } from "@/locale/dashboard";

// Shows the top 3 savings goals on the dashboard with horizontal scroll.
// If no goals exist, shows an empty state with a CTA to create one.
export function DashboardGoalsPreview() {
  const goals = useQuery(api.goals.getGoals);

  // Loading state — pulsing skeleton placeholder
  if (goals === undefined) {
    return <div className="animate-pulse h-48 rounded-xl bg-surface-container" />;
  }

  // Show up to 10 goals in the dashboard preview for better horizontal scroll experience
  const topGoals = goals.slice(0, 10);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-h3 text-h3 text-on-surface">{dashboardLocale.goals.title}</h2>
        <Link
          href="/dashboard/savings-goals"
          className="font-label-md text-primary flex items-center gap-1 hover:opacity-80 transition-opacity"
        >
          {dashboardLocale.goals.viewAll}
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </Link>
      </div>

      {topGoals.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 bg-surface-container-lowest rounded-xl border border-outline-variant text-center gap-4">
          <p className="font-body-base text-secondary">
            {dashboardLocale.goals.emptyState}
          </p>
          <Link
            href="/dashboard/savings-goals"
            className="bg-primary text-on-primary px-6 py-2 rounded-lg font-label-md hover:opacity-90"
          >
            {dashboardLocale.goals.createGoal}
          </Link>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory -mx-4 px-4 max-md:scrollbar-hide">
          {topGoals.map((goal) => (
            <div
              key={goal._id}
              className="min-w-[240px] max-w-[280px] snap-start flex-shrink-0"
            >
              <GoalCard goal={goal} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
