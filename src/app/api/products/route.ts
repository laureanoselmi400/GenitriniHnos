import { existsSync, unlinkSync } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { deleteImage } from "@/lib/cloudinary";
import { isCategory } from "@/lib/categories";
import { slugify } from "@/lib/format";

export const dynamic = "force-dynamic";

type Payload = {
  title?: string;
  category?: string;
  kind?: string;
  price?: number | string;
  stock?: number | string;
  condition?: string;
  material?: string;
  width?: number | string | null;
  height?: number | string | null;
  depth?: number | string | null;
  description?: string;
  history?: string | null;
  featured?: boolean;
  visible?: boolean;
  images?: string[];
};

const KINDS = ["nuevo", "usado"];

function parseMeasure(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  if (Number.isNaN(n) || n < 0) return null;
  return Math.round(n * 100) / 100;
}

function parse(payload: Payload) {
  const title = (payload.title ?? "").trim();
  const description = (payload.description ?? "").trim();
  const category = payload.category ?? "";
  const kind = KINDS.includes(payload.kind ?? "") ? (payload.kind as string) : "usado";
  const price = Math.max(0, Number(payload.price ?? 0) || 0);
  const stock = Math.max(0, Math.floor(Number(payload.stock ?? 1) || 0));
  const condition = (payload.condition ?? "Usado – buen estado").trim();
  const material = (payload.material ?? "").trim().toLowerCase();
  const width = parseMeasure(payload.width);
  const height = parseMeasure(payload.height);
  const depth = parseMeasure(payload.depth);
  const history = (payload.history ?? "").trim();
  const images = Array.isArray(payload.images)
    ? payload.images.filter((u) => typeof u === "string" && u.startsWith("/"))
    : [];

  const errors: string[] = [];
  if (title.length < 3) errors.push("El título debe tener al menos 3 caracteres.");
  if (description.length < 10) errors.push("La descripción debe tener al menos 10 caracteres.");
  if (!isCategory(category)) errors.push("Elegí un rubro válido.");
  if (kind === "usado" && price <= 0)
    errors.push("Los productos usados deben tener un precio mayor a 0. Para publicar sin precio, marcalo como nuevo.");

  return {
    data: {
      title,
      category,
      kind,
      price,
      stock,
      condition,
      material,
      width,
      height,
      depth,
      description,
      history: history || null,
      featured: Boolean(payload.featured),
      visible: payload.visible === undefined ? true : Boolean(payload.visible),
      images,
    },
    errors,
  };
}

async function uniqueSlug(title: string): Promise<string> {
  const base = slugify(title) || "pieza";
  let candidate = base;
  let n = 1;
  while (await db.product.findUnique({ where: { slug: candidate } })) {
    n += 1;
    candidate = `${base}-${n}`;
  }
  return candidate;
}

async function deleteUploadFile(url: string) {
  if (url.includes("res.cloudinary.com")) {
    await deleteImage(url);
    return;
  }
  if (!url.startsWith("/uploads/")) return;
  const filePath = path.join(process.cwd(), "public", url.replace(/\//g, path.sep));
  if (existsSync(filePath)) {
    try {
      unlinkSync(filePath);
    } catch (err) {
      console.warn("No se pudo borrar la imagen", url, err);
    }
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  const limit = Math.min(
    30,
    Math.max(1, Math.floor(Number(url.searchParams.get("limit") ?? 20) || 20)),
  );

  if (q.length < 2) return NextResponse.json({ products: [] });

  const products = await db.product.findMany({
    where: {
      visible: true,
      OR: [
        { title: { contains: q } },
        { description: { contains: q } },
        { material: { contains: q } },
      ],
    },
    orderBy: [{ featured: "desc" }, { views: "desc" }],
    take: limit,
    select: {
      id: true,
      title: true,
      slug: true,
      kind: true,
      price: true,
      material: true,
      width: true,
      height: true,
      depth: true,
      images: {
        select: { url: true },
        orderBy: { position: "asc" },
        take: 1,
      },
    },
  });

  return NextResponse.json({
    products: products.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      kind: p.kind,
      price: p.price,
      material: p.material,
      width: p.width,
      height: p.height,
      depth: p.depth,
      image: p.images[0]?.url ?? null,
    })),
  });
}

export async function POST(req: Request) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const payload = (await req.json().catch(() => null)) as Payload | null;
  if (!payload) return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });

  const { data, errors } = parse(payload);
  if (errors.length) return NextResponse.json({ error: errors[0] }, { status: 400 });

  const slug = await uniqueSlug(data.title);

  const product = await db.product.create({
    data: {
      title: data.title,
      slug,
      category: data.category,
      kind: data.kind,
      price: data.price,
      stock: data.stock,
      condition: data.condition,
      material: data.material,
      width: data.width,
      height: data.height,
      depth: data.depth,
      description: data.description,
      history: data.history,
      featured: data.featured,
      visible: data.visible,
      images: {
        create: data.images.map((url, i) => ({
          url,
          position: i,
          alt: `${data.title} ${i + 1}`,
        })),
      },
    },
    include: { images: true },
  });

  return NextResponse.json({ product }, { status: 201 });
}

export async function PATCH(req: Request) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const payload = (await req.json().catch(() => null)) as (Payload & { id?: number }) | null;
  if (!payload?.id) return NextResponse.json({ error: "Falta el id." }, { status: 400 });

  const existing = await db.product.findUnique({
    where: { id: Number(payload.id) },
    include: { images: true },
  });
  if (!existing) return NextResponse.json({ error: "No existe." }, { status: 404 });

  // Se completa con los valores actuales para permitir actualizaciones parciales
  const merged: Payload = {
    title: payload.title ?? existing.title,
    category: payload.category ?? existing.category,
    kind: payload.kind ?? existing.kind,
    price: payload.price ?? existing.price,
    stock: payload.stock ?? existing.stock,
    condition: payload.condition ?? existing.condition,
    material: payload.material ?? existing.material,
    width: payload.width ?? existing.width,
    height: payload.height ?? existing.height,
    depth: payload.depth ?? existing.depth,
    description: payload.description ?? existing.description,
    history: payload.history ?? existing.history ?? undefined,
    featured: payload.featured ?? existing.featured,
    visible: payload.visible ?? existing.visible,
    images: payload.images ?? existing.images.map((i) => i.url),
  };

  const { data, errors } = parse(merged);
  if (errors.length) return NextResponse.json({ error: errors[0] }, { status: 400 });

  const keptUrls = new Set(data.images);
  const previous = existing;

  const product = await db.$transaction(async (tx) => {
    await tx.image.deleteMany({ where: { productId: existing.id } });
    return tx.product.update({
      where: { id: existing.id },
      data: {
        title: data.title,
        category: data.category,
        kind: data.kind,
        price: data.price,
        stock: data.stock,
        condition: data.condition,
        material: data.material,
        width: data.width,
        height: data.height,
        depth: data.depth,
        description: data.description,
        history: data.history,
        featured: data.featured,
        visible: data.visible,
        images: {
          create: data.images.map((url, i) => ({
            url,
            position: i,
            alt: `${data.title} ${i + 1}`,
          })),
        },
      },
      include: { images: { orderBy: { position: "asc" } } },
    });
  });

  for (const img of previous?.images ?? []) {
    if (!keptUrls.has(img.url)) await deleteUploadFile(img.url);
  }

  return NextResponse.json({ product });
}

export async function DELETE(req: Request) {
  const guard = await requireAdmin();
  if (guard) return guard;

  const url = new URL(req.url);
  const id = Number(url.searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "Falta el id." }, { status: 400 });

  const existing = await db.product.findUnique({
    where: { id },
    include: { images: true },
  });
  if (!existing) return NextResponse.json({ error: "No existe." }, { status: 404 });

  await db.product.delete({ where: { id } });

  for (const img of existing.images) await deleteUploadFile(img.url);

  return NextResponse.json({ ok: true });
}
