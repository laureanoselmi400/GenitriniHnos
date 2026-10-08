import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const ADMIN_COOKIE = "gh_admin_session";

function secret() {
  return unquote(process.env.SESSION_SECRET || "genitrini-hnos-dev-secret");
}

/** Next.js conserva las comillas de .env según la versión; las removemos. */
function unquote(value: string): string {
  return value.replace(/^["']|["']$/g, "");
}

function sign(payload: string) {
  const mac = createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${mac}`;
}

export function createSessionToken() {
  return sign("admin");
}

export function verifySessionToken(token?: string): boolean {
  if (!token || !token.includes(".")) return false;
  const [payload, mac] = token.split(".");
  if (payload !== "admin" || !mac) return false;
  const expected = createHmac("sha256", secret()).update(payload).digest("base64url");
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  return verifySessionToken(store.get(ADMIN_COOKIE)?.value);
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: (process.env.NEXT_PUBLIC_SITE_URL || "").startsWith("https"),
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };
}

/** Devuelve una respuesta 401 si no hay sesión de administrador. */
export async function requireAdmin(): Promise<NextResponse | null> {
  if (await isAdmin()) return null;
  return NextResponse.json({ error: "No autorizado" }, { status: 401 });
}

export function checkPassword(password: string): boolean {
  const expected = unquote(process.env.ADMIN_PASSWORD || "admin123");
  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
