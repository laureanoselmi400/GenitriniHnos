import Link from "next/link";
import { ArrowRight, ClipboardList, Eye, EyeOff, Package, Plus, Receipt, Star } from "lucide-react";
import { db } from "@/lib/db";
import { categoryLabel } from "@/lib/categories";
import { formatDate, formatPrice } from "@/lib/format";
import { orderStatusLabel } from "@/lib/mercadopago";
import { hasPrice } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [
    total,
    publicados,
    ocultos,
    destacados,
    pedidos,
    pendientes,
    cotizaciones,
    ultimosPedidos,
    ultimosProductos,
  ] = await Promise.all([
    db.product.count(),
    db.product.count({ where: { visible: true } }),
    db.product.count({ where: { visible: false } }),
    db.product.count({ where: { featured: true } }),
    db.order.count(),
    db.order.count({ where: { status: "pending" } }),
    db.quote.count({ where: { status: "pending" } }),
    db.order.findMany({ orderBy: { createdAt: "desc" }, take: 5, include: { items: true } }),
    db.product.findMany({ orderBy: { updatedAt: "desc" }, take: 5, include: { images: true } }),
  ]);

  const stats = [
    { label: "Productos", value: total, icon: Package },
    { label: "Publicados", value: publicados, icon: Eye },
    { label: "Ocultos", value: ocultos, icon: EyeOff },
    { label: "Destacados", value: destacados, icon: Star },
    { label: "Pedidos", value: pedidos, icon: Receipt },
    { label: "Pendientes", value: pendientes, icon: Receipt },
    { label: "Cotizaciones", value: cotizaciones, icon: ClipboardList },
  ];

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Resumen</h1>
          <p className="mt-1 text-sm text-tinta-suave">
            Estado del catálogo y de los pedidos recibidos.
          </p>
        </div>
        <Link
          href="/admin/productos/nuevo"
          className="inline-flex items-center gap-2 bg-terracota px-4 py-2.5 text-xs uppercase tracking-wider text-crema transition-colors hover:bg-terracota-osc"
        >
          <Plus className="size-4" /> Nuevo producto
        </Link>
      </header>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map((s) => (
          <div key={s.label} className="border border-arena bg-crema p-4">
            <s.icon className="size-4 text-terracota" />
            <p className="mt-2 font-display text-3xl">{s.value}</p>
            <p className="text-[11px] uppercase tracking-wider text-tinta-suave">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="border border-arena bg-crema">
          <div className="flex items-center justify-between border-b border-arena px-4 py-3">
            <h2 className="font-display text-lg">Últimos pedidos</h2>
            <Link
              href="/admin/pedidos"
              className="inline-flex items-center gap-1 text-xs uppercase tracking-wider text-terracota"
            >
              Ver todos <ArrowRight className="size-3" />
            </Link>
          </div>
          {ultimosPedidos.length === 0 ? (
            <p className="px-4 py-6 text-sm text-tinta-suave">Todavía no hay pedidos.</p>
          ) : (
            <ul className="divide-y divide-arena">
              {ultimosPedidos.map((o) => (
                <li key={o.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{o.buyerName}</p>
                    <p className="text-xs text-tinta-suave">
                      {o.reference} · {formatDate(o.createdAt)} · {o.items.length} ítems
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatPrice(o.total)}</p>
                    <span
                      className={`text-[10px] uppercase tracking-wider ${
                        o.status === "approved" ? "text-oliva" : "text-terracota"
                      }`}
                    >
                      {orderStatusLabel(o.status)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="border border-arena bg-crema">
          <div className="flex items-center justify-between border-b border-arena px-4 py-3">
            <h2 className="font-display text-lg">Productos actualizados</h2>
            <Link
              href="/admin/productos"
              className="inline-flex items-center gap-1 text-xs uppercase tracking-wider text-terracota"
            >
              Ver todos <ArrowRight className="size-3" />
            </Link>
          </div>
          <ul className="divide-y divide-arena">
            {ultimosProductos.map((p) => (
              <li key={p.id} className="flex items-center gap-3 px-4 py-3">
                <div className="size-11 shrink-0 overflow-hidden border border-arena bg-crema-alt">
                  {p.images[0] ? (
                    <img
                      src={p.images[0].url}
                      alt={p.title}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{p.title}</p>
                  <p className="text-xs text-tinta-suave">
                    {categoryLabel(p.category)} ·{" "}
                    {hasPrice(p.price) ? formatPrice(p.price) : "A cotizar"}
                  </p>
                </div>
                <Link
                  href={`/admin/productos/${p.id}`}
                  className="text-xs uppercase tracking-wider text-terracota"
                >
                  Editar
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
