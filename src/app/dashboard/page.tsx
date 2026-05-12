"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { DashboardSummary, DashboardSpendingBreakdown, DashboardGoalsPreview } from "@/components/dashboard";
import { ContributeGoalSheet } from "@/components/goals";
import { dashboardLocale } from "@/locale/dashboard";

export default function DashboardPage() {
  // Fetch the current user's name for the greeting
  const currentUser = useQuery(api.users.getCurrentUser);

  // Show first name only, fall back to "there" while loading or if no name set
  const firstName = currentUser?.name?.split(" ")[0] ?? dashboardLocale.header.fallbackName;

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
          {/* Dynamic goals preview — shows top 3 from Convex */}
          <DashboardGoalsPreview />

          {/* Spending Breakdown */}
          <DashboardSpendingBreakdown />
        </div>

        {/* Ipon AI Insights (1 column) */}
        <div className="bg-surface-container-low border border-primary/20 rounded-xl p-[24px] shadow-sm flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-10"></div>
          <div className="flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
            <h2 className="font-h2 text-h2 text-on-surface">{dashboardLocale.aiInsights.title}</h2>
          </div>

          <div className="bg-white border border-error-container rounded-lg p-4 mb-6 relative">
            <div className="absolute -top-3 left-4 bg-error text-on-error font-label-xs text-label-xs px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
              <span className="material-symbols-outlined text-[10px]">warning</span> {dashboardLocale.aiInsights.smartAlert}
            </div>
            <h3 className="font-h3 text-h3 text-on-surface mt-2 mb-2">Entertainment Over Budget</h3>
            <p className="font-body-sm text-body-sm text-secondary">You have exceeded your entertainment budget by ₱1,500 this month. Consider cutting back on subscriptions or eating out next week to stay on track for your Japan Trip goal.</p>
          </div>

          <div className="space-y-4 mb-8 flex-1">
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-primary text-sm">lightbulb</span>
              </div>
              <div>
                <p className="font-body-sm text-body-sm text-on-surface">You usually spend ₱500 on coffee by this time. You&apos;ve only spent ₱200! Great job saving.</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-primary text-sm">trending_up</span>
              </div>
              <div>
                <p className="font-body-sm text-body-sm text-on-surface">If you save an extra ₱500 a week, you&apos;ll reach your Emergency Fund goal 2 months early.</p>
              </div>
            </div>
          </div>

          <Link href="/dashboard/budget" className="w-full bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
            {dashboardLocale.aiInsights.reviewBudget} <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>
      </section>

      {/* Goal Contribution Sheet */}
      <ContributeGoalSheet />
    </>
  );
}
