"use client";

import { useUIStore } from "@/store/ui-store";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export function ContributeGoalPanel() {
  const isContributeGoalPanelOpen = useUIStore((s) => s.isContributeGoalPanelOpen);
  const setContributeGoalPanelOpen = useUIStore((s) => s.setContributeGoalPanelOpen);

  return (
    <Sheet open={isContributeGoalPanelOpen} onOpenChange={setContributeGoalPanelOpen}>
      <SheetContent className="w-full max-w-[440px] sm:max-w-[440px] p-0 bg-surface-container-lowest border-l border-outline-variant flex flex-col">
        {/* Panel Header */}
        <SheetHeader className="px-6 py-5 border-b border-outline-variant bg-surface-container-lowest text-left">
          <SheetTitle className="font-h2 text-h2 text-on-surface">Contribute to Goal</SheetTitle>
        </SheetHeader>

        {/* Panel Content Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Target Goal Summary Card */}
          <div className="bg-surface-container-low rounded-xl p-5 border border-outline-variant/50">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-white border border-outline-variant flex items-center justify-center text-primary shadow-sm">
                <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>laptop_mac</span>
              </div>
              <div>
                <h3 className="font-h3 text-h3 text-on-surface">New MacBook Pro</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Target Amount: ₱120,000</p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-3 border border-outline-variant/30 flex justify-between items-center">
              <div>
                <p className="font-label-xs text-label-xs text-on-surface-variant mb-1 uppercase tracking-wider">Current Balance</p>
                <p className="font-currency text-currency text-on-surface">₱45,000.00</p>
              </div>
              <div className="text-right">
                <p className="font-label-xs text-label-xs text-on-surface-variant mb-1 uppercase tracking-wider">Remaining</p>
                <p className="font-currency text-currency text-primary">₱75,000.00</p>
              </div>
            </div>
          </div>

          {/* Input Section */}
          <div className="space-y-4">
            <label className="block font-label-md text-label-md text-on-surface" htmlFor="contribution-amount">Amount to Add</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="font-currency text-currency text-on-surface-variant">₱</span>
              </div>
              <input 
                className="block w-full pl-10 pr-4 py-4 bg-white border border-outline-variant rounded-xl font-currency text-currency text-on-surface placeholder-outline-variant focus:ring-2 focus:ring-primary focus:border-primary transition-shadow outline-none" 
                id="contribution-amount" 
                name="amount" 
                placeholder="0.00" 
                type="text" 
                defaultValue="1,000"
              />
            </div>
            
            {/* Quick Add Buttons */}
            <div className="flex gap-3 pt-2">
              <button className="flex-1 py-2 px-3 bg-white border border-outline-variant rounded-lg font-label-md text-label-md text-on-surface hover:bg-surface-container hover:border-outline transition-colors" type="button">
                +₱500
              </button>
              <button className="flex-1 py-2 px-3 bg-surface-container-high border border-primary text-primary rounded-lg font-label-md text-label-md hover:bg-surface-container-highest transition-colors" type="button">
                +₱1,000
              </button>
              <button className="flex-1 py-2 px-3 bg-white border border-outline-variant rounded-lg font-label-md text-label-md text-on-surface hover:bg-surface-container hover:border-outline transition-colors" type="button">
                +₱5,000
              </button>
            </div>
          </div>

          {/* Source Account */}
          <div className="space-y-3 pt-4 border-t border-outline-variant/30">
            <label className="block font-label-md text-label-md text-on-surface">From Account</label>
            <button className="w-full flex items-center justify-between p-4 bg-white border border-outline-variant rounded-xl hover:bg-surface-container transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-sm">account_balance</span>
                </div>
                <div className="text-left">
                  <p className="font-label-md text-label-md text-on-surface">Main Savings</p>
                  <p className="font-label-xs text-label-xs text-on-surface-variant">Available: ₱12,450.00</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant">expand_more</span>
            </button>
          </div>

        </div>

        {/* Panel Footer Actions */}
        <div className="p-6 border-t border-outline-variant bg-surface-container-lowest mt-auto">
          <button 
            onClick={() => setContributeGoalPanelOpen(false)}
            className="w-full bg-primary text-on-primary font-label-md text-label-md py-4 rounded-xl shadow-sm hover:bg-primary-container focus:ring-4 focus:ring-primary/20 transition-all active:scale-[0.98] flex justify-center items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">add_circle</span>
            Add Contribution
          </button>
        </div>

      </SheetContent>
    </Sheet>
  );
}
