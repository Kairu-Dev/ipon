import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/constants/transactions";

export function parseGeminiCategorySuggestion(response: string, type: "income" | "expense"): string | null {
  const cleanResponse = response.trim();
  const categories = type === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  
  // Find a category where the exact value matches the AI suggestion
  // The .value field is what gets stored in the DB (e.g., "Food & Dining")
  const matchedCategory = categories.find(
    (c) => c.value.toLowerCase() === cleanResponse.toLowerCase() ||
           c.label.toLowerCase() === cleanResponse.toLowerCase()
  );
  
  return matchedCategory ? matchedCategory.value : null;
}
