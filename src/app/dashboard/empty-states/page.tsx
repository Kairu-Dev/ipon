

export default function EmptyStatesPage() {
  return (
    <div id="empty-states-page">
      {/* Page Greeting */}
      <div className="mb-12">
        <h2 className="font-display text-display text-on-surface mb-1">Welcome to your Dashboard</h2>
        <p className="font-body-base text-body-base text-on-surface-variant">Let&apos;s get your finances set up.</p>
      </div>

      {/* Empty States Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* No Transactions Card */}
        <div className="card">
          <div className="icon-wrapper">
            <span className="material-symbols-outlined text-4xl text-primary">receipt_long</span>
          </div>
          <h3 className="font-h3 text-h3 text-on-surface mb-2">No transactions yet</h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant mb-8">Start tracking your daily expenses and income to see where your money goes.</p>
          <button className="primary-btn">
            Add Transaction
          </button>
        </div>

        {/* No Savings Goals Card */}
        <div className="card">
          <div className="icon-wrapper">
            <span className="material-symbols-outlined text-4xl text-primary">savings</span>
          </div>
          <h3 className="font-h3 text-h3 text-on-surface mb-2">No savings goals</h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant mb-8">Dream big! Set up a goal for that new laptop, vacation, or emergency fund.</p>
          <button className="primary-btn">
            Create Goal
          </button>
        </div>

        {/* No Budgets Set Card */}
        <div className="card">
          <div className="icon-wrapper">
            <span className="material-symbols-outlined text-4xl text-primary">account_balance_wallet</span>
          </div>
          <h3 className="font-h3 text-h3 text-on-surface mb-2">No budgets set</h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant mb-8">Take control of your spending by setting monthly limits for different categories.</p>
          <button className="primary-btn">
            Set Budget
          </button>
        </div>
      </div>
      
      {/* Demo of Modal for Mockup purposes */}
      {/* <CreateGoalModal /> */}
    </div>
  );
}
