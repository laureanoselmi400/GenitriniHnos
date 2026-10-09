import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

type ItemPayload = {
  productId?: number | null;
  title?: string;
  qty?: number | string;
  width?: string;
  height?: string;
  depth?: string;
  material?: string;
  note?: string;
};

type Payload = {
  buyerName?: string;
  buyerPhone?: string;
  buyerEmail?: string;
  message?: string;
  items?: ItemPayload[];
};

async function uniqueReference(): Promise<string> {
  const year = new Date().getFullYear();
  let candidate = "";
  do {
    candidate = `COT-${year}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
  } while (await db.quote.findUnique({ where: { reference: candidate } }));
  return candidate;
}

function clean(value?: string, max = 400): string {
  return (value ?? "").trim().slice(0, max);
}

export async function POST(req: Request) {
  const payload = (await req.json().catch(() => null)) as Payload | null;
  if (!payload) return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });

  const buyerName = clean(payload.buyerName, 120);
  const buyerPhone = clean(payload.buyerPhone, 60);
  const buyerEmail = clean(payload.buyerEmail, 160);
  const message = clean(payload.message, 2000);

  const items = Array.isArray(payload.items) ? payload.items : [];
  const parsed = items
    .map((i) => ({
      productId:
        i.productId === null || i.productId === undefined ? null : Number(i.productId),
      title: clean(i.title, 160),
      qty: Math.max(1, Math.floor(Number(i.qty ?? 1) || 1)),
      width: clean(i.width, 40),
      height: clean(i.height, 40),
      depth: clean(i.depth, 40),
      material: clean(i.material, 80),
      note: clean(i.note, 500),
    }))
    .filter((i) => i.title.length >= 2);

  const errors: string[] = [];
  if (buyerName.length < 2) errors.push("Ingresá tu nombre.");
  if (parsed.length === 0) errors.push("Agregá al menos un artículo al pedido.");
  if (errors.length) return NextResponse.json({ error: errors[0] }, { status: 400 });

  const validIds = new Set(
    (
      await db.product.findMany({
        where: { id: { in: parsed.map((i) => i.productId).filter((v): v is number => !!v) } },
        select: { id: true },
      })
    ).map((p) => p.id),
  );

  const quote = await db.quote.create({
    data: {
      reference: await uniqueReference(),
      buyerName,
      buyerPhone,
      buyerEmail,
      message,
      items: {
        create: parsed.map((i) => ({
          productId: i.productId && validIds.has(i.productId) ? i.productId : null,
          title: i.title,
          qty: i.qty,
          width: i.width,
          height: i.height,
          depth: i.depth,
          material: i.material,
          note: i.note,
        })),
      },
    },
    include: { items: true },
  });

  return NextResponse.json({ quote }, { status: 201 });
}
