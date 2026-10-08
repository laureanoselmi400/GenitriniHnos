import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import ContactForm from "@/components/contact/ContactForm";
import { OrnamentLine } from "@/components/ui/Ornament";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Escribinos por WhatsApp: coordinamos visitas al taller, envíos y consultas sobre piezas antiguas.",
};

export default async function ContactoPage() {
  const s = await getSettings();

  const datos = [
    {
      icon: MapPin,
      titulo: "Dirección",
      valor: s.address,
      href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.address)}`,
      cta: "Ver en el mapa",
    },
    {
      icon: Clock,
      titulo: "Horarios",
      valor: s.hours,
    },
    {
      icon: Phone,
      titulo: "Teléfono",
      valor: s.phone,
      href: `tel:${s.phone.replace(/[^+\d]/g, "")}`,
      cta: "Llamar",
    },
    {
      icon: Mail,
      titulo: "Email",
      valor: s.email,
      href: `mailto:${s.email}`,
      cta: "Escribir",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <header className="text-center">
        <span className="text-xs uppercase tracking-[0.4em] text-terracota">Contacto</span>
        <h1 className="mt-4 font-display text-4xl sm:text-5xl">
          Hablemos de la pieza que buscás
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-tinta-suave">
          Completá el formulario y se abre WhatsApp con el mensaje ya escrito. También
          podés llamarnos o acercarte al taller.
        </p>
        <OrnamentLine className="mx-auto mt-7 max-w-md" />
      </header>

      <div className="mt-12 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <ContactForm whatsapp={s.whatsapp} />

        <div className="space-y-4">
          {datos.map((d) => (
            <div key={d.titulo} className="border border-arena bg-crema p-5">
              <div className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center border border-arena-osc bg-crema-alt text-terracota">
                  <d.icon className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-tinta-suave">
                    {d.titulo}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-tinta">{d.valor}</p>
                  {d.href && (
                    <a
                      href={d.href}
                      target={d.href.startsWith("http") ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      className="mt-2 inline-block text-xs uppercase tracking-wider text-terracota hover:text-terracota-osc"
                    >
                      {d.cta} →
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}

          <div className="textura-lino border border-oliva bg-crema-alt p-5">
            <p className="font-display text-lg">¿Querés ver la pieza en vivo?</p>
            <p className="mt-1.5 text-sm leading-relaxed text-tinta-suave">
              Coordinamos visitas al taller de lunes a viernes. Si preferís, mandanos
              fotos de tu espacio y te asesoramos con medidas y transporte.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
