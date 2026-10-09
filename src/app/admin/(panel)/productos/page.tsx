import Link from "next/link";
import { Plus } from "lucide-react";
import AdminProductsTable from "@/components/admin/AdminProductsTable";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminProductosPage() {
  const products = await db.product.findMany({
    orderBy: [{ featured: "desc" }, { updatedAt: "desc" }],
    include: { images: { orderBy: { position: "asc" } } },
  });

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Productos</h1>
          <p className="mt-1 text-sm text-tinta-suave">
            {products.length} artículos en la base. Editá, ocultá o eliminá desde la
            tabla.
          </p>
        </div>
        <Link
          href="/admin/productos/nuevo"
          className="inline-flex items-center gap-2 bg-terracota px-4 py-2.5 text-xs uppercase tracking-wider text-crema transition-colors hover:bg-terracota-osc"
        >
          <Plus className="size-4" /> Nuevo producto
        </Link>
      </header>

      <div className="mt-6">
        <AdminProductsTable
          products={products.map((p) => ({
            id: p.id,
            title: p.title,
            slug: p.slug,
            category: p.category,
            kind: p.kind,
            price: p.price,
            stock: p.stock,
            featured: p.featured,
            visible: p.visible,
            views: p.views,
            image: p.images[0]?.url ?? null,
            images: p.images.map((i) => ({ url: i.url, alt: i.alt })),
          }))}
        />
      </div>
    </div>
  );
}
