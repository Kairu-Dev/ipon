export default function ChatPage() {
  return (
    <div id="chat-page">
      {/* Left: Chat Thread */}
      <div className="left-panel">
        {/* Suggestion Chips */}
        <div className="p-4 flex gap-2 overflow-x-auto whitespace-nowrap border-b border-slate-100 bg-surface-container-lowest z-10 shrink-0 scrollbar-hide">
          <button className="suggestion-chip">
            <span className="material-symbols-outlined text-base text-primary">shopping_cart</span>
            Can I afford a ₱3,000 purchase?
          </button>
          <button className="suggestion-chip">
            <span className="material-symbols-outlined text-base text-primary">summarize</span>
            Summarize my week
          </button>
          <button className="suggestion-chip">
            <span className="material-symbols-outlined text-base text-primary">trending_down</span>
            How to lower food spending?
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col pb-24">
          {/* AI Bubble */}
          <div className="flex gap-3 max-w-[85%] self-start">
            <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center shrink-0 mt-1">
              <span className="material-symbols-outlined text-on-primary-container text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>colors_spark</span>
            </div>
            <div className="chat-bubble-ai-text">
              <p>Hi! I'm your Ipon AI assistant. I've analyzed your recent spending. You're doing great on groceries, but dining out is slightly above your usual budget this week. How can I help you today?</p>
            </div>
          </div>

          {/* User Bubble */}
          <div className="flex gap-3 max-w-[85%] self-end flex-row-reverse">
            <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 mt-1">
              <img alt="User profile" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAc9dUthN5WZD0wLD4YPCDkT7oMKVujg2l2zgAleBIiP0QzCTd1QpLcwTV0CN4hhsmHRgw_-Knpwrvr5Z62XLiwtYqoLYYX4azDTB-16IzAcMyfVE87JkaavK0olRco-OW6eRtu-z1UB7qLmnvnf2ocaNjTu-39VEEgM8OmsxnYOfA4AxfEgA3fgAXLbFBZcm5voXJLNsmFeV08gtVNaCPpvH3OuDiuihD_0JxhYd0UCXHEBIsWUNqvRXLf_HWlZtvV214AdSh--_pc"/>
            </div>
            <div className="chat-bubble-user">
              <p>Can I afford a ₱3,000 purchase for a new pair of shoes right now?</p>
            </div>
          </div>

          {/* AI Bubble */}
          <div className="flex gap-3 max-w-[85%] self-start">
            <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center shrink-0 mt-1">
              <span className="material-symbols-outlined text-on-primary-container text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>colors_spark</span>
            </div>
            <div className="chat-bubble-ai">
              <p>Looking at your current budget for this month:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>You have <strong>₱8,500</strong> left in your general "Shopping/Wants" category.</li>
                <li>Your essential bills are already covered.</li>
              </ul>
              <p><strong>Yes, you can afford it!</strong> It will leave you with ₱5,500 in your discretionary fund for the rest of the month.</p>
              
              <div className="mt-3 p-3 bg-surface-container-highest rounded-lg border border-surface-variant flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">check_circle</span>
                </div>
                <div>
                  <p className="font-label-md text-label-md text-on-surface">Safe to Spend</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Impact on savings: Minimal</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Input Bar */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-surface-container-lowest border-t border-slate-100">
          <div className="max-w-3xl mx-auto relative flex items-center">
            <button className="absolute left-3 text-on-surface-variant hover:text-primary transition-colors p-2">
              <span className="material-symbols-outlined">add_circle</span>
            </button>
            <input className="input-bar" placeholder="Ask about your finances..." type="text"/>
            <button className="absolute right-3 bg-primary text-on-primary w-8 h-8 rounded-full flex items-center justify-center hover:bg-primary-container transition-colors">
              <span className="material-symbols-outlined text-sm">arrow_upward</span>
            </button>
          </div>
        </div>
      </div>

      {/* Right: Monthly Context Panel */}
      <div className="right-panel">
        <div className="p-6 space-y-8">
          <div>
            <h2 className="font-h3 text-h3 text-on-surface mb-4">Monthly Context</h2>
            {/* Financial Summary Cards */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="summary-card">
                <p className="font-label-xs text-label-xs text-on-surface-variant uppercase mb-1">Income</p>
                <p className="font-currency text-currency text-primary">₱45,000</p>
              </div>
              <div className="summary-card">
                <p className="font-label-xs text-label-xs text-on-surface-variant uppercase mb-1">Expenses</p>
                <p className="font-currency text-currency text-on-surface">₱28,450</p>
              </div>
            </div>

            {/* Top Insight Category */}
            <div className="bg-surface-container-lowest p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-label-md text-label-md text-on-surface">Top Spending</h3>
                <span className="font-label-xs text-label-xs bg-surface-container px-2 py-1 rounded-md text-on-surface-variant">This Month</span>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Dining Out</span>
                  <span className="font-body-sm text-body-sm font-medium text-on-surface">₱8,200</span>
                </div>
                <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden">
                  <div className="bg-tertiary-container h-2 rounded-full" style={{ width: "65%" }}></div>
                </div>
                <p className="font-label-xs text-label-xs text-on-surface-variant mt-2 text-right">65% of dining budget</p>
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-h3 text-h3 text-on-surface">Recent</h3>
              <a className="text-primary font-label-md text-label-md hover:underline" href="#">View all</a>
            </div>
            <div className="bg-surface-container-lowest rounded-xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
              {/* Transaction Item */}
              <div className="transaction-item">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
                    <span className="material-symbols-outlined text-sm">restaurant</span>
                  </div>
                  <div>
                    <p className="font-label-md text-label-md text-on-surface">Mendokoro Ramenba</p>
                    <p className="font-label-xs text-label-xs text-on-surface-variant">Today</p>
                  </div>
                </div>
                <p className="font-body-sm text-body-sm font-medium text-on-surface">-₱850</p>
              </div>
              
              {/* Transaction Item */}
              <div className="transaction-item">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
                    <span className="material-symbols-outlined text-sm">local_taxi</span>
                  </div>
                  <div>
                    <p className="font-label-md text-label-md text-on-surface">GrabCar</p>
                    <p className="font-label-xs text-label-xs text-on-surface-variant">Yesterday</p>
                  </div>
                </div>
                <p className="font-body-sm text-body-sm font-medium text-on-surface">-₱320</p>
              </div>

              {/* Transaction Item */}
              <div className="transaction-item">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-sm">account_balance</span>
                  </div>
                  <div>
                    <p className="font-label-md text-label-md text-on-surface">Salary Deposit</p>
                    <p className="font-label-xs text-label-xs text-on-surface-variant">Oct 15</p>
                  </div>
                </div>
                <p className="font-body-sm text-body-sm font-medium text-primary">+₱22,500</p>
              </div>

              {/* Transaction Item */}
              <div className="transaction-item">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
                    <span className="material-symbols-outlined text-sm">shopping_bag</span>
                  </div>
                  <div>
                    <p className="font-label-md text-label-md text-on-surface">Uniqlo</p>
                    <p className="font-label-xs text-label-xs text-on-surface-variant">Oct 14</p>
                  </div>
                </div>
                <p className="font-body-sm text-body-sm font-medium text-on-surface">-₱1,490</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
