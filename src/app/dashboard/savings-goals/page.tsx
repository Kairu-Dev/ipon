"use client";

import { useUIStore } from "@/store/ui-store";
import { CreateGoalModal } from "@/components/dashboard/create-goal-modal";
import { ContributeGoalPanel } from "@/components/dashboard/contribute-goal-panel";

export default function SavingsGoalsPage() {
  const setCreateGoalModalOpen = useUIStore((s) => s.setCreateGoalModalOpen);
  const setContributeGoalPanelOpen = useUIStore((s) => s.setContributeGoalPanelOpen);

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
          <span className="material-symbols-outlined text-sm">add</span>
        </button>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Goal Card 1: Emergency Fund (In Progress) */}
        <div 
          onClick={() => setContributeGoalPanelOpen(true)}
          className="bg-surface border border-outline-variant rounded-xl p-[24px] shadow-sm relative flex flex-col group hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="absolute top-6 right-6 bg-primary-container text-on-primary-container px-3 py-1 rounded-full font-label-xs text-label-xs">
            45%
          </div>
          <div className="w-12 h-12 bg-surface-container rounded-full flex items-center justify-center text-2xl mb-4">
            🛡️
          </div>
          <h3 className="font-h3 text-h3 text-on-surface mb-1">Emergency Fund</h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant mb-4 flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">event</span>
            Dec 2024
          </p>
          <div className="mt-auto">
            <div className="flex justify-between items-end mb-2">
              <span className="font-body-sm text-body-sm text-on-surface-variant">Saved</span>
              <div className="text-right">
                <span className="font-currency text-currency text-primary">₱45,000</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant"> / ₱100,000</span>
              </div>
            </div>
            <div className="w-full bg-primary/10 rounded-full h-2.5 overflow-hidden">
              <div className="bg-primary h-full rounded-full" style={{ width: "45%" }}></div>
            </div>
          </div>
        </div>

        {/* Goal Card 2: Japan Trip (Near Completion) */}
        <div 
          onClick={() => setContributeGoalPanelOpen(true)}
          className="bg-surface border border-outline-variant rounded-xl p-[24px] shadow-sm relative flex flex-col group hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="absolute top-6 right-6 bg-primary-container text-on-primary-container px-3 py-1 rounded-full font-label-xs text-label-xs">
            85%
          </div>
          <div className="w-12 h-12 bg-surface-container rounded-full flex items-center justify-center text-2xl mb-4">
            ✈️
          </div>
          <h3 className="font-h3 text-h3 text-on-surface mb-1">Japan Trip</h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant mb-4 flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">event</span>
            Oct 2024
          </p>
          <div className="mt-auto">
            <div className="flex justify-between items-end mb-2">
              <span className="font-body-sm text-body-sm text-on-surface-variant">Saved</span>
              <div className="text-right">
                <span className="font-currency text-currency text-primary">₱68,000</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant"> / ₱80,000</span>
              </div>
            </div>
            <div className="w-full bg-primary/10 rounded-full h-2.5 overflow-hidden">
              <div className="bg-primary h-full rounded-full" style={{ width: "85%" }}></div>
            </div>
          </div>
        </div>

        {/* Goal Card 3: New Laptop (Completed) */}
        <div 
          onClick={() => setContributeGoalPanelOpen(true)}
          className="bg-surface border border-primary/30 rounded-xl p-[24px] shadow-sm relative flex flex-col group hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="absolute top-6 right-6 bg-primary text-on-primary px-3 py-1 rounded-full font-label-xs text-label-xs flex items-center gap-1 shadow-sm">
            Completed <span className="material-symbols-outlined text-[14px]">check</span>
          </div>
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center text-2xl mb-4">
            💻
          </div>
          <h3 className="font-h3 text-h3 text-on-surface mb-1">New Laptop</h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant mb-4 flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">event</span>
            Achieved Mar 2024
          </p>
          <div className="mt-auto">
            <div className="flex justify-between items-end mb-2">
              <span className="font-body-sm text-body-sm text-on-surface-variant">Saved</span>
              <div className="text-right">
                <span className="font-currency text-currency text-primary">₱75,000</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant"> / ₱75,000</span>
              </div>
            </div>
            <div className="w-full bg-primary/10 rounded-full h-2.5 overflow-hidden">
              <div className="bg-primary h-full rounded-full" style={{ width: "100%" }}></div>
            </div>
          </div>
        </div>

        {/* Goal Card 4: Car Downpayment (Starting) */}
        <div 
          onClick={() => setContributeGoalPanelOpen(true)}
          className="bg-surface border border-outline-variant rounded-xl p-[24px] shadow-sm relative flex flex-col group hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="absolute top-6 right-6 bg-surface-container-high text-on-surface px-3 py-1 rounded-full font-label-xs text-label-xs border border-outline-variant">
            10%
          </div>
          <div className="w-12 h-12 bg-surface-container rounded-full flex items-center justify-center text-2xl mb-4">
            🚗
          </div>
          <h3 className="font-h3 text-h3 text-on-surface mb-1">Car Downpayment</h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant mb-4 flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">event</span>
            Jan 2026
          </p>
          <div className="mt-auto">
            <div className="flex justify-between items-end mb-2">
              <span className="font-body-sm text-body-sm text-on-surface-variant">Saved</span>
              <div className="text-right">
                <span className="font-currency text-currency text-primary">₱20,000</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant"> / ₱200,000</span>
              </div>
            </div>
            <div className="w-full bg-primary/10 rounded-full h-2.5 overflow-hidden">
              <div className="bg-primary h-full rounded-full" style={{ width: "10%" }}></div>
            </div>
          </div>
        </div>
      </div>

      <CreateGoalModal />
      <ContributeGoalPanel />
    </>
  );
}
