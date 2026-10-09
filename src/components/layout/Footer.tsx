import Link from "next/link";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { getSettings } from "@/lib/settings";
import { CATEGORIES, categoryHref } from "@/lib/categories";

export default async function Footer() {
  const s = await getSettings();

  return (
    <footer className="mt-20 border-t-2 border-terracota bg-oliva text-crema">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-4">
        <div className="md:col-span-1">
          <p className="font-display text-2xl">
            Genitrini <span className="text-arena">Hnos.</span>
          </p>
          <p className="mt-3 text-sm leading-relaxed text-crema/80">
            {s.footer_note}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-arena">
            Dónde estamos
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-crema/85">
            <li className="flex gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-arena" />
              <span>{s.address}</span>
            </li>
            <li className="flex gap-2">
              <Clock className="mt-0.5 size-4 shrink-0 text-arena" />
              <span>{s.hours}</span>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-arena">
            Contacto
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-crema/85">
            <li className="flex gap-2">
              <Phone className="mt-0.5 size-4 shrink-0 text-arena" />
              <a href={`tel:${s.phone.replace(/[^+\d]/g, "")}`} className="hover:text-crema">
                {s.phone}
              </a>
            </li>
            <li className="flex gap-2">
              <Mail className="mt-0.5 size-4 shrink-0 text-arena" />
              <a href={`mailto:${s.email}`} className="hover:text-crema">
                {s.email}
              </a>
            </li>
            <li>
              <a
                href={`https://wa.me/${s.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-crema/40 px-3 py-1.5 text-xs uppercase tracking-wider transition-colors hover:bg-crema hover:text-oliva"
              >
                Escribir por WhatsApp
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-arena">
            Explorar
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-crema/85">
            <li>
              <Link href="/" className="hover:text-crema">
                Inicio
              </Link>
            </li>
            <li>
              <Link href="/sobre-nosotros" className="hover:text-crema">
                Sobre Nosotros
              </Link>
            </li>
            <li>
              <Link href="/productos" className="hover:text-crema">
                Todos los productos
              </Link>
            </li>
            {CATEGORIES.map((c) => (
              <li key={c.slug}>
                <Link
                  href={categoryHref(c.slug)}
                  className="text-crema/70 hover:text-crema"
                >
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-crema/15">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 text-xs text-crema/60 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {s.site_name} — Todos los derechos reservados
          </p>
          <p>Pagos seguros procesados por Mercado Pago</p>
        </div>
      </div>
    </footer>
  );
}
