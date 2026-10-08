import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const ALLOWED = ["pending", "approved", "rejected", "cancelled", "paid", "shipped"];

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const { id } = await params;
  const body = (await req.json().catch(() => null)) as { status?: string } | null;
  if (!body?.status || !ALLOWED.includes(body.status)) {
    return NextResponse.json({ error: "Estado inválido." }, { status: 400 });
  }

  const order = await db.order.update({
    where: { id },
    data: { status: body.status },
    include: { items: true },
  });

  return NextResponse.json({ order });
}
