/**
 * Groups an array of transactions by their date field.
 * Returns groups with human-readable date labels:
 * - "Today, Oct 24" for today's date
 * - "Yesterday, Oct 23" for yesterday's date
 * - "Oct 22" for all other dates
 *
 * Uses local time (not UTC) to derive "today" and "yesterday"
 * so Filipino users in UTC+8 see the correct labels past midnight.
 */
export function groupByDate<T extends { date: string }>(transactions: T[]) {
  // Build a Map preserving insertion order (chronological from the query)
  const groups = new Map<string, T[]>();

  for (const tx of transactions) {
    if (!groups.has(tx.date)) {
      groups.set(tx.date, []);
    }
    groups.get(tx.date)!.push(tx);
  }

  // Derive today/yesterday using LOCAL time (not toISOString which is UTC)
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const pad = (n: number) => String(n).padStart(2, "0");
  const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
  const yesterdayStr = `${yesterday.getFullYear()}-${pad(yesterday.getMonth() + 1)}-${pad(yesterday.getDate())}`;

  return Array.from(groups.entries()).map(([dateStr, txs]) => {
    // Parse the date string to get month abbreviation and day number
    const dateObj = new Date(dateStr);
    const month = dateObj.toLocaleString("en-US", { month: "short" });
    const day = dateObj.getDate();
    const formattedDate = `${month} ${day}`;

    // Prefix with "Today" or "Yesterday" for relative context
    let dateLabel = formattedDate;
    if (dateStr === todayStr) {
      dateLabel = `Today, ${formattedDate}`;
    } else if (dateStr === yesterdayStr) {
      dateLabel = `Yesterday, ${formattedDate}`;
    }

    return {
      date: dateStr,
      dateLabel,
      transactions: txs,
    };
  });
}
