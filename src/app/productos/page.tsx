import type { Metadata } from "next";
import { Suspense } from "react";
import { PackageSearch } from "lucide-react";
import Filters from "@/components/products/Filters";
import ProductGrid from "@/components/products/ProductGrid";
import { categoryLabel } from "@/lib/categories";
import { db } from "@/lib/db";
import type { ProductCardData } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Productos",
  description:
    "Catálogo completo de aberturas antiguas, farolas, cencerros y piezas de estancia. Filtrá por rubro, precio o palabra clave.",
};

type Search = {
  q?: string;
  cat?: string;
  min?: string;
  max?: string;
  sort?: string;
};

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const { q = "", cat = "", min = "", max = "", sort = "" } = await searchParams;

  const price: Record<string, number> = {};
  if (min && !Number.isNaN(Number(min))) price.gte = Number(min);
  if (max && !Number.isNaN(Number(max))) price.lte = Number(max);

  const where = {
    visible: true,
    ...(cat ? { category: cat } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q } },
            { description: { contains: q } },
            { history: { contains: q } },
            { condition: { contains: q } },
          ],
        }
      : {}),
    ...(Object.keys(price).length ? { price } : {}),
  };

  const orderMap: Record<string, Record<string, "asc" | "desc">> = {
    "precio-asc": { price: "asc" },
    "precio-desc": { price: "desc" },
    vistas: { views: "desc" },
    nuevos: { createdAt: "desc" },
    "": { featured: "desc" },
  };

  const products = (await db.product.findMany({
    where,
    orderBy: [orderMap[sort] ?? orderMap[""], { views: "desc" }],
    include: { images: { orderBy: { position: "asc" } } },
  })) as unknown as ProductCardData[];

  const total = products.length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <header className="mb-8 border-b border-arena pb-6">
        <span className="text-xs uppercase tracking-[0.35em] text-terracota">
          Catálogo completo
        </span>
        <h1 className="mt-3 font-display text-4xl">
          {cat ? categoryLabel(cat) : "Nuestros productos"}
        </h1>
        <p className="mt-2 text-sm text-tinta-suave">
          {total} {total === 1 ? "pieza disponible" : "piezas disponibles"} · Filtrá por
          palabra clave, rubro, precio u orden.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="lg:sticky lg:top-32 lg:self-start">
          <Suspense fallback={<div className="h-96 border border-arena" />}>
            <Filters q={q} cat={cat} min={min} max={max} sort={sort} />
          </Suspense>
        </aside>

        <section>
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 border border-arena bg-crema-alt px-3 py-1.5 text-xs uppercase tracking-wider text-tinta-suave">
              <PackageSearch className="size-3.5" />
              {total} resultados
            </span>
            {cat && (
              <span className="border border-terracota bg-terracota px-3 py-1.5 text-xs uppercase tracking-wider text-crema">
                {categoryLabel(cat)}
              </span>
            )}
            {q && (
              <span className="border border-arena px-3 py-1.5 text-xs text-tinta-suave">
                Búsqueda: “{q}”
              </span>
            )}
          </div>

          <ProductGrid
            products={products}
            showViews
            emptyMessage="No encontramos artículos con esos filtros. Probá con otra palabra o limpiá los filtros para ver todo el catálogo."
          />
        </section>
      </div>
    </div>
  );
}
