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

  // Pre-calculate over-budget recovery figures — Gemini uses these verbatim
  // This prevents hallucinated weekly/monthly reduction numbers
  const today = new Date();
  const daysInMonth = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0
  ).getDate();
  const daysLeft = daysInMonth - today.getDate();
  const weeksLeft = Math.max(daysLeft / 7, 1);

  const overBudgetCategories = Object.entries(categoryTotals)
    .map(([cat, spent]) => {
      const budget = data.budgets.find(b => b.category === cat);
      const limit = budget?.monthlyLimit ?? null;
      if (!limit || spent <= limit) return null;
      const overage = spent - limit;
      const weeklyReduction = Math.ceil(overage / weeksLeft);
      return {
        cat,
        spent,
        limit,
        overage,
        weeklyReduction,
        weeksLeft: Math.round(weeksLeft),
      };
    })
    .filter(Boolean);

  const overBudgetSummary = overBudgetCategories.length > 0
    ? overBudgetCategories
      .map(c =>
        `- ${c!.cat}: spent ₱${c!.spent.toLocaleString()} vs ₱${c!.limit!.toLocaleString()} limit. ` +
        `Over by ₱${c!.overage.toLocaleString()}. ` +
        `To recover: cut by ₱${c!.weeklyReduction.toLocaleString()}/week for ${c!.weeksLeft} week(s).`
      )
      .join("\n")
    : "No categories are over budget.";

  // Identify spending in categories with no budget limit set
  // Includes deleted custom categories — historical transactions are preserved
  const unbudgetedSpending = Object.entries(categoryTotals)
    .filter(([cat]) => !data.budgets.find(b => b.category === cat))
    .map(([cat, amount]) =>
      `- ${cat}: ₱${amount.toLocaleString()} spent with no budget limit set`
    )
    .join("\n") || "All spending categories have budget limits.";

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
- Filipino context fits naturally — GCash, Jollibee, commute, palengke are fair game if relevant.

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

=== PRE-CALCULATED RECOVERY FIGURES (use these exact numbers — do not recalculate) ===
${overBudgetSummary}

=== UNBUDGETED SPENDING (categories with no limit set) ===
${unbudgetedSpending}

Generate ONE specific financial insight following these rules:

Content rules:
1. MUST reference actual peso amounts from the data above
2. MUST identify the single most urgent issue — overspending, goal at risk, or large unallocated income
3. MUST give exactly 3 actionable tips using the pre-calculated figures above verbatim
4. For over-budget categories — use the exact weekly reduction figure from PRE-CALCULATED RECOVERY FIGURES
5. Do not derive your own weekly, monthly, or percentage figures — use only what is provided above
6. If a category appears in UNBUDGETED SPENDING — treat it as unbudgeted, not over-budget. Suggest setting a limit, not cutting back
7. If user has no savings goals — suggest creating one with a specific target amount based on their income
8. If user has existing goals — reference them by name, never suggest creating one that already exists
9. If all spending is healthy — highlight the best win with a number and suggest what to do with the surplus
10. Never make trend comparisons for any category marked "no previous month data"
11. If multiple categories are over budget, mention the count in the alert (e.g. "2 categories over budget") but focus the detail and bullets on the largest overage only — do not list every over-budget category in the bullets

Tone rules:
12. Write in the voice described at the top — not like a financial report
13. For bad news: state it plainly, then immediately give the fix
14. For good news: acknowledge briefly, then suggest next step
15. Never be preachy
16. Maximum one exclamation mark in the entire response
17. Short sentences only

Format as JSON only — no markdown, no code fences:
{
  "alert": "Specific headline with a number (max 10 words)",
  "detail": "2-3 sentences. Specific amounts. The voice described above.",
  "bullets": [
    "Specific tip using pre-calculated number",
    "Specific tip referencing a category or goal",
    "Specific tip about savings, a goal, or unallocated income"
  ]
}

Voice examples — this is what we want:
Alert: "Food & Dining is ₱1,500 over — here's the fix."
Detail: "You hit ₱6,500 on food this month against a ₱5,000 budget. Two weeks left — still fixable."
Bullet: "Cut dining out by ₱375/week for 2 weeks and you're back on track."
Bullet: "₱70,000 is sitting unallocated. Put ₱10,000 into an Emergency Fund and you've already started."

What we do NOT want:
- "It is recommended that you consider reducing discretionary spending." (corporate)
- "You've got this! Amazing job! Keep it up! 🎉" (cringe)
- "Spending doubled from last month." (fabricated trend — no prior data)
- "Your weekly reduction should be ₱412." (self-calculated — use pre-calculated figures only)`;
}
