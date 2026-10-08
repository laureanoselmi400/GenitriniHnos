"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Mail, MessageCircle, Phone } from "lucide-react";
import { formatDate, formatPrice } from "@/lib/format";

type OrderRow = {
  id: string;
  reference: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  status: string;
  total: number;
  demo: boolean;
  createdAt: string;
  items: { title: string; qty: number; price: number }[];
};

const ESTADOS = [
  { value: "pending", label: "Pendiente" },
  { value: "approved", label: "Aprobado" },
  { value: "paid", label: "Pagado" },
  { value: "shipped", label: "Entregado" },
  { value: "rejected", label: "Rechazado" },
  { value: "cancelled", label: "Cancelado" },
];

const TONO: Record<string, string> = {
  pending: "border-arena-osc text-tinta-suave",
  approved: "border-oliva text-oliva",
  paid: "border-oliva bg-oliva text-crema",
  shipped: "border-oliva bg-oliva text-crema",
  rejected: "border-terracota text-terracota",
  cancelled: "border-terracota text-terracota",
};

export default function AdminOrdersTable({ orders }: { orders: OrderRow[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(orders);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  const change = async (id: string, status: string) => {
    setBusy(id);
    setError("");
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "No se pudo actualizar");
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setBusy("");
    }
  };

  if (rows.length === 0) {
    return (
      <div className="border border-dashed border-arena-osc bg-crema px-6 py-14 text-center">
        <p className="font-display text-xl">Todavía no hay pedidos</p>
        <p className="mt-2 text-sm text-tinta-suave">
          Cuando un cliente finalice la compra desde el carrito, va a aparecer acá.
        </p>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <p className="mb-4 border-l-2 border-terracota bg-crema px-3 py-2 text-sm text-terracota">
          {error}
        </p>
      )}

      <div className="space-y-4">
        {rows.map((o) => (
          <article key={o.id} className="border border-arena bg-crema p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-display text-lg">{o.reference}</span>
                  <span
                    className={`border px-2 py-0.5 text-[10px] uppercase tracking-wider ${
                      TONO[o.status] ?? "border-arena-osc text-tinta-suave"
                    }`}
                  >
                    {ESTADOS.find((e) => e.value === o.status)?.label ?? o.status}
                  </span>
                  {o.demo && (
                    <span className="border border-arena-osc px-2 py-0.5 text-[10px] uppercase tracking-wider text-tinta-suave">
                      Demo
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-tinta-suave">
                  {formatDate(o.createdAt)} · {o.buyerName}
                </p>
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-tinta-suave">
                  <a
                    href={`mailto:${o.buyerEmail}`}
                    className="inline-flex items-center gap-1 hover:text-terracota"
                  >
                    <Mail className="size-3.5" /> {o.buyerEmail}
                  </a>
                  {o.buyerPhone && (
                    <a
                      href={`tel:${o.buyerPhone.replace(/[^+\d]/g, "")}`}
                      className="inline-flex items-center gap-1 hover:text-terracota"
                    >
                      <Phone className="size-3.5" /> {o.buyerPhone}
                    </a>
                  )}
                  <a
                    href={`https://wa.me/${o.buyerPhone.replace(/\D/g, "")}?text=${encodeURIComponent(
                      `Hola ${o.buyerName}, respecto a tu pedido ${o.reference}…`,
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-whatsapp hover:underline"
                  >
                    <MessageCircle className="size-3.5" /> WhatsApp
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-display text-xl text-terracota">
                  {formatPrice(o.total)}
                </span>
                <select
                  value={o.status}
                  disabled={busy === o.id}
                  onChange={(e) => change(o.id, e.target.value)}
                  aria-label={`Estado del pedido ${o.reference}`}
                  className="border border-arena-osc bg-crema-alt px-2 py-2 text-xs focus:border-terracota focus:outline-none disabled:opacity-60"
                >
                  {ESTADOS.map((e) => (
                    <option key={e.value} value={e.value}>
                      {e.label}
                    </option>
                  ))}
                </select>
                {busy === o.id && <Loader2 className="size-4 animate-spin text-terracota" />}
              </div>
            </div>

            <ul className="mt-3 border-t border-arena pt-3 text-sm text-tinta-suave">
              {o.items.map((i, idx) => (
                <li key={idx} className="flex justify-between gap-4">
                  <span>
                    {i.title} × {i.qty}
                  </span>
                  <span>{formatPrice(i.price * i.qty)}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  );
}
