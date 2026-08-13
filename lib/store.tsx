"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Order, ShoppingList } from "@/types";

const STORAGE_KEY = "shopcaddy-state-v1";
const MONTHLY_BUDGET = 420;

const SEED_ORDERS: Order[] = [
  {
    id: "ord-1001",
    date: "2026-08-09",
    productName: "Stainless Steel Kettle 1.7L",
    retailer: "Argos",
    price: 24.99,
    saved: 10.0,
    status: "Delivered",
  },
  {
    id: "ord-1002",
    date: "2026-08-05",
    productName: "Cotton T-Shirt",
    retailer: "Uniqlo",
    price: 9.9,
    saved: 8.1,
    status: "Delivered",
  },
  {
    id: "ord-1003",
    date: "2026-08-01",
    productName: "Weekly grocery essentials (8 items)",
    retailer: "Multi-store basket",
    price: 18.42,
    saved: 5.6,
    status: "Delivered",
  },
];

interface AppState {
  bankLinked: boolean;
  bankName: string | null;
  orders: Order[];
  savedLists: ShoppingList[];
  monthlyBudget: number;
}

interface AppStateContextValue extends AppState {
  linkBank: (bankName: string) => void;
  unlinkBank: () => void;
  addOrder: (order: Order) => void;
  saveList: (list: ShoppingList) => void;
  setBudget: (amount: number) => void;
  monthSpend: number;
  monthSaved: number;
}

const AppStateContext = createContext<AppStateContextValue | null>(null);

const DEFAULT_STATE: AppState = {
  bankLinked: false,
  bankName: null,
  orders: SEED_ORDERS,
  savedLists: [],
  monthlyBudget: MONTHLY_BUDGET,
};

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  // Always start from the same default on server and client so hydration
  // matches; any persisted state is loaded client-side after mount below.
  const [state, setState] = useState<AppState>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setState(JSON.parse(raw));
    } catch {
      // ignore corrupt storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, hydrated]);

  const value = useMemo<AppStateContextValue>(() => {
    const monthSpend = state.orders.reduce((s, o) => s + o.price, 0);
    const monthSaved = state.orders.reduce((s, o) => s + o.saved, 0);
    return {
      ...state,
      monthSpend,
      monthSaved,
      linkBank: (bankName: string) =>
        setState((s) => ({ ...s, bankLinked: true, bankName })),
      unlinkBank: () => setState((s) => ({ ...s, bankLinked: false, bankName: null })),
      addOrder: (order: Order) => setState((s) => ({ ...s, orders: [order, ...s.orders] })),
      saveList: (list: ShoppingList) =>
        setState((s) => ({ ...s, savedLists: [list, ...s.savedLists] })),
      setBudget: (amount: number) => setState((s) => ({ ...s, monthlyBudget: amount })),
    };
  }, [state]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}
