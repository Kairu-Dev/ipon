"use client";

import { useUIStore } from "@/store/ui-store";
import { AddTransactionModal } from "@/components/dashboard/add-transaction-modal";

export default function TransactionsPage() {
  const { setAddTransactionModalOpen } = useUIStore();

  return (
    <div className="flex flex-col gap-12">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-h2 text-h2 text-on-surface">Transactions</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Manage and track your income and expenses.</p>
        </div>
        <button 
          onClick={() => setAddTransactionModalOpen(true)}
          className="bg-primary text-on-primary font-label-md text-label-md px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-primary-container transition-colors shadow-sm active:scale-95"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Log Transaction
        </button>
      </div>

      {/* Filters & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-[0_2px_4px_-2px_rgb(0,0,0,0.05)]">
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 rounded-lg bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors hover:bg-surface-dim">All</button>
          <button className="px-4 py-2 rounded-lg text-on-surface-variant font-label-md text-label-md transition-colors hover:bg-surface-container">Income</button>
          <button className="px-4 py-2 rounded-lg text-on-surface-variant font-label-md text-label-md transition-colors hover:bg-surface-container">Expense</button>
        </div>
        <div className="relative">
          <select className="appearance-none bg-surface border border-outline-variant text-on-surface font-body-sm text-body-sm rounded-lg pl-4 pr-10 py-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none cursor-pointer">
            <option>All Categories</option>
            <option>Food & Dining</option>
            <option>Transportation</option>
            <option>Shopping</option>
            <option>Salary</option>
          </select>
          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
        </div>
      </div>

      {/* Transaction List Grouped */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-[0_4px_6px_-1px_rgb(0,0,0,0.05)] overflow-hidden">
        {/* Date Group 1 */}
        <div className="border-b border-surface-container">
          <div className="bg-surface-container-low px-6 py-2 border-b border-surface-container">
            <span className="font-label-md text-label-md text-on-surface-variant">Today, Oct 24</span>
          </div>
          <div className="flex flex-col">
            {/* Item */}
            <div className="flex items-center justify-between px-6 py-4 hover:bg-surface-container-low transition-colors group cursor-pointer border-b border-surface-container last:border-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>restaurant</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-body-base text-body-base font-semibold text-on-surface">Jollibee Lunch</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Food & Dining • Debit Card</span>
                </div>
              </div>
              <span className="font-currency text-currency text-error">-₱245.00</span>
            </div>
            {/* Item */}
            <div className="flex items-center justify-between px-6 py-4 hover:bg-surface-container-low transition-colors group cursor-pointer border-b border-surface-container last:border-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>directions_bus</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-body-base text-body-base font-semibold text-on-surface">Jeepney Fare</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Transportation • Cash</span>
                </div>
              </div>
              <span className="font-currency text-currency text-error">-₱30.00</span>
            </div>
          </div>
        </div>

        {/* Date Group 2 */}
        <div className="border-b border-surface-container last:border-0">
          <div className="bg-surface-container-low px-6 py-2 border-b border-surface-container">
            <span className="font-label-md text-label-md text-on-surface-variant">Yesterday, Oct 23</span>
          </div>
          <div className="flex flex-col">
            {/* Item */}
            <div className="flex items-center justify-between px-6 py-4 hover:bg-surface-container-low transition-colors group cursor-pointer border-b border-surface-container last:border-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-body-base text-body-base font-semibold text-on-surface">Part-time Salary</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Income • Bank Transfer</span>
                </div>
              </div>
              <span className="font-currency text-currency text-primary">+₱4,500.00</span>
            </div>
            {/* Item */}
            <div className="flex items-center justify-between px-6 py-4 hover:bg-surface-container-low transition-colors group cursor-pointer border-b border-surface-container last:border-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>shopping_bag</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-body-base text-body-base font-semibold text-on-surface">National Book Store</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Supplies • GCash</span>
                </div>
              </div>
              <span className="font-currency text-currency text-error">-₱450.00</span>
            </div>
            {/* Item */}
            <div className="flex items-center justify-between px-6 py-4 hover:bg-surface-container-low transition-colors group cursor-pointer border-b border-surface-container last:border-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>local_cafe</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-body-base text-body-base font-semibold text-on-surface">Coffee Shop Study</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Food & Dining • Debit Card</span>
                </div>
              </div>
              <span className="font-currency text-currency text-error">-₱180.00</span>
            </div>
          </div>
        </div>
      </div>

      {/* Load More Action */}
      <div className="flex justify-center mt-4">
        <button className="border border-primary text-primary font-label-md text-label-md px-6 py-3 rounded-lg hover:bg-primary-container hover:text-on-primary-container hover:border-transparent transition-all active:scale-95 flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">refresh</span>
          Load more transactions
        </button>
      </div>

      <AddTransactionModal />
    </div>
  );
}
