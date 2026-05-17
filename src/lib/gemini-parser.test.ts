import { describe, it, expect } from "vitest";
import { parseGeminiCategorySuggestion } from "./gemini-parser";

describe("Gemini Category Parser", () => {
  it("parses exact value matches", () => {
    expect(parseGeminiCategorySuggestion("Food & Dining", "expense")).toBe("Food & Dining");
  });

  it("parses label matches (case insensitive)", () => {
    expect(parseGeminiCategorySuggestion("food", "expense")).toBe("Food & Dining");
    expect(parseGeminiCategorySuggestion("transpo", "expense")).toBe("Transportation");
  });

  it("handles trailing spaces and extra quotes", () => {
    // The parser in convex strips quotes before calling this, but the function trims spaces
    expect(parseGeminiCategorySuggestion(" Shopping ", "expense")).toBe("Shopping");
  });

  it("returns null for unrecognized categories", () => {
    expect(parseGeminiCategorySuggestion("Unknown Category", "expense")).toBeNull();
  });
});
