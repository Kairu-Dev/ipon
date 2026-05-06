"use client";

import { useState } from "react";
import { useUIStore } from "@/store/ui-store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function AddTransactionModal() {
  const isAddTransactionModalOpen = useUIStore((s) => s.isAddTransactionModalOpen);
  const setAddTransactionModalOpen = useUIStore((s) => s.setAddTransactionModalOpen);
  const [type, setType] = useState<"expense" | "income">("expense");

  return (
    <Dialog open={isAddTransactionModalOpen} onOpenChange={setAddTransactionModalOpen}>
      <DialogContent className="sm:max-w-md bg-surface p-0 overflow-hidden border-outline-variant/30 flex flex-col max-h-[90vh] rounded-2xl gap-0">
        {/* Modal Header */}
        <DialogHeader className="px-6 py-4 border-b border-outline-variant/50 flex justify-between items-center bg-white/50 rounded-t-2xl">
          <DialogTitle className="font-h3 text-h3 text-on-surface">Add Transaction</DialogTitle>
        </DialogHeader>

        {/* Modal Body (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-8 flex-1">
          {/* Segmented Toggle */}
          <div className="flex p-1 bg-surface-container rounded-lg border border-outline-variant/30">
            <button 
              onClick={() => setType("expense")}
              className={`flex-1 py-2 text-center rounded-md font-label-md text-label-md transition-all ${type === "expense" ? "bg-primary text-on-primary shadow-sm" : "text-secondary hover:text-on-surface"}`}
            >
              Expense
            </button>
            <button 
              onClick={() => setType("income")}
              className={`flex-1 py-2 text-center rounded-md font-label-md text-label-md transition-all ${type === "income" ? "bg-primary text-on-primary shadow-sm" : "text-secondary hover:text-on-surface"}`}
            >
              Income
            </button>
          </div>

          {/* Amount Input */}
          <div className="flex flex-col items-center justify-center py-4 space-y-2">
            <p className="font-label-xs text-label-xs text-secondary uppercase tracking-wider">Amount</p>
            <div className="flex items-center justify-center gap-1 text-on-surface">
              <span className="font-currency text-display text-primary">₱</span>
              <div className="relative flex items-center">
                <input 
                  className="w-full max-w-[200px] text-center bg-transparent border-none p-0 m-0 font-currency text-display text-on-surface placeholder-outline-variant focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none" 
                  type="text" 
                  defaultValue="1,250.00" 
                />
                <span className="h-10 w-[2px] bg-primary animate-pulse ml-1 rounded-full absolute -right-2" aria-hidden="true"></span>
              </div>
            </div>
          </div>

          {/* AI Suggestion & Category Grid */}
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <label className="font-label-md text-label-md text-on-surface" id="category-label">Category</label>
              <div className="bg-primary-container/20 text-primary-container px-3 py-1 rounded-full flex items-center gap-1.5 border border-primary-container/30">
                <span className="material-symbols-outlined text-[14px]" aria-hidden="true">auto_awesome</span>
                <span className="font-label-xs text-label-xs">AI suggests: {type === "expense" ? "Food" : "Salary"}</span>
              </div>
            </div>
            
            {type === "expense" ? (
              <div className="grid grid-cols-3 gap-3" role="group" aria-labelledby="category-label">
                {/* Food (Selected) */}
                <button className="flex flex-col items-center justify-center p-3 rounded-xl border-2 border-primary bg-primary/5 text-primary transition-all shadow-sm">
                  <span className="material-symbols-outlined mb-1 text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }} aria-hidden="true">restaurant</span>
                  <span className="font-label-xs text-label-xs">Food</span>
                </button>
                
                {/* Transpo */}
                <button className="flex flex-col items-center justify-center p-3 rounded-xl border border-outline-variant bg-white text-secondary hover:border-primary/50 hover:bg-primary/5 transition-all">
                  <span className="material-symbols-outlined mb-1 text-[24px]" aria-hidden="true">directions_bus</span>
                  <span className="font-label-xs text-label-xs">Transpo</span>
                </button>
                
                {/* Load */}
                <button className="flex flex-col items-center justify-center p-3 rounded-xl border border-outline-variant bg-white text-secondary hover:border-primary/50 hover:bg-primary/5 transition-all">
                  <span className="material-symbols-outlined mb-1 text-[24px]" aria-hidden="true">wifi</span>
                  <span className="font-label-xs text-label-xs">Load</span>
                </button>
                
                {/* Rent */}
                <button className="flex flex-col items-center justify-center p-3 rounded-xl border border-outline-variant bg-white text-secondary hover:border-primary/50 hover:bg-primary/5 transition-all">
                  <span className="material-symbols-outlined mb-1 text-[24px]" aria-hidden="true">home</span>
                  <span className="font-label-xs text-label-xs">Rent</span>
                </button>
                
                {/* Shopping */}
                <button className="flex flex-col items-center justify-center p-3 rounded-xl border border-outline-variant bg-white text-secondary hover:border-primary/50 hover:bg-primary/5 transition-all">
                  <span className="material-symbols-outlined mb-1 text-[24px]" aria-hidden="true">shopping_bag</span>
                  <span className="font-label-xs text-label-xs">Shopping</span>
                </button>
                
                {/* Others */}
                <button className="flex flex-col items-center justify-center p-3 rounded-xl border border-outline-variant bg-white text-secondary hover:border-primary/50 hover:bg-primary/5 transition-all">
                  <span className="material-symbols-outlined mb-1 text-[24px]" aria-hidden="true">more_horiz</span>
                  <span className="font-label-xs text-label-xs">Others</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3" role="group" aria-labelledby="category-label">
                {/* Salary (Selected) */}
                <button className="flex flex-col items-center justify-center p-3 rounded-xl border-2 border-primary bg-primary/5 text-primary transition-all shadow-sm">
                  <span className="material-symbols-outlined mb-1 text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }} aria-hidden="true">work</span>
                  <span className="font-label-xs text-label-xs">Salary</span>
                </button>
                
                {/* Allowance */}
                <button className="flex flex-col items-center justify-center p-3 rounded-xl border border-outline-variant bg-white text-secondary hover:border-primary/50 hover:bg-primary/5 transition-all">
                  <span className="material-symbols-outlined mb-1 text-[24px]" aria-hidden="true">account_balance_wallet</span>
                  <span className="font-label-xs text-label-xs">Allowance</span>
                </button>
                
                {/* Freelance */}
                <button className="flex flex-col items-center justify-center p-3 rounded-xl border border-outline-variant bg-white text-secondary hover:border-primary/50 hover:bg-primary/5 transition-all">
                  <span className="material-symbols-outlined mb-1 text-[24px]" aria-hidden="true">laptop_mac</span>
                  <span className="font-label-xs text-label-xs">Freelance</span>
                </button>
                
                {/* Others */}
                <button className="flex flex-col items-center justify-center p-3 rounded-xl border border-outline-variant bg-white text-secondary hover:border-primary/50 hover:bg-primary/5 transition-all">
                  <span className="material-symbols-outlined mb-1 text-[24px]" aria-hidden="true">more_horiz</span>
                  <span className="font-label-xs text-label-xs">Others</span>
                </button>
              </div>
            )}
          </div>

          {/* Date & Note Inputs */}
          <div className="space-y-4">
            {/* Date Picker */}
            <div className="space-y-1">
              <label className="font-label-md text-label-md text-on-surface" htmlFor="txn-date">Date</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-secondary">
                  <span className="material-symbols-outlined text-[20px]" aria-hidden="true">calendar_today</span>
                </div>
                <input 
                  className="w-full pl-10 pr-3 py-2.5 bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary font-body-sm text-body-sm text-on-surface transition-all" 
                  id="txn-date"
                  type="date" 
                  defaultValue="2023-10-24" 
                />
              </div>
            </div>
            
            {/* Note */}
            <div className="space-y-1">
              <label className="font-label-md text-label-md text-on-surface flex justify-between" htmlFor="txn-note">
                Note <span className="text-outline font-normal">Optional</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 pt-2.5 pointer-events-none text-secondary">
                  <span className="material-symbols-outlined text-[20px]" aria-hidden="true">edit_note</span>
                </div>
                <textarea 
                  className="w-full pl-10 pr-3 py-2.5 bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary font-body-sm text-body-sm text-on-surface placeholder-outline-variant transition-all resize-none" 
                  id="txn-note"
                  placeholder="What was this for?" 
                  rows={2}
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-outline-variant/50 bg-white/50 rounded-b-2xl mt-auto">
          <button 
            onClick={() => setAddTransactionModalOpen(false)}
            className="w-full py-3.5 bg-primary text-on-primary rounded-xl font-label-md text-label-md shadow-sm hover:bg-primary-container transition-colors flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">check_circle</span>
            Save Entry
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
