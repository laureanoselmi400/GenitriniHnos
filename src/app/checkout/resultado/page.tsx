import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, MessageCircle, PackageCheck } from "lucide-react";
import { db } from "@/lib/db";
import { getPayment, mapMpStatus, mpConfigured, orderStatusLabel } from "@/lib/mercadopago";
import { formatPrice } from "@/lib/format";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Resultado del pedido" };

type Search = {
  external_reference?: string;
  status?: string;
  collection_status?: string;
  payment_id?: string;
  collection_id?: string;
  demo?: string;
};

export default async function ResultadoPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const sp = await searchParams;
  const settings = await getSettings();
  const referenceId = sp.external_reference;

  let order = referenceId
    ? await db.order.findUnique({ where: { id: referenceId }, include: { items: true } })
    : null;

  if (order) {
    const incoming = sp.status || sp.collection_status || "pending";

    if (order.demo) {
      // Modo demo: el estado viene en la URL que genera /api/checkout
      if (incoming === "approved" && order.status !== "approved") {
        order = await db.order.update({
          where: { id: order.id },
          data: { status: "approved" },
          include: { items: true },
        });
      }
    } else if (mpConfigured()) {
      const paymentId = sp.payment_id || sp.collection_id;
      let status: string | null = null;
      if (paymentId && paymentId !== "null") {
        const payment = await getPaymentSafe(paymentId);
        status = payment;
      }
      const finalStatus = status ?? mapFromIncoming(incoming);
      if (finalStatus !== order.status) {
        order = await db.order.update({
          where: { id: order.id },
          data: { status: finalStatus, ...(paymentId ? { paymentId } : {}) },
          include: { items: true },
        });
      }
    }
  }

  const estado = order ? orderStatusLabel(order.status) : "No encontrada";
  const aprobado = order?.status === "approved";
  const rechazado = order?.status === "rejected";

  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <div className="border border-arena bg-crema p-6 sombra-rustica sm:p-10">
        {!order ? (
          <>
            <h1 className="font-display text-3xl">No encontramos el pedido</h1>
            <p className="mt-3 text-sm text-tinta-suave">
              El enlace no corresponde a una orden vigente. Si realizaste un pago,
              escribinos por WhatsApp y lo verificamos.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/productos"
                className="inline-flex items-center gap-2 bg-terracota px-5 py-3 text-sm uppercase tracking-wider text-crema hover:bg-terracota-osc"
              >
                Volver al catálogo <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/contacto"
                className="inline-flex items-center gap-2 border border-oliva px-5 py-3 text-sm uppercase tracking-wider text-oliva hover:bg-oliva hover:text-crema"
              >
                Contacto
              </Link>
            </div>
          </>
        ) : (
          <>
            <span
              className={`inline-block px-3 py-1 text-xs uppercase tracking-wider ${
                aprobado
                  ? "bg-oliva text-crema"
                  : rechazado
                    ? "bg-terracota text-crema"
                    : "bg-arena text-tinta"
              }`}
            >
              {estado}
            </span>

            <h1 className="mt-4 font-display text-3xl sm:text-4xl">
              {aprobado
                ? "¡Gracias por tu compra!"
                : rechazado
                  ? "El pago no se pudo procesar"
                  : "Estamos esperando el pago"}
            </h1>

            <p className="mt-3 text-[15px] leading-relaxed text-tinta-suave">
              {aprobado
                ? order.demo
                  ? "Este pedido fue generado en modo demostración (sin cobro real). En cuanto actives tus credenciales de Mercado Pago, el flujo cobra por el importe real."
                  : "Recibimos tu pago. Te vamos a contactar por email para coordinar el retiro o el envío de las piezas."
                : rechazado
                  ? "El pago fue rechazado. Podés intentarlo nuevamente desde el carrito o escribirnos para coordinar otra forma de pago."
                  : "En cuanto se acredite el pago vas a recibir la confirmación por email."}
            </p>

            <dl className="mt-6 grid gap-3 border-y border-arena py-5 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-xs uppercase tracking-wider text-tinta-suave">
                  Referencia
                </dt>
                <dd className="mt-1 font-semibold">{order.reference}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-tinta-suave">
                  Comprador
                </dt>
                <dd className="mt-1">{order.buyerName}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-tinta-suave">Total</dt>
                <dd className="mt-1 font-display text-lg text-terracota">
                  {formatPrice(order.total)}
                </dd>
              </div>
            </dl>

            <ul className="mt-5 space-y-2">
              {order.items.map((i) => (
                <li
                  key={i.id}
                  className="flex items-center justify-between gap-4 text-sm"
                >
                  <span className="flex items-center gap-2">
                    <PackageCheck className="size-4 shrink-0 text-oliva" />
                    {i.title} <span className="text-tinta-suave">× {i.qty}</span>
                  </span>
                  <span>{formatPrice(i.price * i.qty)}</span>
                </li>
              ))}
            </ul>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/productos"
                className="inline-flex items-center gap-2 bg-terracota px-5 py-3 text-sm uppercase tracking-wider text-crema hover:bg-terracota-osc"
              >
                Seguir comprando <ArrowRight className="size-4" />
              </Link>
              <a
                href={`https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(
                  `Hola, hice el pedido ${order.reference} desde el sitio.`,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-whatsapp px-5 py-3 text-sm uppercase tracking-wider text-whatsapp hover:bg-whatsapp hover:text-white"
              >
                <MessageCircle className="size-4" /> Consultar por WhatsApp
              </a>
            </div>

            <p className="mt-5 flex items-center gap-2 text-xs text-tinta-suave">
              <Clock className="size-3.5" /> Guardá esta referencia: {order.reference}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

async function getPaymentSafe(paymentId: string): Promise<string | null> {
  try {
    const payment = await getPayment(paymentId);
    if (!payment) return null;
    return mapMpStatus(payment.status);
  } catch {
    return null;
  }
}

function mapFromIncoming(status: string): string {
  if (status === "approved") return "approved";
  if (status === "rejected" || status === "cancelled") return "rejected";
  if (status === "pending" || status === "in_process") return "pending";
  return "pending";
}
