// src/lib/dashboard.ts

/**
 * Calculates the safe amount to spend per week based on the remaining balance
 * and the number of days left in the current month.
 * @param remainingBalance The remaining balance for the month
 * @param date The current date (defaults to today)
 * @returns The safe amount to spend this week
 */
export function calculateSafeToSpend(remainingBalance: number, date: Date = new Date()): number {
  if (remainingBalance <= 0) return 0;
  
  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const daysLeft = daysInMonth - date.getDate() + 1; // include today
  
  // Guard against tiny weeksLeft (e.g. 1 day left) to avoid returning huge numbers.
  // We treat anything less than 7 days as "1 week" for the remaining balance.
  const weeksLeft = Math.max(daysLeft / 7, 1);
  
  const perWeek = Math.floor(remainingBalance / weeksLeft);
  
  // Cap at remainingBalance just in case of rounding/logic edge cases
  return Math.min(perWeek, remainingBalance);
}

/**
 * Gets the current and previous month strings in "YYYY-MM" format.
 * @param date The current date (defaults to today)
 * @returns An object containing currentMonth and previousMonth strings
 */
export function getMonthOverMonthDates(date: Date = new Date()): { currentMonth: string; previousMonth: string } {
  const pad = (n: number) => String(n).padStart(2, "0");
  const currentMonth = `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;

  // Generate previous month — JS Date handles January → December rollover correctly
  const prevDate = new Date(date.getFullYear(), date.getMonth() - 1, 1);
  const previousMonth = `${prevDate.getFullYear()}-${pad(prevDate.getMonth() + 1)}`;
  
  return { currentMonth, previousMonth };
}
