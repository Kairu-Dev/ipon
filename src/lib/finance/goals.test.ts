import { describe, it, expect } from "vitest";
import { calculateGoalProgress } from "./goals";

describe("calculateGoalProgress", () => {
  it("returns 0 when target amount is 0", () => {
    expect(calculateGoalProgress(100, 0)).toBe(0);
  });

  it("returns 0 when savedAmount is 0", () => {
    expect(calculateGoalProgress(0, 100000)).toBe(0);
  });

  it("returns correct percentage", () => {
    expect(calculateGoalProgress(75000, 100000)).toBe(75);
  });

  it("caps at 100 when saved amount exceeds target", () => {
    expect(calculateGoalProgress(110000, 100000)).toBe(100);
  });
});
