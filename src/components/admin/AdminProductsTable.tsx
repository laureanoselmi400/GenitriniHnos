"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, Loader2, Pencil, Star, Trash2 } from "lucide-react";
import { categoryLabel } from "@/lib/categories";
import { formatPrice } from "@/lib/format";
import { hasPrice, kindLabel } from "@/lib/types";

type Row = {
  id: number;
  title: string;
  slug: string;
  category: string;
  kind: string;
  price: number;
  stock: number;
  featured: boolean;
  visible: boolean;
  views: number;
  image: string | null;
  images: { url: string; alt?: string | null }[];
};

export default function AdminProductsTable({ products }: { products: Row[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(products);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const patch = async (id: number, data: Record<string, unknown>) => {
    setBusyId(id);
    setError("");
    try {
      const res = await fetch("/api/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...data }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "No se pudo actualizar");
      const updated = body.product as Row;
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...updated } : r)));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (row: Row) => {
    if (!window.confirm(`¿Eliminar “${row.title}”? Esta acción no se puede deshacer.`))
      return;
    setBusyId(row.id);
    setError("");
    try {
      const res = await fetch(`/api/products?id=${row.id}`, { method: "DELETE" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "No se pudo eliminar");
      setRows((prev) => prev.filter((r) => r.id !== row.id));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setBusyId(null);
    }
  };

  if (rows.length === 0) {
    return (
      <div className="border border-dashed border-arena-osc bg-crema px-6 py-14 text-center">
        <p className="font-display text-xl">Todavía no hay productos cargados</p>
        <Link
          href="/admin/productos/nuevo"
          className="mt-4 inline-block bg-terracota px-5 py-2.5 text-xs uppercase tracking-wider text-crema hover:bg-terracota-osc"
        >
          Cargar el primero
        </Link>
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

      <div className="overflow-x-auto border border-arena bg-crema">
        <table className="w-full min-w-[820px] text-sm">
          <thead>
            <tr className="border-b border-arena bg-crema-alt text-left text-[11px] uppercase tracking-wider text-tinta-suave">
              <th className="px-3 py-3">Pieza</th>
              <th className="px-3 py-3">Rubro</th>
              <th className="px-3 py-3">Precio</th>
              <th className="px-3 py-3">Stock</th>
              <th className="px-3 py-3">Destacado</th>
              <th className="px-3 py-3">Visible</th>
              <th className="px-3 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-arena">
            {rows.map((row) => {
              const busy = busyId === row.id;
              return (
                <tr key={row.id} className="align-middle hover:bg-crema-alt/60">
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-3">
                      <div className="size-12 shrink-0 overflow-hidden border border-arena bg-crema-alt">
                        {row.image ? (
                          <img
                            src={row.image}
                            alt={row.title}
                            className="h-full w-full object-cover"
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{row.title}</p>
                        <p className="text-xs text-tinta-suave">
                          <span
                            className={`mr-1.5 border px-1.5 py-0.5 text-[9px] uppercase tracking-wider ${
                              row.kind === "nuevo"
                                ? "border-oliva text-oliva"
                                : "border-arena-osc text-tinta-suave"
                            }`}
                          >
                            {kindLabel(row.kind)}
                          </span>
                          {row.views} vistas
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-tinta-suave">
                    {categoryLabel(row.category)}
                  </td>
                  <td className="px-3 py-3 font-semibold">
                    {hasPrice(row.price) ? (
                      formatPrice(row.price)
                    ) : (
                      <span className="text-[11px] uppercase tracking-wider text-terracota">
                        Pedir cotización
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <input
                      type="number"
                      min={0}
                      defaultValue={row.stock}
                      disabled={busy}
                      onBlur={(e) => {
                        const value = Math.max(0, Number(e.target.value) || 0);
                        if (value !== row.stock) patch(row.id, { stock: value });
                      }}
                      aria-label={`Stock de ${row.title}`}
                      className="w-20 border border-arena-osc bg-crema-alt px-2 py-1.5 text-sm focus:border-terracota focus:outline-none disabled:opacity-60"
                    />
                  </td>
                  <td className="px-3 py-3">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => patch(row.id, { featured: !row.featured })}
                      className={`inline-flex items-center gap-1.5 border px-2 py-1 text-[11px] uppercase tracking-wider transition-colors disabled:opacity-60 ${
                        row.featured
                          ? "border-terracota bg-terracota text-crema"
                          : "border-arena-osc text-tinta-suave hover:border-terracota hover:text-terracota"
                      }`}
                    >
                      <Star className="size-3" />
                      {row.featured ? "Sí" : "No"}
                    </button>
                  </td>
                  <td className="px-3 py-3">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => patch(row.id, { visible: !row.visible })}
                      className={`inline-flex items-center gap-1.5 border px-2 py-1 text-[11px] uppercase tracking-wider transition-colors disabled:opacity-60 ${
                        row.visible
                          ? "border-oliva bg-oliva text-crema"
                          : "border-arena-osc text-tinta-suave hover:border-oliva hover:text-oliva"
                      }`}
                    >
                      {row.visible ? <Eye className="size-3" /> : <EyeOff className="size-3" />}
                      {row.visible ? "Publicado" : "Oculto"}
                    </button>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {busy && <Loader2 className="size-4 animate-spin text-terracota" />}
                      <Link
                        href={`/admin/productos/${row.id}`}
                        className="grid size-8 place-items-center border border-arena-osc text-tinta-suave transition-colors hover:border-terracota hover:text-terracota"
                        title="Editar"
                      >
                        <Pencil className="size-3.5" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => remove(row)}
                        disabled={busy}
                        className="grid size-8 place-items-center border border-arena-osc text-tinta-suave transition-colors hover:border-terracota hover:text-terracota disabled:opacity-60"
                        title="Eliminar"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
