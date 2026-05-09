import { describe, it, expect } from "vitest";
import { transactionSchema } from "../lib/validation";

describe("Transaction Validation Schema", () => {
  it("validates a correct expense transaction", () => {
    const validData = {
      type: "expense",
      title: "Jollibee Lunch",
      amount: 150.50,
      category: "Food & Dining",
      paymentMethod: "Cash",
      date: "2026-05-09",
      note: "Lunch with friends",
    };
    
    const result = transactionSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("fails when amount is zero or negative", () => {
    const invalidData = {
      type: "expense",
      title: "Invalid Amount",
      amount: 0,
      category: "Food & Dining",
      paymentMethod: "Cash",
      date: "2026-05-09",
    };
    
    const result = transactionSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Amount must be greater than ₱0");
    }
  });

  it("fails when title is missing", () => {
    const invalidData = {
      type: "expense",
      amount: 150,
      category: "Food & Dining",
      paymentMethod: "Cash",
      date: "2026-05-09",
    };
    
    const result = transactionSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
