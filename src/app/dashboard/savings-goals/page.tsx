"use client";

import { useUIStore } from "@/store/ui-store";
import { CreateGoalModal, GoalGrid } from "@/components/goals";
import { ContributeGoalPanel } from "@/components/dashboard/contribute-goal-panel";

export default function SavingsGoalsPage() {
  const setCreateGoalModalOpen = useUIStore((s) => s.setCreateGoalModalOpen);

  return (
    <>
      {/* Page Header Section */}
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="font-h1 text-h1 text-on-surface">Savings Goals</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Track and manage your targets.</p>
        </div>
        <button 
          onClick={() => setCreateGoalModalOpen(true)}
          className="bg-primary text-on-primary font-label-md text-label-md px-6 py-3 rounded-full hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-sm"
        >
          New Goal 
          <span className="material-symbols-outlined text-sm" aria-hidden="true">add</span>
        </button>
      </div>

      <GoalGrid />

      <CreateGoalModal />
      <ContributeGoalPanel />
    </>
  );
}
