"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { DashboardSummary, DashboardSpendingBreakdown, DashboardGoalsPreview, IponAIInsights } from "@/components/dashboard";
import { ContributeGoalSheet } from "@/components/goals";
import { dashboardLocale } from "@/locale/dashboard";

export default function DashboardPage() {
  // Fetch the current user's name for the greeting
  const currentUser = useQuery(api.users.getCurrentUser);

  // Show first name only, fall back to "there" while loading or if no name set
  const trimmedName = currentUser?.name?.trim();
  const firstName = trimmedName && trimmedName.length > 0
    ? trimmedName.split(/\s+/)[0]
    : dashboardLocale.header.fallbackName;

  return (
    <>
      {/* Header Section */}
      <section className="space-y-2">
        <h1 className="font-h1 text-h1 text-on-surface">{dashboardLocale.header.greeting.replace("{name}", firstName)}</h1>
        <p className="font-body-base text-body-base text-secondary">{dashboardLocale.header.subtitle}</p>
      </section>

      {/* Summary Cards */}
      <DashboardSummary />

      {/* Main Dashboard Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Savings Goals + Spending Breakdown (Spans 2 columns on lg) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Dynamic goals preview — shows top 10 from Convex */}
          <DashboardGoalsPreview />

          {/* Spending Breakdown */}
          <DashboardSpendingBreakdown />
        </div>

        {/* AI Insights — dynamic component replaces static mockup */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <IponAIInsights />
        </div>
      </section>

      {/* Goal Contribution Sheet */}
      <ContributeGoalSheet />
    </>
  );
}
