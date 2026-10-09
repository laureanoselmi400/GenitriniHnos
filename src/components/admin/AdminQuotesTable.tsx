"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Mail, MessageCircle, Phone } from "lucide-react";
import { formatDate } from "@/lib/format";

type QuoteItemRow = {
  title: string;
  qty: number;
  width: string;
  height: string;
  depth: string;
  material: string;
  note: string;
};

type QuoteRow = {
  id: string;
  reference: string;
  buyerName: string;
  buyerPhone: string;
  buyerEmail: string;
  message: string;
  status: string;
  createdAt: string;
  items: QuoteItemRow[];
};

const ESTADOS = [
  { value: "pending", label: "Pendiente" },
  { value: "reviewing", label: "En revisión" },
  { value: "quoted", label: "Cotizado" },
  { value: "closed", label: "Cerrado" },
  { value: "cancelled", label: "Cancelado" },
];

const TONO: Record<string, string> = {
  pending: "border-arena-osc text-tinta-suave",
  reviewing: "border-oliva text-oliva",
  quoted: "border-oliva bg-oliva text-crema",
  closed: "border-tinta bg-tinta text-crema",
  cancelled: "border-terracota text-terracota",
};

function measures(i: QuoteItemRow): string {
  return [
    i.width && `ancho ${i.width}`,
    i.height && `alto ${i.height}`,
    i.depth && `prof. ${i.depth}`,
  ]
    .filter(Boolean)
    .join(" · ");
}

export default function AdminQuotesTable({ quotes }: { quotes: QuoteRow[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(quotes);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  const change = async (id: string, status: string) => {
    setBusy(id);
    setError("");
    try {
      const res = await fetch(`/api/quotes/${id}`, {
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
        <p className="font-display text-xl">Todavía no hay pedidos de cotización</p>
        <p className="mt-2 text-sm text-tinta-suave">
          Cuando un cliente arme un pedido desde el catálogo o la página de cotización,
          va a aparecer acá.
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
        {rows.map((q) => (
          <article key={q.id} className="border border-arena bg-crema p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-display text-lg">{q.reference}</span>
                  <span
                    className={`border px-2 py-0.5 text-[10px] uppercase tracking-wider ${
                      TONO[q.status] ?? "border-arena-osc text-tinta-suave"
                    }`}
                  >
                    {ESTADOS.find((e) => e.value === q.status)?.label ?? q.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-tinta-suave">
                  {formatDate(q.createdAt)} · {q.buyerName}
                </p>
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-tinta-suave">
                  {q.buyerEmail && (
                    <a
                      href={`mailto:${q.buyerEmail}`}
                      className="inline-flex items-center gap-1 hover:text-terracota"
                    >
                      <Mail className="size-3.5" /> {q.buyerEmail}
                    </a>
                  )}
                  {q.buyerPhone && (
                    <a
                      href={`tel:${q.buyerPhone.replace(/[^+\d]/g, "")}`}
                      className="inline-flex items-center gap-1 hover:text-terracota"
                    >
                      <Phone className="size-3.5" /> {q.buyerPhone}
                    </a>
                  )}
                  {q.buyerPhone && (
                    <a
                      href={`https://wa.me/${q.buyerPhone.replace(/\D/g, "")}?text=${encodeURIComponent(
                        `Hola ${q.buyerName}, te escribimos por tu pedido de cotización ${q.reference}…`,
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-whatsapp hover:underline"
                    >
                      <MessageCircle className="size-3.5" /> WhatsApp
                    </a>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={q.status}
                  disabled={busy === q.id}
                  onChange={(e) => change(q.id, e.target.value)}
                  aria-label={`Estado del pedido ${q.reference}`}
                  className="border border-arena-osc bg-crema-alt px-2 py-2 text-xs focus:border-terracota focus:outline-none disabled:opacity-60"
                >
                  {ESTADOS.map((e) => (
                    <option key={e.value} value={e.value}>
                      {e.label}
                    </option>
                  ))}
                </select>
                {busy === q.id && <Loader2 className="size-4 animate-spin text-terracota" />}
              </div>
            </div>

            <ul className="mt-3 space-y-2 border-t border-arena pt-3 text-sm">
              {q.items.map((i, idx) => (
                <li key={idx} className="text-tinta">
                  <div className="flex justify-between gap-4">
                    <span className="font-medium">
                      {i.title} × {i.qty}
                    </span>
                  </div>
                  {(measures(i) || i.material) && (
                    <p className="text-xs text-tinta-suave">
                      {measures(i)}
                      {i.material && `${measures(i) ? " · " : ""}material: ${i.material}`}
                    </p>
                  )}
                  {i.note && <p className="text-xs italic text-tinta-suave">{i.note}</p>}
                </li>
              ))}
            </ul>

            {q.message && (
              <p className="mt-3 border-l-2 border-arena-osc bg-crema-alt px-3 py-2 text-xs text-tinta-suave">
                {q.message}
              </p>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
