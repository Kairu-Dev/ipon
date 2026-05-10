"use client";

import { useUIStore } from "@/store/ui-store";
import { AddTransactionModal, TransactionList } from "@/components/transactions";

export default function TransactionsPage() {
  const setAddTransactionModalOpen = useUIStore((s) => s.setAddTransactionModalOpen);

  return (
    <div className="flex flex-col gap-12">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-h2 text-h2 text-on-surface">Transactions</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
            Manage and track your income and expenses.
          </p>
        </div>
        <button
          onClick={() => setAddTransactionModalOpen(true)}
          className="bg-primary text-on-primary font-label-md text-label-md px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-primary-container transition-colors shadow-sm active:scale-95"
        >
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
            add
          </span>
          Log Transaction
        </button>
      </div>

      {/* Dynamic transaction list with filters and pagination */}
      <TransactionList />

      {/* Add Transaction Modal */}
      <AddTransactionModal />
    </div>
  );
}
