import { catalog, findAllByTag, findAlternative, findByTag } from "@/lib/catalog";
import { ChatMessage, ListItem, Product } from "@/types";

// --- List Maker -----------------------------------------------------------
// A lightweight rule-based stand-in for an LLM parsing a natural-language
// shopping request into concrete catalog items. A production ShopCaddy would
// call a real model + live retailer feeds here.

interface Rule {
  triggers: string[];
  tags: string[];
}

const RULES: Rule[] = [
  { triggers: ["curry"], tags: ["chicken", "rice", "curry sauce"] },
  { triggers: ["pasta", "spaghetti", "bolognese"], tags: ["pasta", "tomato", "cheese"] },
  { triggers: ["milk"], tags: ["milk"] },
  { triggers: ["bread", "loaf"], tags: ["bread"] },
  { triggers: ["egg"], tags: ["eggs"] },
  { triggers: ["banana"], tags: ["banana"] },
  { triggers: ["coffee"], tags: ["coffee"] },
  { triggers: ["cheese"], tags: ["cheese"] },
  { triggers: ["kettle"], tags: ["kettle"] },
  { triggers: ["t-shirt", "tshirt", "tee"], tags: ["t-shirt"] },
  { triggers: ["jeans"], tags: ["jeans"] },
  { triggers: ["running shoe", "trainer", "sneaker"], tags: ["running shoes"] },
  { triggers: ["jacket", "coat"], tags: ["jacket"] },
  { triggers: ["sock"], tags: ["socks"] },
  { triggers: ["dress"], tags: ["dress"] },
  { triggers: ["hoodie", "jumper", "sweatshirt"], tags: ["hoodie"] },
];

export function parseRequestToItems(prompt: string): ListItem[] {
  const lower = prompt.toLowerCase();
  const tagsToAdd = new Set<string>();

  for (const rule of RULES) {
    if (rule.triggers.some((t) => lower.includes(t))) {
      rule.tags.forEach((tag) => tagsToAdd.add(tag));
    }
  }

  // Loose fallback: catch any catalog tag mentioned directly that the rule
  // list above didn't cover.
  if (tagsToAdd.size === 0) {
    for (const product of catalog) {
      for (const tag of product.tags) {
        if (lower.includes(tag)) tagsToAdd.add(tag);
      }
    }
  }

  const seen = new Set<string>();
  const items: ListItem[] = [];

  tagsToAdd.forEach((tag) => {
    const product = findByTag(tag);
    if (!product || seen.has(product.id)) return;
    seen.add(product.id);
    items.push({
      id: `item-${product.id}-${Math.random().toString(36).slice(2, 8)}`,
      query: tag,
      product,
      alternative: findAlternative(product),
      useAlternative: false,
      quantity: 1,
    });
  });

  return items;
}

export function listTotal(items: ListItem[]): number {
  return items.reduce((sum, item) => {
    const chosen = item.useAlternative && item.alternative ? item.alternative : item.product;
    return sum + chosen.price * item.quantity;
  }, 0);
}

export function listSavings(items: ListItem[]): number {
  return items.reduce((sum, item) => {
    if (item.useAlternative && item.alternative) {
      return sum + (item.product.price - item.alternative.price) * item.quantity;
    }
    return sum;
  }, 0);
}

// --- Chat / autonomous purchasing -----------------------------------------

const AFFIRMATIVE = /^(yes|yeah|yep|yup|confirm|go ahead|do it|place( the)? order|sounds good|ok|okay|sure)\b/;
const BUY_INTENT = /\b(buy|order|purchase|get me|pick up|grab me|find me)\b/;
const GREETING = /\b(hi|hello|hey)\b/;
const HELP = /\b(help|what can you do)\b/;

function findTagInText(lower: string): string | undefined {
  for (const product of catalog) {
    const match = product.tags.find((tag) => lower.includes(tag));
    if (match) return match;
  }
  return undefined;
}

let msgCounter = 0;
function id() {
  msgCounter += 1;
  return `msg-${Date.now()}-${msgCounter}`;
}

export interface PendingPurchase {
  product: Product;
  originalPrice?: number;
}

function chooseProductMessage(product: Product, bankLinked: boolean): ChatMessage {
  if (!bankLinked) {
    return {
      id: id(),
      role: "assistant",
      kind: "bank-required",
      text: `Good choice — ${product.name} for £${product.price.toFixed(
        2
      )} from ${product.retailer}. To actually complete a purchase I need your bank linked first — head to Account → Link bank (demo only, no real bank is contacted), then just say "yes" and I'll pick up where we left off.`,
      meta: { product },
    };
  }
  return {
    id: id(),
    role: "assistant",
    kind: "order-confirm",
    text: `Great pick: ${product.name} — £${product.price.toFixed(2)} from ${product.retailer}. Want me to go ahead and buy it?`,
    meta: { product },
  };
}

// Called when the user taps a product card (from a multi-brand options
// message) to pick a specific retailer/brand to buy.
export function chooseProduct(
  product: Product,
  bankLinked: boolean
): { message: ChatMessage; pendingProduct: PendingPurchase | null } {
  return { message: chooseProductMessage(product, bankLinked), pendingProduct: { product } };
}

export function chatRespond(
  message: string,
  pendingProduct: PendingPurchase | null,
  bankLinked: boolean
): { message: ChatMessage; pendingProduct: PendingPurchase | null } {
  const lower = message.toLowerCase().trim();

  if (AFFIRMATIVE.test(lower) && pendingProduct) {
    if (!bankLinked) {
      return {
        message: {
          id: id(),
          role: "assistant",
          kind: "bank-required",
          text: "I still need your bank linked to complete this purchase securely. Head to Account → Link bank (this is a demo, no real bank is contacted).",
          meta: { product: pendingProduct.product },
        },
        pendingProduct,
      };
    }
    const { product, originalPrice } = pendingProduct;
    return {
      message: {
        id: id(),
        role: "assistant",
        kind: "order-success",
        text: `Done! I've placed your order for ${product.name} — £${product.price.toFixed(
          2
        )} from ${product.retailer}. You'll get a confirmation email and it'll show up in your Orders tab.`,
        meta: { product, orderTotal: product.price, originalPrice },
      },
      pendingProduct: null,
    };
  }

  if (AFFIRMATIVE.test(lower) && !pendingProduct) {
    return {
      message: {
        id: id(),
        role: "assistant",
        text: "I don't have an order pending right now — tell me what you'd like me to buy, e.g. “buy me a kettle under £30”.",
      },
      pendingProduct: null,
    };
  }

  if (BUY_INTENT.test(lower)) {
    const tag = findTagInText(lower);
    const options = tag ? findAllByTag(tag) : [];
    if (!tag || options.length === 0) {
      return {
        message: {
          id: id(),
          role: "assistant",
          text: "I couldn't find that in the demo catalog yet. Try something like “buy me a kettle” or “order running shoes”.",
        },
        pendingProduct: null,
      };
    }

    if (options.length === 1) {
      return chooseProduct(options[0], bankLinked);
    }

    return {
      message: {
        id: id(),
        role: "assistant",
        kind: "product-options",
        text: `Here are a few options for "${tag}" — pick the one you'd like:`,
        meta: { options },
      },
      pendingProduct: null,
    };
  }

  if (GREETING.test(lower)) {
    return {
      message: {
        id: id(),
        role: "assistant",
        text: "Hey! I'm your ShopCaddy assistant. Ask me to buy something (“get me a waterproof jacket”) or ask about prices — I'll compare retailers and handle checkout once your bank is linked.",
      },
      pendingProduct: null,
    };
  }

  if (HELP.test(lower)) {
    return {
      message: {
        id: id(),
        role: "assistant",
        text: "I can: 1) turn a request like “chicken curry for 4” into a priced shopping list with cheaper alternatives, 2) buy individual items for you in chat once your bank is linked, and 3) track savings and orders over time.",
      },
      pendingProduct: null,
    };
  }

  return {
    message: {
      id: id(),
      role: "assistant",
      text: "I can build shopping lists, compare prices across retailers, and buy things for you once your bank is linked. Try “buy me a kettle under £30”, or open List Maker to plan a full shop.",
    },
    pendingProduct: null,
  };
}
