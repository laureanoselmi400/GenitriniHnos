"use client";

import Link from "next/link";
import { useState } from "react";
import { ClipboardList, Minus, Plus, ShoppingCart } from "lucide-react";
import AddToCartButton from "@/components/products/AddToCartButton";
import QuoteButton from "@/components/quote/QuoteButton";
import { hasPrice } from "@/lib/types";

export default function ProductPurchase({
  product,
}: {
  product: {
    id: number;
    title: string;
    slug: string;
    price: number;
    image: string | null;
    stock: number;
    width?: number | null;
    height?: number | null;
    depth?: number | null;
    material?: string | null;
  };
}) {
  const [qty, setQty] = useState(1);
  const max = Math.max(1, product.stock);
  const agotado = product.stock <= 0;
  const priced = hasPrice(product.price);

  if (agotado) {
    return (
      <div className="border border-arena bg-crema-alt px-4 py-4 text-sm text-tinta-suave">
        Esta pieza ya encontró dueño.{" "}
        <Link href="/contacto" className="text-terracota underline">
          Escribinos
        </Link>{" "}
        por si querés avisarte cuando ingrese algo similar.
      </div>
    );
  }

  const qtyPicker = (
    <div className="flex items-center border border-arena-osc">
      <button
        type="button"
        onClick={() => setQty((v) => Math.max(1, v - 1))}
        className="grid size-11 place-items-center text-tinta transition-colors hover:bg-crema-alt disabled:opacity-40"
        disabled={qty <= 1}
        aria-label="Quitar una unidad"
      >
        <Minus className="size-4" />
      </button>
      <span className="w-10 text-center text-sm font-semibold">{qty}</span>
      <button
        type="button"
        onClick={() => setQty((v) => Math.min(max, v + 1))}
        className="grid size-11 place-items-center text-tinta transition-colors hover:bg-crema-alt disabled:opacity-40"
        disabled={qty >= max}
        aria-label="Agregar una unidad"
      >
        <Plus className="size-4" />
      </button>
    </div>
  );

  if (!priced) {
    return (
      <div className="flex flex-wrap items-center gap-4">
        {qtyPicker}
        <QuoteButton
          product={{
            id: product.id,
            title: product.title,
            slug: product.slug,
            image: product.image,
            width: product.width,
            height: product.height,
            depth: product.depth,
            material: product.material,
          }}
          qty={qty}
        />
        <Link
          href="/cotizacion"
          className="inline-flex items-center gap-2 border border-oliva px-5 py-3 text-xs uppercase tracking-wider text-oliva transition-colors hover:bg-oliva hover:text-crema"
        >
          <ClipboardList className="size-4" /> Ver pedido de cotización
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-4">
        {qtyPicker}
        <AddToCartButton product={{ ...product, material: product.material ?? "" }} qty={qty} />
        <Link
          href="/carrito"
          className="inline-flex items-center gap-2 border border-oliva px-5 py-3 text-xs uppercase tracking-wider text-oliva transition-colors hover:bg-oliva hover:text-crema"
        >
          <ShoppingCart className="size-4" /> Ir al carrito
        </Link>
      </div>

      <QuoteButton
        variant="outline"
        label="Pedir cotización"
        product={{
          id: product.id,
          title: product.title,
          slug: product.slug,
          image: product.image,
          width: product.width,
          height: product.height,
          depth: product.depth,
          material: product.material,
        }}
        qty={qty}
        compact
      />
    </div>
  );
}
