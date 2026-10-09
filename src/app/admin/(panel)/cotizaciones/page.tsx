import AdminQuotesTable from "@/components/admin/AdminQuotesTable";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminCotizacionesPage() {
  const quotes = await db.quote.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { items: true },
  });

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-3xl">Pedidos de cotización</h1>
        <p className="mt-1 text-sm text-tinta-suave">
          {quotes.length} pedidos recibidos. Revisá los artículos, medidas y datos de
          contacto, y cambiá el estado a medida que los respondés.
        </p>
      </header>

      <AdminQuotesTable
        quotes={quotes.map((q) => ({
          id: q.id,
          reference: q.reference,
          buyerName: q.buyerName,
          buyerPhone: q.buyerPhone,
          buyerEmail: q.buyerEmail,
          message: q.message,
          status: q.status,
          createdAt: q.createdAt.toISOString(),
          items: q.items.map((i) => ({
            title: i.title,
            qty: i.qty,
            width: i.width,
            height: i.height,
            depth: i.depth,
            material: i.material,
            note: i.note,
          })),
        }))}
      />
    </div>
  );
}
