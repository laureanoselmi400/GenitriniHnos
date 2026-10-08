import { cache } from "react";
import { db } from "@/lib/db";

export const DEFAULT_SETTINGS: Record<string, string> = {
  site_name: "Genitrini Hnos.",
  slogan: "Rescatamos historias, conservamos oficios",
  address: "Av. Arturo Illia 1751 – PErgamino, Buenos Aires",
  hours: "Lunes a Viernes de 9 a 12 y de 15 a 18 – Sábados de 9 a 13",
  phone: "+549 2477 42-9537/42-9539",
  email: "contacto@genitrinihnos.com.ar",
  whatsapp: "5492477698740",
  footer_note:
    "Piezas rescatadas de demoliciones y remates de estancia. Cada artículo es único: lo que ves publicado, está disponible.",
};

export const getSettings = cache(async (): Promise<Record<string, string>> => {
  try {
    const rows = await db.setting.findMany();
    const map: Record<string, string> = { ...DEFAULT_SETTINGS };
    for (const row of rows) map[row.key] = row.value;
    return map;
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
});

export async function getSetting(key: string): Promise<string> {
  const all = await getSettings();
  return all[key] ?? DEFAULT_SETTINGS[key] ?? "";
}
