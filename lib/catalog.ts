import { DeliveryOption, Product } from "@/types";

// Mock product catalog. In a real ShopCaddy this would be a live price-comparison
// feed across retailers (Tesco, Aldi, ASOS, Uniqlo, etc). Prices/retailers here are
// illustrative placeholders for the prototype.
export const catalog: Product[] = [
  // --- Food ---
  { id: "f-milk-1", name: "Semi-Skimmed Milk 2L", category: "food", retailer: "Tesco", price: 1.65, tags: ["milk"], ecoScore: 3, alternativeId: "f-milk-2" },
  { id: "f-milk-2", name: "Semi-Skimmed Milk 2L", category: "food", retailer: "Aldi", price: 1.35, tags: ["milk"], ecoScore: 3 },

  { id: "f-bread-1", name: "Farmhouse White Loaf", category: "food", retailer: "Sainsbury's", price: 1.40, tags: ["bread"], ecoScore: 3, alternativeId: "f-bread-2" },
  { id: "f-bread-2", name: "Farmhouse White Loaf", category: "food", retailer: "Lidl", price: 1.05, tags: ["bread"], ecoScore: 3 },

  { id: "f-eggs-1", name: "Free Range Eggs (12)", category: "food", retailer: "Waitrose", price: 3.60, tags: ["eggs"], ecoScore: 4, alternativeId: "f-eggs-2" },
  { id: "f-eggs-2", name: "Free Range Eggs (12)", category: "food", retailer: "Aldi", price: 2.75, tags: ["eggs"], ecoScore: 4 },

  { id: "f-chicken-1", name: "Chicken Breast Fillets 1kg", category: "food", retailer: "Tesco", price: 6.50, tags: ["chicken"], ecoScore: 2, alternativeId: "f-chicken-2" },
  { id: "f-chicken-2", name: "Chicken Breast Fillets 1kg", category: "food", retailer: "Lidl", price: 5.20, tags: ["chicken"], ecoScore: 2 },

  { id: "f-rice-1", name: "Basmati Rice 1kg", category: "food", retailer: "Sainsbury's", price: 2.80, tags: ["rice"], ecoScore: 3, alternativeId: "f-rice-2" },
  { id: "f-rice-2", name: "Basmati Rice 1kg", category: "food", retailer: "Aldi", price: 1.99, tags: ["rice"], ecoScore: 3 },

  { id: "f-curry-sauce-1", name: "Curry Cooking Sauce", category: "food", retailer: "Tesco", price: 2.20, tags: ["curry sauce"], ecoScore: 3, alternativeId: "f-curry-sauce-2" },
  { id: "f-curry-sauce-2", name: "Curry Cooking Sauce", category: "food", retailer: "Asda", price: 1.60, tags: ["curry sauce"], ecoScore: 3 },

  { id: "f-pasta-1", name: "Penne Pasta 500g", category: "food", retailer: "Tesco", price: 1.10, tags: ["pasta"], ecoScore: 3, alternativeId: "f-pasta-2" },
  { id: "f-pasta-2", name: "Penne Pasta 500g", category: "food", retailer: "Lidl", price: 0.65, tags: ["pasta"], ecoScore: 3 },

  { id: "f-tomato-1", name: "Chopped Tomatoes Tin", category: "food", retailer: "Sainsbury's", price: 0.95, tags: ["tomato"], ecoScore: 3, alternativeId: "f-tomato-2" },
  { id: "f-tomato-2", name: "Chopped Tomatoes Tin", category: "food", retailer: "Aldi", price: 0.55, tags: ["tomato"], ecoScore: 3 },

  { id: "f-cheese-1", name: "Mature Cheddar 400g", category: "food", retailer: "Waitrose", price: 3.90, tags: ["cheese"], ecoScore: 2, alternativeId: "f-cheese-2" },
  { id: "f-cheese-2", name: "Mature Cheddar 400g", category: "food", retailer: "Aldi", price: 2.65, tags: ["cheese"], ecoScore: 2 },

  { id: "f-banana-1", name: "Bananas (loose, per kg)", category: "food", retailer: "Tesco", price: 1.05, tags: ["banana", "fruit"], ecoScore: 4, alternativeId: "f-banana-2" },
  { id: "f-banana-2", name: "Bananas (loose, per kg)", category: "food", retailer: "Aldi", price: 0.79, tags: ["banana", "fruit"], ecoScore: 4 },

  { id: "f-coffee-1", name: "Instant Coffee 200g", category: "food", retailer: "Sainsbury's", price: 4.50, tags: ["coffee"], ecoScore: 3, alternativeId: "f-coffee-2" },
  { id: "f-coffee-2", name: "Instant Coffee 200g", category: "food", retailer: "Lidl", price: 3.20, tags: ["coffee"], ecoScore: 3 },

  { id: "f-kettle-1", name: "Stainless Steel Kettle 1.7L", category: "household", retailer: "Currys", price: 34.99, tags: ["kettle"], ecoScore: 3, alternativeId: "f-kettle-2" },
  { id: "f-kettle-2", name: "Stainless Steel Kettle 1.7L", category: "household", retailer: "Argos", price: 24.99, tags: ["kettle"], ecoScore: 3 },

  // --- Clothes ---
  { id: "c-tshirt-1", name: "Cotton T-Shirt", category: "clothes", retailer: "ASOS", price: 18.00, tags: ["t-shirt", "tshirt", "top"], ecoScore: 3, alternativeId: "c-tshirt-2" },
  { id: "c-tshirt-2", name: "Cotton T-Shirt", category: "clothes", retailer: "Uniqlo", price: 9.90, tags: ["t-shirt", "tshirt", "top"], ecoScore: 4 },

  { id: "c-jeans-1", name: "Slim Fit Jeans", category: "clothes", retailer: "River Island", price: 48.00, tags: ["jeans"], ecoScore: 2, alternativeId: "c-jeans-2" },
  { id: "c-jeans-2", name: "Slim Fit Jeans", category: "clothes", retailer: "H&M", price: 27.99, tags: ["jeans"], ecoScore: 2 },

  { id: "c-shoes-1", name: "Running Shoes", category: "clothes", retailer: "JD Sports", price: 84.99, tags: ["running shoes", "trainers", "shoes"], ecoScore: 3, alternativeId: "c-shoes-2" },
  { id: "c-shoes-2", name: "Running Shoes", category: "clothes", retailer: "Decathlon", price: 39.99, tags: ["running shoes", "trainers", "shoes"], ecoScore: 3 },

  { id: "c-jacket-1", name: "Waterproof Jacket", category: "clothes", retailer: "North Face", price: 130.00, tags: ["jacket", "coat"], ecoScore: 3, alternativeId: "c-jacket-2" },
  { id: "c-jacket-2", name: "Waterproof Jacket", category: "clothes", retailer: "Decathlon", price: 59.99, tags: ["jacket", "coat"], ecoScore: 3 },

  { id: "c-socks-1", name: "Cotton Socks (5-pack)", category: "clothes", retailer: "Marks & Spencer", price: 12.00, tags: ["socks"], ecoScore: 3, alternativeId: "c-socks-2" },
  { id: "c-socks-2", name: "Cotton Socks (5-pack)", category: "clothes", retailer: "Primark", price: 5.00, tags: ["socks"], ecoScore: 3 },

  { id: "c-dress-1", name: "Summer Dress", category: "clothes", retailer: "Zara", price: 39.99, tags: ["dress"], ecoScore: 3, alternativeId: "c-dress-2" },
  { id: "c-dress-2", name: "Summer Dress", category: "clothes", retailer: "New Look", price: 22.99, tags: ["dress"], ecoScore: 3 },

  { id: "c-hoodie-1", name: "Pullover Hoodie", category: "clothes", retailer: "Nike", price: 54.99, tags: ["hoodie", "jumper"], ecoScore: 3, alternativeId: "c-hoodie-2" },
  { id: "c-hoodie-2", name: "Pullover Hoodie", category: "clothes", retailer: "Uniqlo", price: 29.90, tags: ["hoodie", "jumper"], ecoScore: 3 },
];

export function findAlternative(product: Product): Product | undefined {
  if (!product.alternativeId) return undefined;
  return catalog.find((p) => p.id === product.alternativeId);
}

export function findByTag(tag: string): Product | undefined {
  const t = tag.toLowerCase();
  return catalog.find((p) => p.tags.some((tag2) => tag2 === t));
}

// All catalog products that share a tag, cheapest first — used to show the
// user multiple brand/retailer options rather than a single pick.
export function findAllByTag(tag: string): Product[] {
  const t = tag.toLowerCase();
  return catalog
    .filter((p) => p.tags.some((tag2) => tag2 === t))
    .sort((a, b) => a.price - b.price);
}

// --- Presentation helpers ---------------------------------------------------
// Images/links/delivery are derived rather than stored per-product, since this
// is a mock catalog standing in for a live retailer feed.

const RETAILER_DOMAINS: Record<string, string> = {
  Tesco: "tesco.com",
  Aldi: "aldi.co.uk",
  "Sainsbury's": "sainsburys.co.uk",
  Lidl: "lidl.co.uk",
  Waitrose: "waitrose.com",
  Asda: "asda.com",
  Currys: "currys.co.uk",
  Argos: "argos.co.uk",
  ASOS: "asos.com",
  Uniqlo: "uniqlo.com",
  "River Island": "riverisland.com",
  "H&M": "hm.com",
  "JD Sports": "jdsports.co.uk",
  Decathlon: "decathlon.co.uk",
  "North Face": "thenorthface.co.uk",
  "Marks & Spencer": "marksandspencer.com",
  Primark: "primark.com",
  Zara: "zara.com",
  "New Look": "newlook.com",
  Nike: "nike.com",
};

export function productUrl(product: Product): string {
  const domain = RETAILER_DOMAINS[product.retailer];
  if (!domain) return "#";
  return `https://www.${domain}/search?q=${encodeURIComponent(product.name)}`;
}

const SUPERMARKETS = new Set(["Tesco", "Aldi", "Sainsbury's", "Lidl", "Waitrose", "Asda"]);
const ELECTRICALS = new Set(["Currys", "Argos"]);

// The actual choices offered at checkout — asked as a question in chat,
// not just shown as badges.
export function deliveryOptionsFor(product: Product): DeliveryOption[] {
  if (SUPERMARKETS.has(product.retailer)) {
    return [
      { id: "standard", label: "Standard delivery", eta: "Next available 2-hour slot", price: 4.99 },
      { id: "nextday", label: "Next-day delivery", eta: "Priority slot tomorrow", price: 6.99 },
    ];
  }
  if (ELECTRICALS.has(product.retailer)) {
    return [
      { id: "standard", label: "Standard delivery", eta: "3-5 working days", price: 0 },
      { id: "nextday", label: "Next-day delivery", eta: "Order before 8pm for tomorrow", price: 5.99 },
    ];
  }
  return [
    { id: "standard", label: "Standard delivery", eta: "3-5 working days", price: 0 },
    { id: "nextday", label: "Next-day delivery", eta: "Order before 8pm for tomorrow", price: 4.99 },
  ];
}
