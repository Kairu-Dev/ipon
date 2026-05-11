/**
 * Formats a number into a Philippine Peso (PHP) currency string.
 * @param amount - The numeric value to format
 * @param options - Configuration for decimals and signage
 * @returns Formatted string (e.g., "₱1,000" or "₱1,000.00")
 */
export function formatCurrency(
  amount: number, 
  options: { showDecimals?: boolean; showSign?: boolean; type?: "income" | "expense" } = {}
): string {
  const { showDecimals = false, showSign = false, type } = options;
  
  const formatted = new Intl.NumberFormat("en-PH", {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(amount);

  if (!showSign) return `₱${formatted}`;
  
  const sign = type === "income" ? "+" : "-";
  return `${sign}₱${formatted}`;
}

/**
 * Formats a goal deadline or achievement date into a "Mon YYYY" string.
 * @param dateStr - The ISO date string (YYYY-MM-DD)
 * @returns Formatted date string (e.g., "Oct 2024")
 */
export function formatGoalDate(dateStr: string): string {
  // Use a fallback to current date if string is invalid, but assume YYYY-MM-DD
  const [year, month, day] = dateStr.split("-").map(Number);
  const dateObj = year && month ? new Date(year, month - 1, day || 1) : new Date(dateStr);
  
  return dateObj.toLocaleDateString("en-US", { 
    month: "short", 
    day: "numeric",
    year: "numeric" 
  });
}
