export type Category = "food" | "clothes" | "household";

export interface Product {
  id: string;
  name: string;
  category: Category;
  retailer: string;
  price: number;
  unit?: string;
  tags: string[];
  ecoScore?: 1 | 2 | 3 | 4 | 5;
  alternativeId?: string; // cheaper alternative product id
}

export interface ListItem {
  id: string;
  query: string;
  product: Product;
  alternative?: Product;
  useAlternative: boolean;
  quantity: number;
}

export interface ShoppingList {
  id: string;
  title: string;
  createdAt: string;
  items: ListItem[];
}

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  text: string;
  kind?: "text" | "order-confirm" | "order-success" | "bank-required" | "product-options";
  meta?: {
    product?: Product;
    options?: Product[];
    orderTotal?: number;
    originalPrice?: number;
  };
}

export interface Order {
  id: string;
  date: string;
  productName: string;
  retailer: string;
  price: number;
  saved: number;
  status: "Delivered" | "Processing" | "Placed";
}
