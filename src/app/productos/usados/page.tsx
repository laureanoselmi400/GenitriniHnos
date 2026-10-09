import type { Metadata } from "next";
import CatalogView, { type CatalogSearch } from "@/components/products/CatalogView";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Productos usados",
  description:
    "Aberturas antiguas, farolas, cencerros y piezas de estancia rescatadas y restauradas. Filtrá por rubro, material, medidas o precio.",
};

export default async function ProductosUsadosPage({
  searchParams,
}: {
  searchParams: Promise<CatalogSearch>;
}) {
  const params = await searchParams;
  return <CatalogView kind="usado" searchParams={params} />;
}
