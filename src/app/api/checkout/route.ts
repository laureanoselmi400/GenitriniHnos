import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createPreference, mpConfigured } from "@/lib/mercadopago";

export const dynamic = "force-dynamic";

function siteUrl(req: Request): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (env) return env.replace(/\/+$/, "");
  const origin = req.headers.get("origin");
  if (origin) return origin.replace(/\/+$/, "");
  return "http://localhost:3000";
}

function makeReference(): string {
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `GH-${Date.now().toString(36).toUpperCase()}${rand}`;
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as {
    items?: { id: number; qty: number }[];
    buyer?: { name?: string; email?: string; phone?: string; message?: string };
  } | null;

  if (!body?.items || !Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: "El carrito está vacío." }, { status: 400 });
  }
  if (body.items.length > 30) {
    return NextResponse.json({ error: "Demasiados artículos en el carrito." }, { status: 400 });
  }

  const name = (body.buyer?.name ?? "").trim();
  const email = (body.buyer?.email ?? "").trim();
  if (!name || !email) {
    return NextResponse.json(
      { error: "Completá tu nombre y email para generar la orden." },
      { status: 400 },
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "El email no es válido." }, { status: 400 });
  }

  const ids = [...new Set(body.items.map((i) => Number(i.id)))];
  const productos = await db.product.findMany({
    where: { id: { in: ids }, visible: true },
    include: { images: { orderBy: { position: "asc" }, take: 1 } },
  });

  const lineas: { title: string; price: number; qty: number; productId: number; image: string | null }[] = [];

  for (const requested of body.items) {
    const qty = Math.max(1, Math.min(20, Math.floor(Number(requested.qty) || 1)));
    const product = productos.find((p) => p.id === Number(requested.id));
    if (!product) {
      return NextResponse.json(
        { error: "Uno de los artículos del carrito ya no está disponible." },
        { status: 409 },
      );
    }
    if (product.stock < qty) {
      return NextResponse.json(
        { error: `Solo quedan ${product.stock} unidad(es) de “${product.title}”.` },
        { status: 409 },
      );
    }
    lineas.push({
      title: product.title,
      price: product.price,
      qty,
      productId: product.id,
      image: product.images[0]?.url ?? null,
    });
  }

  const total = lineas.reduce((acc, l) => acc + l.price * l.qty, 0);
  const reference = makeReference();
  const site = siteUrl(req);

  const order = await db.order.create({
    data: {
      reference,
      buyerName: name,
      buyerEmail: email,
      buyerPhone: (body.buyer?.phone ?? "").trim().slice(0, 40),
      buyerMessage: (body.buyer?.message ?? "").trim().slice(0, 1000),
      subtotal: total,
      total,
      items: {
        create: lineas.map((l) => ({
          productId: l.productId,
          title: l.title,
          price: l.price,
          qty: l.qty,
          image: l.image,
        })),
      },
    },
  });

  // Sin credenciales de Mercado Pago: modo demo, pedido aprobado para probar el flujo.
  if (!mpConfigured()) {
    await db.order.update({
      where: { id: order.id },
      data: { status: "approved", demo: true, paymentId: `DEMO-${reference}` },
    });
    const url = `${site}/checkout/resultado?external_reference=${order.id}&status=approved&demo=1`;
    return NextResponse.json({ url, demo: true, orderId: order.id });
  }

  try {
    const backBase = `${site}/checkout/resultado?external_reference=${order.id}`;
    const preference = await createPreference({
      items: lineas.map((l) => ({
        id: l.productId,
        title: l.title,
        quantity: l.qty,
        unit_price: l.price,
        currency_id: "ARS" as const,
        ...(l.image ? { picture_url: l.image.startsWith("http") ? l.image : `${site}${l.image}` } : {}),
      })),
      backUrls: { success: backBase, pending: backBase, failure: backBase },
      externalReference: order.id,
      notificationUrl: `${site}/api/mp/webhook`,
      payer: { name, email },
      statementDescriptor: "GENITRINI HNOS",
    });

    await db.order.update({
      where: { id: order.id },
      data: { preferenceId: preference?.id ?? null },
    });

    return NextResponse.json({ url: preference!.initPoint, demo: false, orderId: order.id });
  } catch (err) {
    console.error("Checkout: error al crear la preferencia", err);
    await db.order.update({ where: { id: order.id }, data: { status: "cancelled" } });
    return NextResponse.json(
      { error: "No se pudo iniciar el pago. Probá nuevamente en unos minutos." },
      { status: 502 },
    );
  }
}
