import { Suspense } from "react";
import Link from "next/link";
import { PackageSearch } from "lucide-react";
import Filters from "@/components/products/Filters";
import ProductGrid from "@/components/products/ProductGrid";
import { categoryLabel } from "@/lib/categories";
import { db } from "@/lib/db";
import { hasPrice } from "@/lib/types";
import type { ProductCardData } from "@/lib/types";

export type CatalogSearch = {
  q?: string;
  cat?: string;
  min?: string;
  max?: string;
  sort?: string;
  mat?: string;
  anchoMin?: string;
  anchoMax?: string;
  altoMin?: string;
  altoMax?: string;
  profMin?: string;
  profMax?: string;
};

function rangeField(min?: string, max?: string) {
  const range: Record<string, number> = {};
  if (min && !Number.isNaN(Number(min))) range.gte = Number(min);
  if (max && !Number.isNaN(Number(max))) range.lte = Number(max);
  return Object.keys(range).length ? range : null;
}

const KIND_INFO = {
  nuevo: {
    label: "Nuevos",
    eyebrow: "Catálogo nuevo",
    title: "Productos nuevos",
    intro: "Chapas, perfiles, hierro y materiales listos para usar o instalar.",
    empty:
      "No encontramos productos nuevos con esos filtros. Probá con otra palabra o limpiá los filtros.",
  },
  usado: {
    label: "Usados",
    eyebrow: "Catálogo usado",
    title: "Productos usados",
    intro: "Piezas únicas rescatadas, restauradas o en su estado original.",
    empty:
      "No encontramos piezas usadas con esos filtros. Probá con otra palabra o limpiá los filtros.",
  },
} as const;

export default async function CatalogView({
  kind,
  searchParams,
}: {
  kind: "nuevo" | "usado";
  searchParams: CatalogSearch;
}) {
  const {
    q = "",
    cat = "",
    min = "",
    max = "",
    sort = "",
    mat = "",
    anchoMin = "",
    anchoMax = "",
    altoMin = "",
    altoMax = "",
    profMin = "",
    profMax = "",
  } = searchParams;

  const price = rangeField(min, max);
  const width = rangeField(anchoMin, anchoMax);
  const height = rangeField(altoMin, altoMax);
  const depth = rangeField(profMin, profMax);

  const where = {
    visible: true,
    kind,
    ...(cat ? { category: cat } : {}),
    ...(mat ? { material: mat } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q } },
            { description: { contains: q } },
            { history: { contains: q } },
            { condition: { contains: q } },
            { material: { contains: q } },
          ],
        }
      : {}),
    ...(price ? { price } : {}),
    ...(width ? { width } : {}),
    ...(height ? { height } : {}),
    ...(depth ? { depth } : {}),
  };

  const orderMap: Record<string, Record<string, "asc" | "desc">> = {
    "precio-asc": { price: "asc" },
    "precio-desc": { price: "desc" },
    vistas: { views: "desc" },
    nuevos: { createdAt: "desc" },
    "": { featured: "desc" },
  };

  const [products, materialRows] = await Promise.all([
    db.product.findMany({
      where,
      orderBy: [orderMap[sort] ?? orderMap[""], { views: "desc" }],
      include: { images: { orderBy: { position: "asc" } } },
    }) as unknown as Promise<ProductCardData[]>,
    db.product.findMany({
      where: { visible: true, kind, material: { not: "" } },
      select: { material: true },
      distinct: ["material"],
    }),
  ]);

  const materials = Array.from(
    new Set(
      (materialRows as { material: string }[])
        .map((m) => m.material.trim().toLowerCase())
        .filter(Boolean),
    ),
  ).sort((a, b) => a.localeCompare(b, "es"));

  const total = products.length;
  const info = KIND_INFO[kind];
  const basePath = `/productos/${kind === "nuevo" ? "nuevos" : "usados"}`;
  const otherPath = `/productos/${kind === "nuevo" ? "usados" : "nuevos"}`;

  const resultLabel = cat ? categoryLabel(cat) : info.title;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <header className="mb-8 border-b border-arena pb-6">
        <nav className="mb-3 flex flex-wrap items-center gap-2 text-xs text-tinta-suave">
          <Link href="/" className="hover:text-terracota">
            Inicio
          </Link>
          <span>/</span>
          <Link href="/productos" className="hover:text-terracota">
            Productos
          </Link>
          <span>/</span>
          <span className="text-tinta">{info.label}</span>
        </nav>

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-[0.35em] text-terracota">
              {info.eyebrow}
            </span>
            <h1 className="mt-3 font-display text-4xl">{resultLabel}</h1>
            <p className="mt-2 max-w-2xl text-sm text-tinta-suave">
              {total} {total === 1 ? "resultado" : "resultados"} · {info.intro}
            </p>
          </div>

          <div className="inline-flex border border-arena-osc">
            <Link
              href="/productos/nuevos"
              className={`px-4 py-2 text-xs uppercase tracking-wider transition-colors ${
                kind === "nuevo"
                  ? "bg-terracota text-crema"
                  : "text-tinta hover:bg-crema-alt"
              }`}
            >
              Nuevos
            </Link>
            <Link
              href="/productos/usados"
              className={`px-4 py-2 text-xs uppercase tracking-wider transition-colors ${
                kind === "usado"
                  ? "bg-terracota text-crema"
                  : "text-tinta hover:bg-crema-alt"
              }`}
            >
              Usados
            </Link>
          </div>
        </div>

        <p className="mt-3 text-xs text-tinta-suave">
          ¿Buscás otra cosa?{" "}
          <Link href={otherPath} className="text-terracota underline">
            Ver catálogo de {kind === "nuevo" ? "usados" : "nuevos"}
          </Link>
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="lg:sticky lg:top-32 lg:self-start">
          <Suspense fallback={<div className="h-96 border border-arena" />}>
            <Filters
              basePath={basePath}
              q={q}
              cat={cat}
              min={min}
              max={max}
              sort={sort}
              mat={mat}
              anchoMin={anchoMin}
              anchoMax={anchoMax}
              altoMin={altoMin}
              altoMax={altoMax}
              profMin={profMin}
              profMax={profMax}
              materials={materials}
            />
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
            {mat && (
              <span className="border border-oliva px-3 py-1.5 text-xs capitalize text-oliva">
                {mat}
              </span>
            )}
            {q && (
              <span className="border border-arena px-3 py-1.5 text-xs text-tinta-suave">
                Búsqueda: “{q}”
              </span>
            )}
          </div>

          <ProductGrid products={products} showViews emptyMessage={info.empty} />
        </section>
      </div>
    </div>
  );
}
