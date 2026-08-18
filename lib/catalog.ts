import type { SupabaseClient } from "@supabase/supabase-js";
import { Product, ProductVariant } from "@/types";

interface ProductRow {
  id: string;
  name: string;
  category: string;
  retailer: string;
  price: number;
  tags: string[];
  eco_score: number | null;
}

interface VariantRow {
  id: string;
  product_id: string;
  kind: string;
  value: string;
  in_stock: boolean;
}

function toProduct(row: ProductRow, variantRows: VariantRow[]): Product {
  return {
    id: row.id,
    name: row.name,
    category: row.category as Product["category"],
    retailer: row.retailer,
    price: Number(row.price),
    tags: row.tags,
    ecoScore: (row.eco_score ?? undefined) as Product["ecoScore"],
    variants: variantRows
      .filter((v) => v.product_id === row.id)
      .map((v) => ({
        id: v.id,
        kind: v.kind as ProductVariant["kind"],
        value: v.value,
        inStock: v.in_stock,
      })),
  };
}

// Fuzzy search over the catalog via the search_products() Postgres function
// (substring + trigram similarity, see supabase/schema.sql) — cheapest match
// first among equally-relevant results, which is what powers the multi-brand
// comparison cards in Chat and List Maker.
export async function searchProducts(
  supabase: SupabaseClient,
  query: string,
  limit = 20
): Promise<Product[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const { data: rows, error } = await supabase.rpc("search_products", {
    search_query: trimmed,
    result_limit: limit,
  });
  if (error || !rows || rows.length === 0) return [];

  const ids = (rows as ProductRow[]).map((r) => r.id);
  const { data: variantRows } = await supabase
    .from("product_variants")
    .select("*")
    .in("product_id", ids);

  return (rows as ProductRow[]).map((row) => toProduct(row, (variantRows as VariantRow[]) ?? []));
}

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

// Deep-links to the retailer's own search for this product — ShopCaddy
// doesn't execute checkout itself, it hands the user off to buy directly.
export function productUrl(product: Product): string {
  const domain = RETAILER_DOMAINS[product.retailer];
  if (!domain) return "#";
  return `https://www.${domain}/search?q=${encodeURIComponent(product.name)}`;
}

export const BUDGET_CATEGORIES = ["Food", "Household", "Clothes", "Bills", "Other"];

export function categoryLabel(category: string): string {
  return category.charAt(0).toUpperCase() + category.slice(1);
}

const SUPERMARKETS = new Set(["Tesco", "Aldi", "Sainsbury's", "Lidl", "Waitrose", "Asda"]);
const ELECTRICALS = new Set(["Currys", "Argos"]);

// Informational only — real delivery choice happens on the retailer's own
// checkout, not in ShopCaddy.
export function deliveryEstimate(product: Product): string {
  if (SUPERMARKETS.has(product.retailer)) return "Next-day delivery · free over £40";
  if (ELECTRICALS.has(product.retailer)) return "Next-day delivery available";
  return "Next-day delivery · free returns";
}
