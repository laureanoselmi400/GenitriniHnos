import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PUT(req: Request) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  }

  for (const [key, value] of Object.entries(body)) {
    if (typeof value !== "string" || !key) continue;
    await db.setting.upsert({
      where: { key },
      update: { value: value.slice(0, 500) },
      create: { key, value: value.slice(0, 500) },
    });
  }

  const rows = await db.setting.findMany();
  return NextResponse.json({ settings: Object.fromEntries(rows.map((r) => [r.key, r.value])) });
}
