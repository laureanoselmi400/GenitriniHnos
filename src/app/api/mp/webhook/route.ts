import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getPayment, mapMpStatus } from "@/lib/mercadopago";

export const dynamic = "force-dynamic";

/**
 * Webhook (IPN) de Mercado Pago.
 * Recibe notificaciones de pago y actualiza el estado del pedido.
 */
export async function POST(req: Request) {
  const url = new URL(req.url);
  const topic = url.searchParams.get("type") ?? url.searchParams.get("topic");
  const paymentId = url.searchParams.get("data.id") ?? url.searchParams.get("id");

  try {
    if ((topic === "payment" || topic === "payment_notification") && paymentId) {
      const payment = await getPayment(paymentId);
      if (payment?.externalReference) {
        await db.order.updateMany({
          where: { id: payment.externalReference },
          data: { status: mapMpStatus(payment.status), paymentId },
        });
      }
    } else {
      // Notificación sin identificador: leemos el body (webhooks v2)
      const body = await req.json().catch(() => null);
      const id = body?.data?.id ?? body?.id;
      const type = body?.type ?? body?.topic;
      if (type === "payment" && id) {
        const payment = await getPayment(String(id));
        if (payment?.externalReference) {
          await db.order.updateMany({
            where: { id: payment.externalReference },
            data: { status: mapMpStatus(payment.status), paymentId: String(id) },
          });
        }
      }
    }
  } catch (err) {
    console.error("Webhook MP:", err);
  }

  return NextResponse.json({ received: true });
}

export async function GET(req: Request) {
  return POST(req);
}
