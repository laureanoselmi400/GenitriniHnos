"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  ClipboardList,
  Loader2,
  MessageCircle,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useQuote } from "@/components/quote/QuoteProvider";
import { formatPrice } from "@/lib/format";
import { hasPrice, kindLabel } from "@/lib/types";

type SubmitState = {
  reference: string;
  waUrl: string;
} | null;

type CatalogProduct = {
  id: number;
  title: string;
  slug: string;
  kind: string;
  price: number;
  material: string;
  width: number | null;
  height: number | null;
  depth: number | null;
  image: string | null;
};

function measuresLabel(item: {
  width: string;
  height: string;
  depth: string;
}): string {
  const parts = [
    item.width && `${item.width} ancho`,
    item.height && `${item.height} alto`,
    item.depth && `${item.depth} prof.`,
  ].filter(Boolean) as string[];
  return parts.join(" · ");
}

export default function QuoteView({ whatsapp }: { whatsapp: string }) {
  const { items, count, update, remove, addProduct, addCustom, clear, ready } = useQuote();
  const [buyer, setBuyer] = useState({
    nombre: "",
    telefono: "",
    email: "",
    mensaje: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<SubmitState>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CatalogProduct[]>([]);
  const [searching, setSearching] = useState(false);

  const fieldCls =
    "w-full border border-arena-osc bg-crema-alt px-2.5 py-2 text-sm focus:border-terracota focus:outline-none";

  useEffect(() => {
    const term = query.trim();
    if (term.length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    const t = window.setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/products?q=${encodeURIComponent(term)}&limit=12`,
        );
        const data = await res.json().catch(() => ({}));
        setResults(Array.isArray(data.products) ? (data.products as CatalogProduct[]) : []);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => window.clearTimeout(t);
  }, [query]);

  const pick = (p: CatalogProduct) => {
    addProduct(
      {
        id: p.id,
        title: p.title,
        slug: p.slug,
        image: p.image,
        width: p.width,
        height: p.height,
        depth: p.depth,
        material: p.material,
      },
      1,
    );
    setQuery("");
    setResults([]);
  };

  const buildMessage = (reference: string) => {
    const lines: string[] = [];
    lines.push(`*Pedido de cotización ${reference}*`);
    if (buyer.nombre) lines.push(`Nombre: ${buyer.nombre}`);
    if (buyer.telefono) lines.push(`Teléfono: ${buyer.telefono}`);
    if (buyer.email) lines.push(`Email: ${buyer.email}`);
    lines.push("");
    items.forEach((item, idx) => {
      lines.push(`${idx + 1}. ${item.title || "Artículo sin detalle"} (x${item.qty})`);
      const m = measuresLabel(item);
      if (m || item.material) {
        lines.push(
          `   Medidas: ${m || "-"}${item.material ? ` · Material: ${item.material}` : ""}`,
        );
      }
      if (item.note) lines.push(`   Nota: ${item.note}`);
    });
    if (buyer.mensaje) {
      lines.push("");
      lines.push(`Comentario: ${buyer.mensaje}`);
    }
    return lines.join("\n");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (items.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyerName: buyer.nombre,
          buyerPhone: buyer.telefono,
          buyerEmail: buyer.email,
          message: buyer.mensaje,
          items: items.map((i) => ({
            productId: i.productId,
            title: i.title,
            qty: i.qty,
            width: i.width,
            height: i.height,
            depth: i.depth,
            material: i.material,
            note: i.note,
          })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "No pudimos generar el pedido.");

      const reference = (data.quote as { reference: string }).reference;
      const waUrl = `https://wa.me/${whatsapp}?text=${encodeURIComponent(
        buildMessage(reference),
      )}`;
      setResult({ reference, waUrl });
      window.open(waUrl, "_blank", "noopener,noreferrer");
      clear();
      setBuyer({ nombre: "", telefono: "", email: "", mensaje: "" });
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
      setLoading(false);
    }
  };

  if (result) {
    return (
      <div className="border border-arena bg-crema p-8 text-center sombra-rustica">
        <ClipboardList className="mx-auto size-10 text-terracota" />
        <h2 className="mt-4 font-display text-2xl">¡Pedido generado!</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-tinta-suave">
          Registramos tu pedido <strong>{result.reference}</strong>. Se abrió WhatsApp
          para enviarlo al local. Si no se abrió automáticamente, usá el botón de abajo.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <a
            href={result.waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-whatsapp px-5 py-3 text-sm uppercase tracking-wider text-crema transition-opacity hover:opacity-90"
          >
            <MessageCircle className="size-4" /> Abrir WhatsApp
          </a>
          <Link
            href="/productos"
            className="inline-flex items-center gap-2 border border-arena-osc px-5 py-3 text-sm uppercase tracking-wider text-tinta-suave transition-colors hover:border-terracota hover:text-terracota"
          >
            Seguir viendo productos <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    );
  }

  const picker = (
    <section className="border border-arena bg-crema p-4 sm:p-5">
      <h2 className="flex items-center gap-2 font-display text-lg">
        <Search className="size-4 text-terracota" /> Agregar un artículo del catálogo
      </h2>
      <p className="mt-1 text-[11px] leading-relaxed text-tinta-suave">
        Buscá por nombre o material y agregalo al pedido. Después ajustá cantidad,
        medidas y notas.
      </p>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Ej.: chapa, puerta de cedro, farola…"
        className={`mt-3 ${fieldCls}`}
      />

      {query.trim().length >= 2 && (
        <div className="mt-3 space-y-2">
          {searching ? (
            <p className="flex items-center gap-2 py-2 text-xs text-tinta-suave">
              <Loader2 className="size-3.5 animate-spin" /> Buscando…
            </p>
          ) : results.length === 0 ? (
            <p className="py-2 text-xs text-tinta-suave">
              Sin resultados. Probá con otra palabra o cargá un{" "}
              <button
                type="button"
                onClick={addCustom}
                className="text-terracota underline"
              >
                artículo libre
              </button>
              .
            </p>
          ) : (
            results.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 border border-arena bg-crema-alt p-2"
              >
                <div className="size-12 shrink-0 overflow-hidden border border-arena bg-crema">
                  {p.image ? (
                    <img
                      src={p.image}
                      alt={p.title}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{p.title}</p>
                  <p className="text-[11px] text-tinta-suave">
                    {kindLabel(p.kind)} ·{" "}
                    {hasPrice(p.price) ? formatPrice(p.price) : "Pedir cotización"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => pick(p)}
                  className="inline-flex shrink-0 items-center gap-1.5 border border-terracota bg-terracota px-3 py-2 text-[11px] uppercase tracking-wider text-crema transition-colors hover:bg-terracota-osc"
                >
                  <Plus className="size-3.5" /> Agregar
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </section>
  );

  if (!ready) {
    return <div className="h-64 animate-pulse border border-arena bg-crema-alt" />;
  }

  if (items.length === 0) {
    return (
      <div className="space-y-6">
        <div className="border border-dashed border-arena-osc bg-crema-alt px-6 py-10 text-center">
          <ClipboardList className="mx-auto size-10 text-tinta-suave" />
          <p className="mt-4 font-display text-2xl">Tu pedido de cotización está vacío</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-tinta-suave">
            Buscá un artículo del catálogo, agregalo desde la ficha del producto con “Pedir
            cotización”, o cargá uno con detalle libre.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={addCustom}
              className="inline-flex items-center gap-2 border border-terracota px-5 py-3 text-sm uppercase tracking-wider text-terracota transition-colors hover:bg-terracota hover:text-crema"
            >
              <Plus className="size-4" /> Artículo libre
            </button>
            <Link
              href="/productos"
              className="inline-flex items-center gap-2 bg-terracota px-5 py-3 text-sm uppercase tracking-wider text-crema transition-colors hover:bg-terracota-osc"
            >
              Ver productos <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>

        {picker}
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <section className="space-y-4">
        {picker}

        {items.map((item, idx) => (
          <article key={item.key} className="border border-arena bg-crema p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-terracota">
                Artículo {idx + 1}
              </span>
              <button
                type="button"
                onClick={() => remove(item.key)}
                className="text-tinta-suave transition-colors hover:text-terracota"
                aria-label={`Eliminar ${item.title || "artículo"}`}
              >
                <Trash2 className="size-4" />
              </button>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_96px]">
              <label className="block">
                <span className="text-[11px] uppercase tracking-wider text-tinta-suave">
                  Detalle
                </span>
                <input
                  value={item.title}
                  onChange={(e) => update(item.key, { title: e.target.value })}
                  placeholder="Ej.: Chapa acanalada N°25"
                  className={`mt-1 ${fieldCls}`}
                />
              </label>
              <label className="block">
                <span className="text-[11px] uppercase tracking-wider text-tinta-suave">
                  Cantidad
                </span>
                <input
                  type="number"
                  min={1}
                  value={item.qty}
                  onChange={(e) =>
                    update(item.key, { qty: Math.max(1, Number(e.target.value) || 1) })
                  }
                  className={`mt-1 ${fieldCls}`}
                />
              </label>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <label className="block">
                <span className="text-[11px] uppercase tracking-wider text-tinta-suave">
                  Ancho (cm)
                </span>
                <input
                  value={item.width}
                  onChange={(e) => update(item.key, { width: e.target.value })}
                  className={`mt-1 ${fieldCls}`}
                />
              </label>
              <label className="block">
                <span className="text-[11px] uppercase tracking-wider text-tinta-suave">
                  Alto (cm)
                </span>
                <input
                  value={item.height}
                  onChange={(e) => update(item.key, { height: e.target.value })}
                  className={`mt-1 ${fieldCls}`}
                />
              </label>
              <label className="block">
                <span className="text-[11px] uppercase tracking-wider text-tinta-suave">
                  Profundidad
                </span>
                <input
                  value={item.depth}
                  onChange={(e) => update(item.key, { depth: e.target.value })}
                  className={`mt-1 ${fieldCls}`}
                />
              </label>
              <label className="block">
                <span className="text-[11px] uppercase tracking-wider text-tinta-suave">
                  Material
                </span>
                <input
                  value={item.material}
                  onChange={(e) => update(item.key, { material: e.target.value })}
                  className={`mt-1 ${fieldCls}`}
                />
              </label>
            </div>

            <label className="mt-3 block">
              <span className="text-[11px] uppercase tracking-wider text-tinta-suave">
                Nota (opcional)
              </span>
              <input
                value={item.note}
                onChange={(e) => update(item.key, { note: e.target.value })}
                placeholder="Color, terminación, cantidad especial…"
                className={`mt-1 ${fieldCls}`}
              />
            </label>
          </article>
        ))}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={addCustom}
            className="inline-flex items-center gap-2 border border-arena-osc px-4 py-2.5 text-xs uppercase tracking-wider text-tinta-suave transition-colors hover:border-terracota hover:text-terracota"
          >
            <Plus className="size-4" /> Agregar artículo libre
          </button>
          <button
            type="button"
            onClick={clear}
            className="text-xs uppercase tracking-wider text-tinta-suave hover:text-terracota"
          >
            Vaciar pedido
          </button>
        </div>
      </section>

      <aside className="lg:sticky lg:top-32 lg:self-start">
        <form onSubmit={submit} className="border border-arena bg-crema p-5 sombra-rustica">
          <h2 className="font-display text-xl">Tus datos</h2>
          <p className="mt-1 text-[11px] leading-relaxed text-tinta-suave">
            {count} {count === 1 ? "artículo" : "artículos"} en el pedido.
          </p>

          <div className="mt-4 space-y-3">
            <label className="block">
              <span className="text-xs uppercase tracking-wider text-tinta-suave">
                Nombre y apellido *
              </span>
              <input
                required
                value={buyer.nombre}
                onChange={(e) => setBuyer({ ...buyer, nombre: e.target.value })}
                className={`mt-1 ${fieldCls}`}
              />
            </label>
            <label className="block">
              <span className="text-xs uppercase tracking-wider text-tinta-suave">
                Teléfono / WhatsApp
              </span>
              <input
                value={buyer.telefono}
                onChange={(e) => setBuyer({ ...buyer, telefono: e.target.value })}
                className={`mt-1 ${fieldCls}`}
              />
            </label>
            <label className="block">
              <span className="text-xs uppercase tracking-wider text-tinta-suave">
                Email
              </span>
              <input
                type="email"
                value={buyer.email}
                onChange={(e) => setBuyer({ ...buyer, email: e.target.value })}
                className={`mt-1 ${fieldCls}`}
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
                placeholder="Consulta, forma de entrega, etc."
                className={`mt-1 resize-y ${fieldCls}`}
              />
            </label>
          </div>

          {error && (
            <p className="mt-4 border-l-2 border-terracota bg-crema-alt px-3 py-2 text-sm text-terracota">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 bg-whatsapp px-5 py-3.5 text-sm uppercase tracking-wider text-crema transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Generando pedido…
              </>
            ) : (
              <>
                <MessageCircle className="size-4" /> Enviar pedido por WhatsApp
              </>
            )}
          </button>

          <p className="mt-3 text-[11px] leading-relaxed text-tinta-suave">
            Guardamos tu pedido y lo enviamos por WhatsApp al local. También podés
            sumarle artículos con precio para consultar disponibilidad y condiciones.
          </p>
        </form>
      </aside>
    </div>
  );
}
