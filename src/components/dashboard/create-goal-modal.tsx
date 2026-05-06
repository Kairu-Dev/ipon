"use client";

import { useUIStore } from "@/store/ui-store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function CreateGoalModal() {
  const isCreateGoalModalOpen = useUIStore((s) => s.isCreateGoalModalOpen);
  const setCreateGoalModalOpen = useUIStore((s) => s.setCreateGoalModalOpen);

  return (
    <Dialog open={isCreateGoalModalOpen} onOpenChange={setCreateGoalModalOpen}>
      <DialogContent className="sm:max-w-md bg-surface-container-lowest p-0 overflow-hidden border-slate-200">

        {/* Modal Header */}
        <DialogHeader className="px-6 py-5 border-b border-slate-100 bg-surface-bright">
          <DialogTitle className="font-h2 text-h2 text-on-surface">Create New Goal</DialogTitle>
        </DialogHeader>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto max-h-[60vh] flex-1">
          <form className="flex flex-col gap-6">
            {/* Icon Selector Row */}
            <div>
              <label className="font-label-md text-label-md text-on-surface block mb-3">Choose an Icon</label>
              <div className="flex gap-3 justify-between">
                <button className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center border-2 border-primary focus:outline-none ring-2 ring-primary/20 transition-all" type="button" aria-label="Travel">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }} aria-hidden="true">flight</span>
                </button>
                <button className="w-12 h-12 rounded-full bg-surface-variant text-on-surface-variant flex items-center justify-center border-2 border-transparent hover:border-slate-300 focus:outline-none transition-all" type="button" aria-label="Technology">
                  <span className="material-symbols-outlined" aria-hidden="true">laptop_mac</span>
                </button>
                <button className="w-12 h-12 rounded-full bg-surface-variant text-on-surface-variant flex items-center justify-center border-2 border-transparent hover:border-slate-300 focus:outline-none transition-all" type="button" aria-label="Home">
                  <span className="material-symbols-outlined" aria-hidden="true">home</span>
                </button>
                <button className="w-12 h-12 rounded-full bg-surface-variant text-on-surface-variant flex items-center justify-center border-2 border-transparent hover:border-slate-300 focus:outline-none transition-all" type="button" aria-label="Health">
                  <span className="material-symbols-outlined" aria-hidden="true">favorite</span>
                </button>
                <button className="w-12 h-12 rounded-full bg-surface-variant text-on-surface-variant flex items-center justify-center border-2 border-transparent hover:border-slate-300 focus:outline-none transition-all" type="button" aria-label="General">
                  <span className="material-symbols-outlined" aria-hidden="true">star</span>
                </button>
                <button className="w-12 h-12 rounded-full bg-surface-variant text-on-surface-variant flex items-center justify-center border-2 border-transparent hover:border-slate-300 focus:outline-none transition-all" type="button" aria-label="Gifts">
                  <span className="material-symbols-outlined" aria-hidden="true">featured_seasonal_and_gifts</span>
                </button>
              </div>
            </div>

            {/* Goal Name Input */}
            <div>
              <label className="font-label-md text-label-md text-on-surface block mb-2" htmlFor="goal-name">Goal Name</label>
              <input className="w-full px-4 py-3 bg-surface-bright border border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 text-body-base font-body-base transition-all placeholder:text-slate-400" id="goal-name" placeholder="e.g. Japan Trip 2024" type="text" />
            </div>

            {/* Target Amount Input */}
            <div>
              <label className="font-label-md text-label-md text-on-surface block mb-2" htmlFor="target-amount">Target Amount</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-currency text-currency text-on-surface-variant">₱</span>
                <input className="w-full pl-10 pr-4 py-3 bg-surface-bright border border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 text-body-base font-body-base transition-all placeholder:text-slate-400" id="target-amount" placeholder="0.00" type="number" />
              </div>
            </div>

            {/* Initial Deposit Input (Optional) */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="font-label-md text-label-md text-on-surface" htmlFor="initial-deposit">Initial Deposit</label>
                <span className="font-label-xs text-label-xs text-slate-400">Optional</span>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-currency text-currency text-on-surface-variant">₱</span>
                <input className="w-full pl-10 pr-4 py-3 bg-surface-bright border border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 text-body-base font-body-base transition-all placeholder:text-slate-400" id="initial-deposit" placeholder="0.00" type="number" />
              </div>
            </div>

            {/* Deadline Date Picker */}
            <div>
              <label className="font-label-md text-label-md text-on-surface block mb-2" htmlFor="deadline-date">Target Deadline</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true">calendar_today</span>
                <input className="w-full pl-12 pr-4 py-3 bg-surface-bright border border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 text-body-base font-body-base text-on-surface transition-all appearance-none" id="deadline-date" type="date" />
              </div>
            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-5 bg-surface-bright border-t border-slate-100 flex flex-col gap-3">
          <button onClick={() => setCreateGoalModalOpen(false)} className="w-full py-3 px-4 bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md rounded-lg transition-colors flex items-center justify-center shadow-sm" type="button">
            Create Goal
          </button>
          <button onClick={() => setCreateGoalModalOpen(false)} className="w-full py-2 px-4 text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-colors text-center bg-transparent border-none" type="button">
            Cancel
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
