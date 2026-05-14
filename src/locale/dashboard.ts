export const dashboardLocale = {
  summary: {
    totalIncome: "Total Income",
    totalExpenses: "Total Expenses",
    remainingBalance: "Remaining Balance",
    safeToSpend: "Safe to spend this week",
    vsLastMonth: "vs last month",
    noComparison: "No comparison yet — keep tracking!",
  },
  tooltips: {
    noComparison:
      "We need at least 2 months of data to show how your finances are trending. Keep logging your transactions!",
    trendUp: "Your figure this month is {value}% higher than last month.",
    trendDown: "Your figure this month is {value}% lower than last month.",
    trendFlat: "Your figure this month is about the same as last month.",
    remainingBalance:
      "Your total income minus total expenses this month. This is how much you have left to work with.",
    safeToSpend:
      "Your remaining balance divided by the weeks left this month — a rough weekly spending guide to avoid running out before month-end.",
    spendingBar:
      "You've used {percent}% of your {category} budget this month. Your limit is {limit}.",
  },
  aiInsights: {
    title: "Ipon AI Insights",
    smartAlert: "Smart Alert",
    reviewBudget: "Review Budget",
    fallback: "Add more transactions to get personalized insights.",
    error: "Insights unavailable right now. Try again later.",
    rateLimitError: "AI is currently very busy. Please try again in a few minutes.",
    loading: "Analyzing your spending...",
    refreshesLeft: "{count}/3 refreshes left today",
    refreshButton: "Refresh insight",
    refreshing: "Refreshing...",
  },
  goals: {
    title: "Savings Goals",
    viewAll: "View All",
    emptyState: "No savings goals yet",
    createGoal: "Create Goal",
  },
  header: {
    greeting: "Kumusta, {name}!",
    subtitle: "Here's your financial overview for this month.",
    fallbackName: "there",
  },
};
