import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { signUpload } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

export async function GET() {
  const guard = await requireAdmin();
  if (guard) return guard;

  const signature = signUpload();
  if (!signature) return NextResponse.json({ configured: false });

  return NextResponse.json({ configured: true, ...signature });
}
