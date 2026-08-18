import type { SupabaseClient } from "@supabase/supabase-js";
import { searchProducts } from "@/lib/catalog";
import { ChatMessage, Product, ProductVariant } from "@/types";

// --- Free-text intent detection ---------------------------------------------
// Stays fully local/free (no LLM call) — a step up from plain substring
// matching via Postgres trigram search, but still pattern-based, not true
// language understanding. See project README for the tradeoff.

const BUDGET_INTENT = /\b(budget|afford|spent|spending|how am i doing)\b/;
const TIPS_INTENT = /\b(save money|savings? tips?|how (?:can|do) i save)\b/;
const CHEAP_INTENT = /\b(cheap(?:est|er)?|best price|lowest price)\b/;
const BUY_INTENT = /\b(buy|order|purchase|get me|find me|pick up|grab me|need)\b/;
const GREETING = /\b(hi|hello|hey)\b/;
const HELP = /\b(help|what can you do)\b/;

const FILLER_WORDS = new Set([
  "where", "can", "i", "get", "find", "me", "a", "an", "the", "some", "for",
  "buy", "order", "purchase", "pick", "up", "grab", "need", "cheap", "cheaper",
  "cheapest", "best", "price", "prices", "lowest", "how", "do", "does", "you",
  "please", "want", "to", "of", "on", "that", "is", "are", "my", "budget",
  "afford", "spent", "spending", "doing", "this", "month", "and",
]);

function extractSearchTerm(text: string): string {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w && !FILLER_WORDS.has(w) && !/^\d+$/.test(w));
  return words.join(" ").trim();
}

function id(): string {
  return crypto.randomUUID();
}

function textMessage(text: string): ChatMessage {
  return { id: id(), role: "assistant", text };
}

// --- Product / variant selection --------------------------------------------
// Each interactive message carries everything the next step needs in its own
// `meta` — no separate "pending selection" state to track between turns.

function productReadyMessage(product: Product, variant?: ProductVariant): ChatMessage {
  const variantNote = variant ? ` (${variant.kind} ${variant.value})` : "";
  return {
    id: id(),
    role: "assistant",
    kind: "product-ready",
    text: `${product.name}${variantNote} — £${product.price.toFixed(2)} from ${
      product.retailer
    }. Tap "Buy" to go to ${product.retailer}, then let me know once you've bought it so I can log it to your budget.`,
    meta: { product, variant },
  };
}

export function chooseProduct(product: Product): ChatMessage {
  if (product.variants.length > 0) {
    const kind = product.variants[0].kind;
    return {
      id: id(),
      role: "assistant",
      kind: "variant-options",
      text: `What ${kind} would you like for ${product.name}?`,
      meta: { product },
    };
  }
  return productReadyMessage(product);
}

export function chooseVariant(product: Product, variant: ProductVariant): ChatMessage {
  return productReadyMessage(product, variant);
}

export function loggedMessage(product: Product): ChatMessage {
  return {
    id: id(),
    role: "assistant",
    kind: "logged",
    text: `Logged — £${product.price.toFixed(2)} added to your budget under "${
      product.category
    }". Nice one.`,
    meta: { product },
  };
}

// --- Budget-aware answers ----------------------------------------------------

async function budgetStatusMessage(supabase: SupabaseClient, itemTerm: string): Promise<ChatMessage> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return textMessage("Sign in to check your budget.");

  const monthStart = new Date();
  monthStart.setDate(1);
  const monthStartStr = monthStart.toISOString().slice(0, 10);

  const [{ data: profile }, { data: txns }] = await Promise.all([
    supabase.from("profiles").select("monthly_budget").eq("id", user.id).single(),
    supabase
      .from("transactions")
      .select("amount")
      .eq("user_id", user.id)
      .gte("date", monthStartStr),
  ]);

  const monthlyBudget = Number(profile?.monthly_budget ?? 0);
  const spent = (txns ?? []).reduce((sum, t) => sum + Number(t.amount), 0);
  const remaining = monthlyBudget - spent;

  let text =
    remaining >= 0
      ? `You've spent £${spent.toFixed(2)} of your £${monthlyBudget.toFixed(
          2
        )} budget this month — £${remaining.toFixed(2)} left.`
      : `You're £${Math.abs(remaining).toFixed(2)} over your £${monthlyBudget.toFixed(
          2
        )} monthly budget this month (spent £${spent.toFixed(2)}).`;

  if (itemTerm) {
    const matches = await searchProducts(supabase, itemTerm, 5);
    if (matches.length > 0) {
      const cheapest = matches[0];
      const canAfford = cheapest.price <= remaining;
      text += ` ${cheapest.name} is £${cheapest.price.toFixed(2)} at ${cheapest.retailer} — ${
        canAfford ? "that fits in what you have left this month." : "that would put you over budget."
      }`;
    }
  }

  return textMessage(text);
}

function tipsMessage(): ChatMessage {
  const tips = [
    "Swap branded staples for supermarket own-brand — milk, pasta and tinned tomatoes are usually 30-40% cheaper with barely any difference.",
    "Aldi and Lidl consistently undercut the bigger supermarkets on everyday basics — worth checking before you buy at your usual shop.",
    "For clothes, check the value ranges (Decathlon, Uniqlo, Primark) before premium brands for anything that isn't a special occasion.",
    "Buy fruit and veg loose rather than pre-packed where you can — it's often cheaper per kg and cuts food waste too.",
  ];
  return textMessage(
    `A few ways to spend less:\n\n${tips.map((t) => `• ${t}`).join("\n")}\n\nOr ask me something like "cheapest milk" for a specific item.`
  );
}

// --- Main entry point --------------------------------------------------------

export async function respond(supabase: SupabaseClient, rawText: string): Promise<ChatMessage> {
  const lower = rawText.trim().toLowerCase();
  if (!lower) return textMessage("Say the word and I'll get looking.");

  if (BUDGET_INTENT.test(lower)) {
    const itemTerm = extractSearchTerm(lower);
    return budgetStatusMessage(supabase, itemTerm);
  }

  if (TIPS_INTENT.test(lower)) {
    return tipsMessage();
  }

  if (CHEAP_INTENT.test(lower) || BUY_INTENT.test(lower)) {
    const term = extractSearchTerm(lower);
    if (!term) {
      return textMessage("What are you after? Try naming an item, e.g. \"kettle\" or \"running shoes\".");
    }
    const options = await searchProducts(supabase, term);
    if (options.length === 0) {
      return textMessage(
        `I couldn't find "${term}" in the catalog yet. Try something like "kettle" or "running shoes".`
      );
    }
    if (options.length === 1) {
      return chooseProduct(options[0]);
    }
    return {
      id: id(),
      role: "assistant",
      kind: "product-options",
      text: CHEAP_INTENT.test(lower)
        ? `Here's what "${term}" costs across retailers — cheapest first:`
        : `Here are a few options for "${term}" — pick the one you'd like:`,
      meta: { options },
    };
  }

  if (GREETING.test(lower)) {
    return textMessage(
      "Hey! I'm your ShopCaddy assistant. Ask me to find something (\"kettle under £30\"), where it's cheapest, or how your budget's looking this month."
    );
  }

  if (HELP.test(lower)) {
    return textMessage(
      "I can: 1) find and compare prices across retailers for anything in the catalog, 2) tell you where something's cheapest, 3) check your budget and whether you can afford something, and 4) suggest ways to save. I'll link you straight to the retailer to buy — tell me once you have, and I'll log it to your budget."
    );
  }

  return textMessage(
    "I can find and compare prices, check your budget, or suggest ways to save. Try \"cheapest milk\", \"can I afford a kettle\", or \"how's my budget this month\"."
  );
}

// --- List Maker ---------------------------------------------------------------

export async function buildListFromText(supabase: SupabaseClient, text: string) {
  const phrases = text
    .split(/,|\band\b|\n/gi)
    .map((p) => p.trim())
    .filter(Boolean);

  const items: { id: string; query: string; options: Product[]; selectedIndex: number; quantity: number }[] = [];
  const seenNames = new Set<string>();

  for (const phrase of phrases) {
    const term = extractSearchTerm(phrase);
    if (!term) continue;
    const options = await searchProducts(supabase, term, 5);
    if (options.length === 0) continue;
    if (seenNames.has(options[0].name)) continue;
    seenNames.add(options[0].name);
    items.push({ id: id(), query: phrase.trim(), options, selectedIndex: 0, quantity: 1 });
  }

  return items;
}

interface Priced {
  options: Product[];
  selectedIndex: number;
  quantity: number;
}

export function listTotal(items: Priced[]): number {
  return items.reduce((sum, item) => sum + item.options[item.selectedIndex].price * item.quantity, 0);
}

// Saving vs. the priciest option for each item, at the currently chosen option.
export function listSavings(items: Priced[]): number {
  return items.reduce((sum, item) => {
    if (item.options.length < 2) return sum;
    const priciest = Math.max(...item.options.map((o) => o.price));
    const chosen = item.options[item.selectedIndex].price;
    return sum + (priciest - chosen) * item.quantity;
  }, 0);
}
