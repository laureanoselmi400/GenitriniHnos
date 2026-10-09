import type { Metadata } from "next";
import CatalogView, { type CatalogSearch } from "@/components/products/CatalogView";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Productos nuevos",
  description:
    "Chapas acanaladas, perfiles, hierro y materiales nuevos. Filtrá por rubro, material, medidas o precio.",
};

export default async function ProductosNuevosPage({
  searchParams,
}: {
  searchParams: Promise<CatalogSearch>;
}) {
  const params = await searchParams;
  return <CatalogView kind="nuevo" searchParams={params} />;
}
