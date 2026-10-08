import type { Metadata } from "next";
import CartView from "@/components/cart/CartView";

export const metadata: Metadata = {
  title: "Carrito",
  description: "Revisá tus artículos seleccionados y finalizá la compra con Mercado Pago.",
};

export default function CarritoPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <header className="border-b border-arena pb-6">
        <span className="text-xs uppercase tracking-[0.35em] text-terracota">
          Tu selección
        </span>
        <h1 className="mt-3 font-display text-4xl">Carrito de compras</h1>
      </header>
      <div className="mt-8">
        <CartView />
      </div>
    </div>
  );
}
