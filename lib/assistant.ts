import type { SupabaseClient } from "@supabase/supabase-js";
import { guessCategory } from "@/lib/categories";
import { ChatMessage, PendingLog } from "@/types";

// --- Free-text intent detection ---------------------------------------------
// Fully local and free (no LLM call) — pattern-based, not true language
// understanding. There is no product catalog behind this: ShopCaddy only
// ever logs an amount the user states themselves.

const BUDGET_INTENT = /\b(budget|afford|how much have i spent|how am i doing|spending)\b/;
const TIPS_INTENT = /\b(save money|savings? tips?|how (?:can|do) i save)\b/;
const LOG_INTENT = /\b(spent|spend|paid|bought|log)\b/;
const GREETING = /\b(hi|hello|hey)\b/;
const HELP = /\b(help|what can you do)\b/;

const AMOUNT_REGEX = /£\s?(\d+(?:\.\d{1,2})?)|(\d+(?:\.\d{1,2})?)\s?(?:pounds|quid|gbp)\b|\b(\d+(?:\.\d{1,2})?)\b/i;

function extractAmount(text: string): number | null {
  const match = text.match(AMOUNT_REGEX);
  if (!match) return null;
  const raw = match[1] ?? match[2] ?? match[3];
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function id(): string {
  return crypto.randomUUID();
}

function textMessage(text: string): ChatMessage {
  return { id: id(), role: "assistant", text };
}

// --- Logging a spend ----------------------------------------------------------

export function loggedMessage(log: PendingLog): ChatMessage {
  return {
    id: id(),
    role: "assistant",
    kind: "logged",
    text: `Logged — £${log.amount.toFixed(2)} added under "${log.category}".`,
  };
}

function confirmLogMessage(rawText: string, amount: number): ChatMessage {
  const category = guessCategory(rawText);
  return {
    id: id(),
    role: "assistant",
    kind: "confirm-log",
    text: `Log £${amount.toFixed(2)} under "${category}"?`,
    meta: { pendingLog: { amount, category, note: rawText.trim() } },
  };
}

// --- Budget-aware answers ----------------------------------------------------

async function budgetStatusMessage(
  supabase: SupabaseClient,
  statedAmount: number | null
): Promise<ChatMessage> {
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

  if (statedAmount !== null) {
    const after = remaining - statedAmount;
    text +=
      after >= 0
        ? ` Spending £${statedAmount.toFixed(2)} would leave you £${after.toFixed(2)}.`
        : ` Spending £${statedAmount.toFixed(2)} would put you £${Math.abs(after).toFixed(2)} over budget.`;
  }

  return textMessage(text);
}

function tipsMessage(): ChatMessage {
  const tips = [
    "Swap branded staples for supermarket own-brand — usually 30-40% cheaper with barely any difference.",
    "Aldi and Lidl consistently undercut the bigger supermarkets on everyday basics.",
    "For clothes, check value ranges (Decathlon, Uniqlo, Primark) before premium brands for anything that isn't a special occasion.",
    "Set a category budget on Account for the areas that tend to creep — seeing the bar fill up is usually enough to change behaviour.",
  ];
  return textMessage(
    `A few ways to spend less:\n\n${tips.map((t) => `• ${t}`).join("\n")}\n\nOr tell me what you've spent and I'll keep track for you.`
  );
}

// --- Main entry point --------------------------------------------------------

export async function respond(supabase: SupabaseClient, rawText: string): Promise<ChatMessage> {
  const trimmed = rawText.trim();
  const lower = trimmed.toLowerCase();
  if (!lower) return textMessage("Go ahead — tell me what you spent, or ask about your budget.");

  if (BUDGET_INTENT.test(lower)) {
    const amount = /afford/.test(lower) ? extractAmount(lower) : null;
    return budgetStatusMessage(supabase, amount);
  }

  if (TIPS_INTENT.test(lower)) {
    return tipsMessage();
  }

  if (LOG_INTENT.test(lower)) {
    const amount = extractAmount(lower);
    if (amount === null) {
      return textMessage('How much did you spend? Include an amount, e.g. "spent £12 on lunch".');
    }
    return confirmLogMessage(trimmed, amount);
  }

  if (GREETING.test(lower)) {
    return textMessage(
      "Hey! I'm your ShopCaddy budget assistant. Tell me what you've spent (\"spent £12 on lunch\"), ask how your budget's looking, or ask for money-saving tips."
    );
  }

  if (HELP.test(lower)) {
    return textMessage(
      'I can: 1) log a spend when you tell me about it ("paid £30 for a jacket"), 2) check your budget and whether you can afford something if you tell me the price, and 3) suggest ways to save. Everything I log, you can edit or delete on the Budget page.'
    );
  }

  return textMessage(
    'Tell me what you spent ("spent £12 on lunch"), ask "how\'s my budget", or ask for savings tips.'
  );
}
