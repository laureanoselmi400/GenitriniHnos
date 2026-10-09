import { notFound } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function EditarProductoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await db.product.findUnique({
    where: { id: Number(id) },
    include: { images: { orderBy: { position: "asc" } } },
  });

  if (!product) notFound();

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-3xl">Editar producto</h1>
        <p className="mt-1 text-sm text-tinta-suave">{product.title}</p>
      </header>

      <ProductForm
        initial={{
          id: product.id,
          title: product.title,
          category: product.category,
          kind: product.kind,
          price: product.price,
          stock: product.stock,
          condition: product.condition,
          material: product.material,
          width: product.width ?? "",
          height: product.height ?? "",
          depth: product.depth ?? "",
          description: product.description,
          history: product.history ?? "",
          featured: product.featured,
          visible: product.visible,
          images: product.images.map((i) => i.url),
        }}
      />
    </div>
  );
}
