"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Loader2, Minus, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { formatPrice } from "@/lib/format";

export default function CartView() {
  const { items, subtotal, setQty, remove, clear, ready } = useCart();
  const [buyer, setBuyer] = useState({ nombre: "", email: "", telefono: "", mensaje: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (items.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ id: i.id, qty: i.qty })),
          buyer: {
            name: buyer.nombre,
            email: buyer.email,
            phone: buyer.telefono,
            message: buyer.mensaje,
          },
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "No pudimos generar la orden. Intentá nuevamente.");
      }
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
      setLoading(false);
    }
  };

  if (!ready) {
    return <div className="h-64 animate-pulse border border-arena bg-crema-alt" />;
  }

  if (items.length === 0) {
    return (
      <div className="border border-dashed border-arena-osc bg-crema-alt px-6 py-16 text-center">
        <p className="font-display text-2xl">Tu carrito está vacío</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-tinta-suave">
          Explorá el catálogo: cada pieza es única y no se repite.
        </p>
        <Link
          href="/productos"
          className="mt-6 inline-flex items-center gap-2 bg-terracota px-6 py-3 text-sm uppercase tracking-wider text-crema transition-colors hover:bg-terracota-osc"
        >
          Ver productos <ArrowRight className="size-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <section className="space-y-4">
        {items.map((item) => (
          <article
            key={item.id}
            className="flex gap-4 border border-arena bg-crema p-4 sm:gap-5"
          >
            <Link
              href={`/productos/${item.slug}`}
              className="size-24 shrink-0 overflow-hidden border border-arena bg-crema-alt sm:size-28"
            >
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.title}
                  width={200}
                  height={200}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="grid h-full place-items-center text-[10px] uppercase text-tinta-suave">
                  Sin foto
                </div>
              )}
            </Link>

            <div className="flex min-w-0 flex-1 flex-col">
              <Link
                href={`/productos/${item.slug}`}
                className="font-display text-lg leading-snug hover:text-terracota"
              >
                {item.title}
              </Link>
              <p className="mt-0.5 text-sm text-tinta-suave">
                {formatPrice(item.price)} c/u
              </p>

              <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
                <div className="flex items-center border border-arena-osc">
                  <button
                    type="button"
                    onClick={() => setQty(item.id, item.qty - 1)}
                    className="grid size-9 place-items-center hover:bg-crema-alt"
                    aria-label="Quitar una unidad"
                  >
                    <Minus className="size-3.5" />
                  </button>
                  <span className="w-9 text-center text-sm font-semibold">{item.qty}</span>
                  <button
                    type="button"
                    onClick={() => setQty(item.id, item.qty + 1)}
                    disabled={item.qty >= item.stock}
                    className="grid size-9 place-items-center hover:bg-crema-alt disabled:opacity-40"
                    aria-label="Agregar una unidad"
                  >
                    <Plus className="size-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-display text-lg text-terracota">
                    {formatPrice(item.price * item.qty)}
                  </span>
                  <button
                    type="button"
                    onClick={() => remove(item.id)}
                    className="text-tinta-suave transition-colors hover:text-terracota"
                    aria-label={`Eliminar ${item.title}`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}

        <div className="flex items-center justify-between">
          <Link
            href="/productos"
            className="text-xs uppercase tracking-wider text-terracota hover:text-terracota-osc"
          >
            ← Seguir comprando
          </Link>
          <button
            type="button"
            onClick={clear}
            className="text-xs uppercase tracking-wider text-tinta-suave hover:text-terracota"
          >
            Vaciar carrito
          </button>
        </div>
      </section>

      <aside className="lg:sticky lg:top-32 lg:self-start">
        <form onSubmit={submit} className="border border-arena bg-crema p-5 sombra-rustica">
          <h2 className="font-display text-xl">Finalizar compra</h2>

          <div className="mt-4 space-y-3">
            <label className="block">
              <span className="text-xs uppercase tracking-wider text-tinta-suave">
                Nombre y apellido *
              </span>
              <input
                required
                value={buyer.nombre}
                onChange={(e) => setBuyer({ ...buyer, nombre: e.target.value })}
                className="mt-1 w-full border border-arena-osc bg-crema-alt px-3 py-2 text-sm focus:border-terracota focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="text-xs uppercase tracking-wider text-tinta-suave">
                Email *
              </span>
              <input
                type="email"
                required
                value={buyer.email}
                onChange={(e) => setBuyer({ ...buyer, email: e.target.value })}
                className="mt-1 w-full border border-arena-osc bg-crema-alt px-3 py-2 text-sm focus:border-terracota focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="text-xs uppercase tracking-wider text-tinta-suave">
                Teléfono
              </span>
              <input
                value={buyer.telefono}
                onChange={(e) => setBuyer({ ...buyer, telefono: e.target.value })}
                className="mt-1 w-full border border-arena-osc bg-crema-alt px-3 py-2 text-sm focus:border-terracota focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="text-xs uppercase tracking-wider text-tinta-suave">
                Comentario (opcional)
              </span>
              <textarea
                rows={3}
                value={buyer.mensaje}
                onChange={(e) => setBuyer({ ...buyer, mensaje: e.target.value })}
                placeholder="Datos de envío, retiro, consultas…"
                className="mt-1 w-full resize-y border border-arena-osc bg-crema-alt px-3 py-2 text-sm placeholder:text-tinta-suave/60 focus:border-terracota focus:outline-none"
              />
            </label>
          </div>

          <dl className="mt-5 space-y-2 border-t border-arena pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-tinta-suave">Subtotal</dt>
              <dd>{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-tinta-suave">Envío</dt>
              <dd className="text-tinta-suave">A coordinar</dd>
            </div>
            <div className="flex justify-between border-t border-arena pt-2 text-base">
              <dt className="font-semibold">Total</dt>
              <dd className="font-display text-xl text-terracota">
                {formatPrice(subtotal)}
              </dd>
            </div>
          </dl>

          {error && (
            <p className="mt-4 border-l-2 border-terracota bg-crema-alt px-3 py-2 text-sm text-terracota">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 bg-terracota px-5 py-3.5 text-sm uppercase tracking-wider text-crema transition-colors hover:bg-terracota-osc disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Generando pago…
              </>
            ) : (
              <>
                Pagar con Mercado Pago <ArrowRight className="size-4" />
              </>
            )}
          </button>

          <p className="mt-3 flex items-start gap-2 text-[11px] leading-relaxed text-tinta-suave">
            <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-oliva" />
            Pagás en un entorno seguro de Mercado Pago: tarjetas, débito, transferencia
            o efectivo.
          </p>
        </form>
      </aside>
    </div>
  );
}
