export type Category = "food" | "household" | "clothes";

export interface ProductVariant {
  id: string;
  kind: "size" | "colour";
  value: string;
  inStock: boolean;
}

export interface Product {
  id: string;
  name: string;
  category: Category;
  retailer: string;
  price: number;
  tags: string[];
  ecoScore?: 1 | 2 | 3 | 4 | 5;
  variants: ProductVariant[];
}

export interface ListItem {
  id: string;
  query: string;
  options: Product[];
  selectedIndex: number;
  quantity: number;
}

export interface ShoppingList {
  id: string;
  title: string;
  createdAt: string;
  items: ListItem[];
}

export type TransactionSource = "manual" | "shopping";

export interface Transaction {
  id: string;
  amount: number;
  category: string;
  note: string | null;
  date: string;
  source: TransactionSource;
  productName: string | null;
  retailer: string | null;
  createdAt: string;
}

export interface CategoryBudget {
  id: string;
  category: string;
  monthlyLimit: number;
}

export interface Profile {
  id: string;
  email: string | null;
  monthlyBudget: number;
}

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  text: string;
  kind?: "text" | "product-options" | "variant-options" | "product-ready" | "logged";
  meta?: {
    product?: Product;
    options?: Product[];
    variant?: ProductVariant;
    transaction?: Transaction;
  };
}
