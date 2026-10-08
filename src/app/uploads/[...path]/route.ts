import { readFile, stat } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
};

/**
 * Next.js no sirve archivos agregados a /public después del arranque,
 * así que las fotos subidas desde el panel se sirven desde este route.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: parts } = await params;
  if (!parts?.length || parts.some((p) => p.includes("..") || p.includes("/") || p.includes("\\"))) {
    return new NextResponse("No encontrado", { status: 404 });
  }

  const filePath = path.join(process.cwd(), "public", "uploads", ...parts);

  try {
    const info = await stat(filePath);
    if (!info.isFile()) return new NextResponse("No encontrado", { status: 404 });
    const data = await readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": MIME[ext] ?? "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("No encontrado", { status: 404 });
  }
}
