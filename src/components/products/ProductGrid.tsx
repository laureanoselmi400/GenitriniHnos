import ProductCard from "@/components/products/ProductCard";
import type { ProductCardData } from "@/lib/types";

export default function ProductGrid({
  products,
  showViews = false,
  emptyMessage = "No encontramos artículos con esos filtros. Probá ampliando la búsqueda.",
}: {
  products: ProductCardData[];
  showViews?: boolean;
  emptyMessage?: string;
}) {
  if (products.length === 0) {
    return (
      <div className="border border-dashed border-arena-osc bg-crema-alt px-6 py-16 text-center">
        <p className="font-display text-xl text-tinta">Sin resultados</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-tinta-suave">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} showViews={showViews} />
      ))}
    </div>
  );
}
