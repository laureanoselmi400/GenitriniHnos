import AdminOrdersTable from "@/components/admin/AdminOrdersTable";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminPedidosPage() {
  const orders = await db.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { items: true },
  });

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-3xl">Pedidos</h1>
        <p className="mt-1 text-sm text-tinta-suave">
          {orders.length} pedidos registrados. Cambiá el estado cuando entregues o
          cobres una venta.
        </p>
      </header>

      <AdminOrdersTable
        orders={orders.map((o) => ({
          id: o.id,
          reference: o.reference,
          buyerName: o.buyerName,
          buyerEmail: o.buyerEmail,
          buyerPhone: o.buyerPhone,
          status: o.status,
          total: o.total,
          demo: o.demo,
          createdAt: o.createdAt.toISOString(),
          items: o.items.map((i) => ({ title: i.title, qty: i.qty, price: i.price })),
        }))}
      />
    </div>
  );
}
