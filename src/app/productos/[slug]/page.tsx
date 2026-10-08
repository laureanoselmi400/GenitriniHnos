import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, Eye, Package, ShieldCheck } from "lucide-react";
import Gallery from "@/components/products/Gallery";
import ProductGrid from "@/components/products/ProductGrid";
import ProductPurchase from "@/components/products/ProductPurchase";
import { OrnamentLine } from "@/components/ui/Ornament";
import { categoryLabel } from "@/lib/categories";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import type { ProductCardData } from "@/lib/types";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const product = await db.product.findUnique({ where: { slug } });
  if (!product) return { title: "Producto no encontrado" };
  return {
    title: product.title,
    description: product.description.slice(0, 155),
  };
}

export default async function ProductoDetallePage({ params }: Params) {
  const { slug } = await params;

  const product = await db.product.findUnique({
    where: { slug },
    include: { images: { orderBy: { position: "asc" } } },
  });

  if (!product || !product.visible) notFound();

  await db.product.update({ where: { id: product.id }, data: { views: { increment: 1 } } });

  const relacionados = (await db.product.findMany({
    where: { visible: true, category: product.category, id: { not: product.id } },
    orderBy: { views: "desc" },
    take: 3,
    include: { images: { orderBy: { position: "asc" } } },
  })) as unknown as ProductCardData[];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs text-tinta-suave">
        <Link href="/" className="hover:text-terracota">
          Inicio
        </Link>
        <span>/</span>
        <Link href="/productos" className="hover:text-terracota">
          Productos
        </Link>
        <span>/</span>
        <Link href={`/productos?cat=${product.category}`} className="hover:text-terracota">
          {categoryLabel(product.category)}
        </Link>
        <span>/</span>
        <span className="text-tinta">{product.title}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <Gallery
          images={product.images.map((i) => ({ url: i.url, alt: i.alt }))}
          title={product.title}
        />

        <div>
          <span className="text-xs uppercase tracking-[0.3em] text-terracota">
            {categoryLabel(product.category)}
          </span>
          <h1 className="mt-3 font-display text-3xl leading-tight sm:text-4xl">
            {product.title}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-tinta-suave">
            <span className="inline-flex items-center gap-1.5">
              <Eye className="size-3.5" /> {product.views} vistas
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Package className="size-3.5" />
              {product.stock > 0 ? `Stock: ${product.stock}` : "Sin stock"}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="size-3.5" /> {product.condition}
            </span>
          </div>

          <p className="mt-6 font-display text-4xl text-terracota">
            {formatPrice(product.price)}
          </p>
          <p className="mt-1 text-xs text-tinta-suave">
            Precio final. Coordinamos entrega o envío a todo el país.
          </p>

          <div className="mt-6">
            <ProductPurchase
              product={{
                id: product.id,
                title: product.title,
                slug: product.slug,
                price: product.price,
                image: product.images[0]?.url ?? null,
                stock: product.stock,
              }}
            />
          </div>

          <OrnamentLine className="my-7" />

          <h2 className="font-display text-xl">Descripción</h2>
          <p className="mt-2 whitespace-pre-line text-[15px] leading-relaxed text-tinta">
            {product.description}
          </p>

          {product.history && (
            <>
              <h2 className="mt-7 font-display text-xl">Historia de la pieza</h2>
              <div className="mt-2 border-l-2 border-terracota bg-crema-alt p-4 text-[15px] leading-relaxed text-tinta">
                {product.history}
              </div>
            </>
          )}

          <ul className="mt-6 space-y-2 text-sm text-tinta-suave">
            <li className="flex items-start gap-2">
              <Check className="mt-0.5 size-4 shrink-0 text-oliva" /> Pieza única,
              artículo igual al de la foto
            </li>
            <li className="flex items-start gap-2">
              <Check className="mt-0.5 size-4 shrink-0 text-oliva" /> Pagos seguros con
              Mercado Pago (tarjetas, transferencia o efectivo)
            </li>
            <li className="flex items-start gap-2">
              <Check className="mt-0.5 size-4 shrink-0 text-oliva" /> Retiro en showroom
              o envío coordinado
            </li>
          </ul>

          <Link
            href="/productos"
            className="mt-7 inline-flex items-center gap-2 text-xs uppercase tracking-wider text-terracota hover:text-terracota-osc"
          >
            <ArrowLeft className="size-3.5" /> Volver al catálogo
          </Link>
        </div>
      </div>

      {relacionados.length > 0 && (
        <section className="mt-16 border-t border-arena pt-10">
          <h2 className="font-display text-2xl">También puede interesarte</h2>
          <div className="mt-6">
            <ProductGrid products={relacionados} />
          </div>
        </section>
      )}
    </div>
  );
}
