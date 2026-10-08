import ProductForm from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

export default function NuevoProductoPage() {
  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-3xl">Nuevo producto</h1>
        <p className="mt-1 text-sm text-tinta-suave">
          Cargá la pieza con sus fotos, precio y historia.
        </p>
      </header>
      <ProductForm />
    </div>
  );
}
