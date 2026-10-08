"use client";

import { useState } from "react";
import { Check, ShoppingBag } from "lucide-react";
import { useCart, type CartItem } from "@/components/cart/CartProvider";

type Props = {
  product: Omit<CartItem, "qty">;
  qty?: number;
  compact?: boolean;
};

export default function AddToCartButton({ product, qty = 1, compact = false }: Props) {
  const { add } = useCart();
  const [done, setDone] = useState(false);
  const agotado = product.stock <= 0;

  if (agotado) {
    return (
      <span className="inline-flex items-center gap-1.5 border border-arena-osc bg-crema-alt px-3 py-2 text-xs uppercase tracking-wider text-tinta-suave">
        Sin stock
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        add(product, qty);
        setDone(true);
        window.setTimeout(() => setDone(false), 1600);
      }}
      className={`inline-flex items-center justify-center gap-2 border text-xs uppercase tracking-wider transition-colors ${
        compact ? "px-3 py-2" : "px-5 py-3 text-sm"
      } ${
        done
          ? "border-oliva bg-oliva text-crema"
          : "border-terracota bg-terracota text-crema hover:bg-terracota-osc"
      }`}
      aria-label={`Añadir ${product.title} al carrito`}
    >
      {done ? <Check className="size-4" /> : <ShoppingBag className="size-4" />}
      <span>{done ? "Añadido" : compact ? "Añadir" : "Añadir al carrito"}</span>
    </button>
  );
}
