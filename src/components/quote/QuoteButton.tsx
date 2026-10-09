"use client";

import { useState } from "react";
import { Check, ClipboardList } from "lucide-react";
import { useQuote, type QuoteProductSeed } from "@/components/quote/QuoteProvider";

type Props = {
  product: QuoteProductSeed;
  qty?: number;
  compact?: boolean;
  label?: string;
  variant?: "solid" | "outline";
};

export default function QuoteButton({
  product,
  qty = 1,
  compact = false,
  label,
  variant = "solid",
}: Props) {
  const { addProduct } = useQuote();
  const [done, setDone] = useState(false);
  const text = label ?? (done ? "Agregado" : compact ? "Cotizar" : "Pedir cotización");

  const tone = done
    ? "border-oliva bg-oliva text-crema"
    : variant === "outline"
      ? "border-terracota text-terracota hover:bg-terracota hover:text-crema"
      : "border-terracota bg-terracota text-crema hover:bg-terracota-osc";

  return (
    <button
      type="button"
      onClick={() => {
        addProduct(product, qty);
        setDone(true);
        window.setTimeout(() => setDone(false), 1600);
      }}
      className={`inline-flex items-center justify-center gap-2 border text-xs uppercase tracking-wider transition-colors ${
        compact ? "px-3 py-2" : "px-5 py-3 text-sm"
      } ${tone}`}
      aria-label={`Agregar ${product.title} al pedido de cotización`}
    >
      {done ? <Check className="size-4" /> : <ClipboardList className="size-4" />}
      <span>{text}</span>
    </button>
  );
}
