import { SAVINGS_CATEGORY } from "../constants";

export interface PromptData {
  transactions: { type: string; amount: number; category: string }[];
  prevTransactions: { type: string; amount: number; category: string }[];
  budgets: { category: string; monthlyLimit: number }[];
  goals: { name: string; targetAmount: number; savedAmount: number; deadline: string }[];
}

export function buildInsightPrompt(data: PromptData): string {
  // Build category breakdown string for the prompt
  const categoryTotals: Record<string, number> = {};
  for (const tx of data.transactions) {
    if (tx.type === "expense" && tx.category !== SAVINGS_CATEGORY) {
      categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + tx.amount;
    }
  }

  const categoryBreakdown = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .map(([cat, amount]) => `- ${cat}: ₱${amount.toLocaleString()}`)
    .join("\n");

  // Build budget limits string for the prompt
  const budgetLimits = data.budgets.length > 0
    ? data.budgets
        .map((b) => {
          const spent = categoryTotals[b.category] || 0;
          const diff = spent - b.monthlyLimit;
          if (diff > 0) {
            return `- ${b.category}: ₱${b.monthlyLimit.toLocaleString()} limit (OVER BUDGET by ₱${diff.toLocaleString()})`;
          }
          return `- ${b.category}: ₱${b.monthlyLimit.toLocaleString()} limit (₱${Math.abs(diff).toLocaleString()} remaining)`;
        })
        .join("\n")
    : "No budget limits set.";

  // Month over month comparison
  const prevCategoryTotals: Record<string, number> = {};
  for (const tx of data.prevTransactions) {
    if (tx.type === "expense" && tx.category !== SAVINGS_CATEGORY) {
      prevCategoryTotals[tx.category] = (prevCategoryTotals[tx.category] || 0) + tx.amount;
    }
  }

  const monthOverMonthComparison = Object.entries(categoryTotals)
    .map(([cat, amount]) => {
      const prev = prevCategoryTotals[cat] || 0;
      if (prev === 0) {
        return `- ${cat}: ₱${amount.toLocaleString()} (no previous month data — do not make trend claims)`;
      }
      const diff = amount - prev;
      const sign = diff > 0 ? "+" : "";
      return `- ${cat}: ₱${amount.toLocaleString()} (${sign}₱${Math.abs(diff).toLocaleString()} vs last month)`;
    })
    .join("\n") || "No previous month data available.";

  // Goals summary (excluding completed goals)
  const activeGoals = data.goals.filter(g => g.savedAmount < g.targetAmount);
  const goalsSummary = activeGoals.length > 0
    ? activeGoals.map(g => {
        const pct = Math.floor((g.savedAmount / g.targetAmount) * 100);
        const remaining = g.targetAmount - g.savedAmount;
        return `- ${g.name}: ${pct}% saved (₱${g.savedAmount.toLocaleString()} / ₱${g.targetAmount.toLocaleString()}, ₱${remaining.toLocaleString()} remaining, deadline: ${g.deadline})`;
      }).join("\n")
    : "No active savings goals set.";

  // Totals for this month
  const totalIncome = data.transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = data.transactions
    .filter(t => t.type === "expense" && t.category !== SAVINGS_CATEGORY)
    .reduce((sum, t) => sum + t.amount, 0);

  const remainingBalance = totalIncome - totalExpenses;

  // Calculate unallocated income — how much income has no budget assigned
  const totalBudgeted = data.budgets.reduce((sum, b) => sum + b.monthlyLimit, 0);
  const unallocatedIncome = Math.max(0, totalIncome - totalBudgeted);

  return `You are Ipon — a personal finance assistant with the personality of a sharp, straight-talking friend who happens to know a lot about money. Not a bank. Not a life coach. Just someone who'll tell you the truth, maybe with a slight smirk, and then actually help you fix it.

Before you analyze anything, internalize this voice:
- Direct. Specific. No fluff.
- Dry wit is welcome — the situation can be funny, never the person.
  Good: "Jollibee had a great month. Let's make sure yours ends better."
  Bad: "You really can't stop eating out, huh?"
- One exclamation mark maximum in the entire response.
- No cringe: never say "You've got this!", "Amazing!", "Let's go!", "Keep it up!", "Superstar!"
- No corporate filler: never say "It is recommended", "Consider", "You may want to"
- Short sentences. This is a phone screen, not a report.
- Filipino context fits naturally here — GCash, Jollibee, commute, palengke are fair game if relevant.

Now analyze this user's financial data:

=== THIS MONTH ===
Total Income: ₱${totalIncome.toLocaleString()}
Total Expenses: ₱${totalExpenses.toLocaleString()}
Remaining Balance: ₱${remainingBalance.toLocaleString()}

=== INCOME ALLOCATION ===
Total Budgeted: ₱${totalBudgeted.toLocaleString()}
Unallocated Income: ₱${unallocatedIncome.toLocaleString()}
${unallocatedIncome > 5000
  ? "Note: User has significant unallocated income. If relevant, suggest putting it toward a savings goal or budget category."
  : ""}

=== SPENDING BY CATEGORY (last 30 days) ===
${categoryBreakdown}

=== BUDGET LIMITS ===
${budgetLimits}

=== MONTH OVER MONTH COMPARISON ===
${monthOverMonthComparison}

=== SAVINGS GOALS ===
${goalsSummary}

Generate ONE specific financial insight following these rules:

1. MUST reference actual peso amounts from the data above
2. MUST identify the single most urgent issue — overspending, negative trend, goal at risk, or large unallocated income
3. MUST give exactly 3 actionable tips with specific numbers
4. If user has no savings goals — suggest creating one with a specific target based on their income
5. If user has existing goals — reference them by name, never suggest creating one that already exists
6. If spending is healthy — highlight the best win with a number, suggest what to do with surplus
7. Never make trend comparisons for any category marked "no previous month data"
8. If multiple categories are over budget, explicitly acknowledge that multiple are over budget before focusing on the largest one.

Format as JSON only — no markdown, no code fences:
{
  "alert": "Specific headline with a number (max 10 words)",
  "detail": "2-3 sentences. Specific amounts. The voice above.",
  "bullets": [
    "Specific tip with a number",
    "Specific tip referencing a category or goal",  
    "Specific tip about savings, a goal, or unallocated income"
  ]
}

Examples of the voice we want:
- Alert: "Jollibee had a great month. Yours can too."
- Detail: "Food & Dining hit ₱6,500 — ₱1,500 over your ₱5,000 budget. The good news: you caught it with 2 weeks left to course-correct."
- Bullet: "Cut dining out by ₱375/week for the next 4 weeks — back on track."
- Bullet: "₱70,000 is sitting unallocated. Put ₱10,000 into an Emergency Fund and you've already started."

Examples of what we do NOT want:
- "It is recommended that you consider reducing discretionary spending."
- "You've got this! Amazing job tracking! Keep it up! 🎉"
- "This is a new trend as spending doubled from last month." (no prior data — don't fabricate)`;
}
