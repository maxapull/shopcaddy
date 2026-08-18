export interface ListItem {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
}

export interface ShoppingList {
  id: string;
  title: string;
  createdAt: string;
  items: ListItem[];
}

export interface Transaction {
  id: string;
  amount: number;
  category: string;
  note: string | null;
  date: string;
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

export interface PendingLog {
  amount: number;
  category: string;
  note?: string;
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  text: string;
  kind?: "text" | "confirm-log" | "logged";
  meta?: {
    pendingLog?: PendingLog;
    transaction?: Transaction;
  };
}
