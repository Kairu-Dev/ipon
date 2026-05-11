import Link from "next/link";
import { DashboardSummary, DashboardSpendingBreakdown } from "@/components/dashboard";

export default function DashboardPage() {
  return (
    <>
      {/* Header Section */}
      <section className="space-y-2">
        <h1 className="font-h1 text-h1 text-on-surface">Kumusta, Marco!</h1>
        <p className="font-body-base text-body-base text-secondary">Here&apos;s your financial overview for this month.</p>
      </section>

      {/* Summary Cards */}
      <DashboardSummary />

      {/* Main Dashboard Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Savings Goals (Spans 2 columns on lg) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-h2 text-h2 text-on-surface">Savings Goals</h2>
            <Link className="font-label-md text-label-md text-primary hover:text-primary-container transition-colors flex items-center gap-1" href="/dashboard/savings-goals">
              View All <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Goal 1 */}
            <div className="bg-surface-container-lowest border border-slate-200 rounded-xl p-[24px] relative shadow-sm hover:shadow-md transition-shadow">
              <div className="absolute top-4 right-4 bg-primary text-on-primary font-label-xs text-label-xs px-2 py-1 rounded-full">
                75%
              </div>
              <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary mb-4">
                <span className="material-symbols-outlined">flight_takeoff</span>
              </div>
              <h3 className="font-h3 text-h3 text-on-surface mb-1">Japan Trip</h3>
              <p className="font-body-sm text-body-sm text-secondary mb-4">₱45k / ₱60k</p>
              <div className="w-full bg-primary/10 rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: "75%" }}></div>
              </div>
            </div>

            {/* Goal 2 */}
            <div className="bg-surface-container-lowest border border-slate-200 rounded-xl p-[24px] relative shadow-sm hover:shadow-md transition-shadow">
              <div className="absolute top-4 right-4 bg-primary text-on-primary font-label-xs text-label-xs px-2 py-1 rounded-full">
                40%
              </div>
              <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary mb-4">
                <span className="material-symbols-outlined">laptop_mac</span>
              </div>
              <h3 className="font-h3 text-h3 text-on-surface mb-1">New Laptop</h3>
              <p className="font-body-sm text-body-sm text-secondary mb-4">₱20k / ₱50k</p>
              <div className="w-full bg-primary/10 rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: "40%" }}></div>
              </div>
            </div>

            {/* Goal 3 */}
            <div className="bg-surface-container-lowest border border-slate-200 rounded-xl p-[24px] relative shadow-sm hover:shadow-md transition-shadow">
              <div className="absolute top-4 right-4 bg-primary text-on-primary font-label-xs text-label-xs px-2 py-1 rounded-full">
                15%
              </div>
              <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary mb-4">
                <span className="material-symbols-outlined">health_and_safety</span>
              </div>
              <h3 className="font-h3 text-h3 text-on-surface mb-1">Emergency Fund</h3>
              <p className="font-body-sm text-body-sm text-secondary mb-4">₱15k / ₱100k</p>
              <div className="w-full bg-primary/10 rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: "15%" }}></div>
              </div>
            </div>
          </div>

          {/* Spending Breakdown */}
          <DashboardSpendingBreakdown />
        </div>

        {/* Ipon AI Insights (1 column) */}
        <div className="bg-surface-container-low border border-primary/20 rounded-xl p-[24px] shadow-sm flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-10"></div>
          <div className="flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
            <h2 className="font-h2 text-h2 text-on-surface">Ipon AI Insights</h2>
          </div>

          <div className="bg-white border border-error-container rounded-lg p-4 mb-6 relative">
            <div className="absolute -top-3 left-4 bg-error text-on-error font-label-xs text-label-xs px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
              <span className="material-symbols-outlined text-[10px]">warning</span> Smart Alert
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
            Review Budget <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>
      </section>
    </>
  );
}
