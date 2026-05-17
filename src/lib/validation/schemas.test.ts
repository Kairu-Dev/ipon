// src/lib/validation.test.ts
// Unit tests for shared Zod validation schemas.
// Covers both signUpSchema and loginSchema with security edge cases.
import { describe, it, expect } from "vitest";
import { signUpSchema, loginSchema, transactionSchema } from "./schemas";

describe("signUpSchema", () => {
  // --- Happy path ---
  it("accepts valid signup data", () => {
    const result = signUpSchema.safeParse({
      name: "Juan Dela Cruz",
      email: "juan@example.com",
      password: "Secure@123",
    });
    expect(result.success).toBe(true);
  });

  // --- Name validation ---
  it("rejects empty name", () => {
    const result = signUpSchema.safeParse({
      name: "",
      email: "juan@example.com",
      password: "Secure@123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects whitespace-only name", () => {
    const result = signUpSchema.safeParse({
      name: "   ",
      email: "juan@example.com",
      password: "Secure@123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects name longer than 50 characters", () => {
    const result = signUpSchema.safeParse({
      name: "A".repeat(51),
      email: "juan@example.com",
      password: "Secure@123",
    });
    expect(result.success).toBe(false);
  });

  it("accepts name at exactly 50 characters", () => {
    const result = signUpSchema.safeParse({
      name: "A".repeat(50),
      email: "juan@example.com",
      password: "Secure@123",
    });
    expect(result.success).toBe(true);
  });

  // --- Email validation ---
  it("rejects invalid email format", () => {
    const result = signUpSchema.safeParse({
      name: "Juan",
      email: "not-an-email",
      password: "Secure@123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects email without domain", () => {
    const result = signUpSchema.safeParse({
      name: "Juan",
      email: "juan@",
      password: "Secure@123",
    });
    expect(result.success).toBe(false);
  });

  // --- Password strength validation ---
  it("rejects password shorter than 8 characters", () => {
    const result = signUpSchema.safeParse({
      name: "Juan",
      email: "juan@example.com",
      password: "Ab@1",
    });
    expect(result.success).toBe(false);
  });

  it("rejects password without uppercase letter", () => {
    const result = signUpSchema.safeParse({
      name: "Juan",
      email: "juan@example.com",
      password: "secure@123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects password without lowercase letter", () => {
    const result = signUpSchema.safeParse({
      name: "Juan",
      email: "juan@example.com",
      password: "SECURE@123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects password without number", () => {
    const result = signUpSchema.safeParse({
      name: "Juan",
      email: "juan@example.com",
      password: "Secure@abc",
    });
    expect(result.success).toBe(false);
  });

  it("rejects password without special character", () => {
    const result = signUpSchema.safeParse({
      name: "Juan",
      email: "juan@example.com",
      password: "Secure1234",
    });
    expect(result.success).toBe(false);
  });

  it("rejects whitespace-only password", () => {
    const result = signUpSchema.safeParse({
      name: "Juan",
      email: "juan@example.com",
      password: "        ",
    });
    expect(result.success).toBe(false);
  });

  // --- Security: injection / XSS payloads in inputs ---
  it("accepts XSS payload in name (Zod is schema-only, sanitization is separate)", () => {
    // Zod validates type/length — XSS sanitization happens at render layer.
    // This test documents that Zod does NOT strip HTML, which is expected.
    const result = signUpSchema.safeParse({
      name: '<script>alert("xss")</script>',
      email: "juan@example.com",
      password: "Secure@123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects SQL injection in email (invalid format)", () => {
    const result = signUpSchema.safeParse({
      name: "Juan",
      email: "'; DROP TABLE users;--",
      password: "Secure@123",
    });
    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("accepts valid login data", () => {
    const result = loginSchema.safeParse({
      email: "name@example.com",
      password: "12345678",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty password", () => {
    const result = loginSchema.safeParse({
      email: "name@example.com",
      password: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({
      email: "bad-email",
      password: "12345678",
    });
    expect(result.success).toBe(false);
  });

  // Login schema intentionally does NOT enforce password strength —
  // it only checks that a password was provided. Strength rules are
  // only enforced during signup.
  it("accepts weak password on login (strength is signup-only)", () => {
    const result = loginSchema.safeParse({
      email: "name@example.com",
      password: "a",
    });
    expect(result.success).toBe(true);
  });
});

// --- Transaction validation (merged from src/test/validation.test.ts) ---
describe("transactionSchema", () => {
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
