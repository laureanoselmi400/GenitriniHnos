import Link from "next/link";
import { Eye, Star } from "lucide-react";
import AddToCartButton from "@/components/products/AddToCartButton";
import { categoryLabel } from "@/lib/categories";
import { formatPrice } from "@/lib/format";
import type { ProductCardData } from "@/lib/types";

export default function ProductCard({
  product,
  showViews = false,
}: {
  product: ProductCardData;
  showViews?: boolean;
}) {
  const image = product.images[0]?.url;
  const agotado = product.stock <= 0;

  return (
    <article className="group flex flex-col overflow-hidden border border-arena bg-crema sombra-rustica transition-transform duration-300 hover:-translate-y-1">
      <Link
        href={`/productos/${product.slug}`}
        className="relative block aspect-[4/3] overflow-hidden bg-crema-alt"
      >
        {image ? (
          <img
            src={image}
            alt={product.images[0]?.alt || product.title}
            width={800}
            height={600}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-xs uppercase tracking-widest text-tinta-suave">
            Sin foto
          </div>
        )}

        <div className="absolute left-0 top-0 flex flex-col gap-1 p-2">
          {product.featured && (
            <span className="inline-flex items-center gap-1 bg-terracota px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-crema">
              <Star className="size-3" /> Destacado
            </span>
          )}
          {agotado && (
            <span className="bg-tinta px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-crema">
              Agotado
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-terracota">
          {categoryLabel(product.category)}
        </span>

        <h3 className="mt-1.5 font-display text-lg leading-snug">
          <Link href={`/productos/${product.slug}`} className="hover:text-terracota">
            {product.title}
          </Link>
        </h3>

        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-tinta-suave">
          {product.description}
        </p>

        {showViews && (
          <span className="mt-2 inline-flex items-center gap-1 text-[11px] text-tinta-suave/80">
            <Eye className="size-3" /> {product.views} vistas
          </span>
        )}

        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <span className="font-display text-xl text-terracota">
            {formatPrice(product.price)}
          </span>
          <AddToCartButton
            compact
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
      </div>
    </article>
  );
}
