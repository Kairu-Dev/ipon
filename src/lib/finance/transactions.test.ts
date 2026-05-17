import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { groupByDate } from "./transactions";

describe("groupByDate", () => {
  beforeEach(() => {
    // Mock system time to 2026-10-24T12:00:00Z for consistent relative dates
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-24T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("groups transactions correctly with relative date labels", () => {
    const txs = [
      { _id: "1", date: "2026-10-24", amount: 100 },
      { _id: "2", date: "2026-10-24", amount: 200 },
      { _id: "3", date: "2026-10-23", amount: 50 },
      { _id: "4", date: "2026-10-22", amount: 10 }
    ];

    const result = groupByDate(txs);
    
    expect(result).toHaveLength(3);
    expect(result[0].dateLabel).toBe("Today, Oct 24");
    expect(result[0].transactions).toHaveLength(2);
    
    expect(result[1].dateLabel).toBe("Yesterday, Oct 23");
    expect(result[1].transactions).toHaveLength(1);
    
    expect(result[2].dateLabel).toBe("Oct 22");
    expect(result[2].transactions).toHaveLength(1);
  });

  it("returns empty array for empty input", () => {
    const result = groupByDate([]);
    expect(result).toHaveLength(0);
  });

  it("handles single transaction", () => {
    const txs = [
      { _id: "1", date: "2026-10-24", amount: 100 }
    ];

    const result = groupByDate(txs);
    expect(result).toHaveLength(1);
    expect(result[0].dateLabel).toBe("Today, Oct 24");
    expect(result[0].transactions).toHaveLength(1);
  });
});
