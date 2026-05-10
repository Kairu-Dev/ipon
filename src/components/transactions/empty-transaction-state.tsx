/**
 * Empty state displayed when no transactions match the current filters.
 * Pure presentational component — no data fetching or side effects.
 */
export function EmptyTransactionState() {
  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-12 flex flex-col items-center justify-center text-center">
      {/* Empty state icon */}
      <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-secondary mb-4">
        <span className="material-symbols-outlined text-3xl">receipt_long</span>
      </div>
      <h3 className="font-h3 text-h3 text-on-surface mb-2">No transactions found</h3>
      <p className="font-body-base text-body-base text-secondary max-w-sm">
        You don&apos;t have any transactions matching these filters yet. Log a new transaction to get started.
      </p>
    </div>
  );
}
