"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type QuoteItem = {
  key: string;
  productId: number | null;
  title: string;
  slug: string | null;
  image: string | null;
  qty: number;
  width: string;
  height: string;
  depth: string;
  material: string;
  note: string;
};

export type QuoteProductSeed = {
  id: number;
  title: string;
  slug: string;
  image: string | null;
  width?: number | null;
  height?: number | null;
  depth?: number | null;
  material?: string | null;
};

type QuoteContextValue = {
  items: QuoteItem[];
  count: number;
  ready: boolean;
  addProduct: (product: QuoteProductSeed, qty?: number) => void;
  addCustom: () => void;
  remove: (key: string) => void;
  update: (key: string, patch: Partial<QuoteItem>) => void;
  clear: () => void;
};

const STORAGE_KEY = "gh_quote_v1";

const QuoteContext = createContext<QuoteContextValue | null>(null);

function measure(value: number | null | undefined): string {
  return value === null || value === undefined ? "" : String(value);
}

export function QuoteProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as QuoteItem[];
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch {
      /* storage no disponible */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage no disponible */
    }
  }, [items, ready]);

  const addProduct = useCallback((product: QuoteProductSeed, qty = 1) => {
    setItems((prev) => {
      const key = `p${product.id}`;
      const found = prev.find((i) => i.key === key);
      if (found) {
        return prev.map((i) =>
          i.key === key ? { ...i, qty: Math.max(1, i.qty + qty) } : i,
        );
      }
      return [
        ...prev,
        {
          key,
          productId: product.id,
          title: product.title,
          slug: product.slug,
          image: product.image,
          qty: Math.max(1, qty),
          width: measure(product.width),
          height: measure(product.height),
          depth: measure(product.depth),
          material: product.material ?? "",
          note: "",
        },
      ];
    });
  }, []);

  const addCustom = useCallback(() => {
    setItems((prev) => [
      ...prev,
      {
        key: `c${Date.now()}${Math.floor(Math.random() * 1000)}`,
        productId: null,
        title: "",
        slug: null,
        image: null,
        qty: 1,
        width: "",
        height: "",
        depth: "",
        material: "",
        note: "",
      },
    ]);
  }, []);

  const remove = useCallback((key: string) => {
    setItems((prev) => prev.filter((i) => i.key !== key));
  }, []);

  const update = useCallback((key: string, patch: Partial<QuoteItem>) => {
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, ...patch } : i)));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<QuoteContextValue>(() => {
    const count = items.reduce((acc, i) => acc + i.qty, 0);
    return { items, count, ready, addProduct, addCustom, remove, update, clear };
  }, [items, ready, addProduct, addCustom, remove, update, clear]);

  return <QuoteContext.Provider value={value}>{children}</QuoteContext.Provider>;
}

export function useQuote() {
  const ctx = useContext(QuoteContext);
  if (!ctx) throw new Error("useQuote debe usarse dentro de <QuoteProvider>");
  return ctx;
}
