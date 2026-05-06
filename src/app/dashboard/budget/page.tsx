
export default function BudgetPage() {
  return (
    <div id="budget-page">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-4">
        <div>
          <h2 className="font-h1 text-h1 text-on-surface">Budget Setup</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Manage your monthly spending limits.</p>
        </div>
        <button className="header-button">
          <span className="material-symbols-outlined text-sm">save</span>
          Save Changes
        </button>
      </div>

      {/* Top Summary Bento */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        {/* Total Budget Summary Card */}
        <div className="summary-card-main">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
          <div className="z-10 flex justify-between items-start mb-4">
            <div>
              <h3 className="font-h3 text-h3 text-on-surface">Total Remaining</h3>
              <div className="font-display text-display text-primary mt-1">₱12,450.00</div>
            </div>
            <div className="text-right">
              <p className="font-label-xs text-label-xs text-on-surface-variant uppercase tracking-wider mb-1">Spent / Budgeted</p>
              <p className="font-currency text-currency text-on-surface">₱17,550 <span className="text-on-surface-variant text-sm font-normal">/ ₱30,000</span></p>
            </div>
          </div>
          <div className="z-10 mt-auto">
            <div className="flex justify-between font-label-xs text-label-xs text-on-surface-variant mb-2">
              <span>58.5% Used</span>
              <span>41.5% Left</span>
            </div>
            <div className="h-3 w-full bg-primary/10 rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: "58.5%" }}></div>
            </div>
          </div>
        </div>

        {/* Income Allocated Card */}
        <div className="summary-card-secondary">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-h3 text-h3 text-on-surface">Income Allocated</h3>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-label-xs text-label-xs bg-primary/10 text-primary border border-primary/20">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mr-1.5"></span>
              On Track
            </span>
          </div>
          <div className="flex-1 flex flex-col justify-center items-center text-center py-4">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle className="text-surface-container-high" cx="50" cy="50" fill="transparent" r="40" stroke="currentColor" strokeWidth="8"></circle>
                <circle className="text-primary" cx="50" cy="50" fill="transparent" r="40" stroke="currentColor" strokeDasharray="251.2" strokeDashoffset="37.68" strokeWidth="8"></circle>
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="font-currency text-currency text-on-surface">85%</span>
                <span className="font-label-xs text-label-xs text-on-surface-variant">Allocated</span>
              </div>
            </div>
          </div>
          <div className="text-center font-body-sm text-body-sm text-on-surface-variant">
            ₱4,500 unallocated funds
          </div>
        </div>
      </div>

      {/* Categories List */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-h2 text-h2 text-on-surface">Expense Categories</h3>
          <button className="text-primary font-label-md text-label-md hover:text-primary-container flex items-center gap-1 transition-colors">
            <span className="material-symbols-outlined text-sm">add</span>
            Add Category
          </button>
        </div>

        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden flex flex-col gap-[1px] bg-outline-variant/30">
          {/* Category Row: Food (Under Budget - Green) */}
          <div className="category-row">
            <div className="flex items-center gap-4 flex-1">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined">restaurant</span>
              </div>
              <div>
                <h4 className="font-label-md text-label-md text-on-surface">Food & Dining</h4>
                <p className="font-label-xs text-label-xs text-on-surface-variant mt-0.5">Groceries, restaurants, snacks</p>
              </div>
            </div>
            <div className="desktop-progress-panel">
              <div className="flex justify-between font-label-xs text-label-xs mb-1.5">
                <span className="text-on-surface-variant">Spent ₱6,500</span>
                <span className="text-primary font-medium">65%</span>
              </div>
              <div className="h-2 w-full bg-primary/10 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: "65%" }}></div>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-body-sm text-on-surface-variant">₱</span>
                <input className="category-input" type="number" defaultValue="10000"/>
              </div>
              <button className="delete-button">
                <span className="material-symbols-outlined">delete</span>
              </button>
            </div>
            {/* Mobile Progress */}
            <div className="mobile-progress-panel">
              <div className="flex justify-between font-label-xs text-label-xs mb-1.5">
                <span className="text-on-surface-variant">Spent ₱6,500</span>
                <span className="text-primary font-medium">65%</span>
              </div>
              <div className="h-2 w-full bg-primary/10 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: "65%" }}></div>
              </div>
            </div>
          </div>

          {/* Category Row: Transport (Warning Budget - Amber) */}
          <div className="category-row">
            <div className="flex items-center gap-4 flex-1">
              <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined">directions_car</span>
              </div>
              <div>
                <h4 className="font-label-md text-label-md text-on-surface">Transportation</h4>
                <p className="font-label-xs text-label-xs text-on-surface-variant mt-0.5">Gas, commute, parking</p>
              </div>
            </div>
            <div className="desktop-progress-panel">
              <div className="flex justify-between font-label-xs text-label-xs mb-1.5">
                <span className="text-on-surface-variant">Spent ₱4,500</span>
                <span className="text-amber-600 font-medium">90%</span>
              </div>
              <div className="h-2 w-full bg-amber-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: "90%" }}></div>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-body-sm text-on-surface-variant">₱</span>
                <input className="category-input" type="number" defaultValue="5000"/>
              </div>
              <button className="delete-button">
                <span className="material-symbols-outlined">delete</span>
              </button>
            </div>
            {/* Mobile Progress */}
            <div className="mobile-progress-panel">
              <div className="flex justify-between font-label-xs text-label-xs mb-1.5">
                <span className="text-on-surface-variant">Spent ₱4,500</span>
                <span className="text-amber-600 font-medium">90%</span>
              </div>
              <div className="h-2 w-full bg-amber-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: "90%" }}></div>
              </div>
            </div>
          </div>

          {/* Category Row: Entertainment (Over Budget - Red) */}
          <div className="category-row">
            <div className="flex items-center gap-4 flex-1">
              <div className="w-12 h-12 rounded-full bg-error-container text-error flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined">movie</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-label-md text-label-md text-on-surface">Entertainment</h4>
                  <span className="bg-error text-on-error font-label-xs text-[10px] px-2 py-0.5 rounded-sm uppercase tracking-wide">Over Budget</span>
                </div>
                <p className="font-label-xs text-label-xs text-on-surface-variant mt-0.5">Movies, subscriptions, hobbies</p>
              </div>
            </div>
            <div className="desktop-progress-panel">
              <div className="flex justify-between font-label-xs text-label-xs mb-1.5">
                <span className="text-error font-medium">Spent ₱3,500</span>
                <span className="text-error font-medium">116%</span>
              </div>
              <div className="h-2 w-full bg-error-container rounded-full overflow-hidden">
                <div className="h-full bg-error rounded-full" style={{ width: "100%" }}></div>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-body-sm text-on-surface-variant">₱</span>
                <input className="category-input-error" type="number" defaultValue="3000"/>
              </div>
              <button className="delete-button">
                <span className="material-symbols-outlined">delete</span>
              </button>
            </div>
            {/* Mobile Progress */}
            <div className="mobile-progress-panel">
              <div className="flex justify-between font-label-xs text-label-xs mb-1.5">
                <span className="text-error font-medium">Spent ₱3,500</span>
                <span className="text-error font-medium">116%</span>
              </div>
              <div className="h-2 w-full bg-error-container rounded-full overflow-hidden">
                <div className="h-full bg-error rounded-full" style={{ width: "100%" }}></div>
              </div>
            </div>
          </div>

          {/* Category Row: Utilities (Under Budget - Green) */}
          <div className="category-row">
            <div className="flex items-center gap-4 flex-1">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined">bolt</span>
              </div>
              <div>
                <h4 className="font-label-md text-label-md text-on-surface">Utilities</h4>
                <p className="font-label-xs text-label-xs text-on-surface-variant mt-0.5">Electricity, water, internet</p>
              </div>
            </div>
            <div className="desktop-progress-panel">
              <div className="flex justify-between font-label-xs text-label-xs mb-1.5">
                <span className="text-on-surface-variant">Spent ₱3,050</span>
                <span className="text-primary font-medium">38%</span>
              </div>
              <div className="h-2 w-full bg-primary/10 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: "38%" }}></div>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-body-sm text-on-surface-variant">₱</span>
                <input className="category-input" type="number" defaultValue="8000"/>
              </div>
              <button className="delete-button">
                <span className="material-symbols-outlined">delete</span>
              </button>
            </div>
            {/* Mobile Progress */}
            <div className="mobile-progress-panel">
              <div className="flex justify-between font-label-xs text-label-xs mb-1.5">
                <span className="text-on-surface-variant">Spent ₱3,050</span>
                <span className="text-primary font-medium">38%</span>
              </div>
              <div className="h-2 w-full bg-primary/10 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: "38%" }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
