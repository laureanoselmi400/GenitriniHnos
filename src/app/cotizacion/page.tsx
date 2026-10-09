import type { Metadata } from "next";
import QuoteView from "@/components/quote/QuoteView";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pedido de cotización",
  description:
    "Armá tu pedido de cotización con los artículos que te interesan, indicá medidas y cantidades, y enviánoslo por WhatsApp.",
};

export default async function CotizacionPage() {
  const s = await getSettings();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <header className="mb-8 border-b border-arena pb-6">
        <span className="text-xs uppercase tracking-[0.35em] text-terracota">
          Orden de pedido
        </span>
        <h1 className="mt-3 font-display text-4xl">Pedido de cotización</h1>
        <p className="mt-2 max-w-2xl text-sm text-tinta-suave">
          Agregá los artículos que te interesan (con o sin precio), indicá medidas y
          cantidades, y te enviamos el presupuesto por WhatsApp.
        </p>
      </header>

      <QuoteView whatsapp={s.whatsapp} />
    </div>
  );
}
