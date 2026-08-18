// The fixed set of budget categories used across Account, Budget, and Chat.
// There is no product catalog in this app — every spend is something the
// user told ShopCaddy themselves, manually or via Chat.
export const BUDGET_CATEGORIES = ["Food", "Household", "Clothes", "Bills", "Other"];

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Food: ["food", "grocery", "groceries", "supermarket", "lunch", "dinner", "breakfast", "snack", "coffee", "restaurant", "takeaway"],
  Household: ["household", "home", "cleaning", "kitchen", "appliance", "furniture"],
  Clothes: ["clothes", "clothing", "shoes", "jacket", "jeans", "hoodie", "dress", "outfit"],
  Bills: ["bill", "bills", "rent", "subscription", "utility", "utilities", "phone", "internet", "insurance"],
};

// Best-effort guess at a category from free text (used when logging a spend
// via Chat) — falls back to "Other" rather than guessing wrong.
export function guessCategory(text: string): string {
  const lower = text.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((k) => lower.includes(k))) return category;
  }
  return "Other";
}
