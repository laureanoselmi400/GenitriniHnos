import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Hammer, Layers } from "lucide-react";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Productos",
  description:
    "Elegí entre nuestro catálogo de artículos usados (piezas rescatadas y restauradas) y el de productos nuevos (chapas, perfiles, hierro y materiales).",
};

export default async function ProductosPage() {
  const [nuevos, usados] = await Promise.all([
    db.product.count({ where: { visible: true, kind: "nuevo" } }),
    db.product.count({ where: { visible: true, kind: "usado" } }),
  ]);

  const cards = [
    {
      href: "/productos/usados",
      eyebrow: "Antigüedades y piezas rescatadas",
      title: "Productos usados",
      description:
        "Aberturas, farolas, cencerros y objetos de estancia. Cada pieza es única: lo que ves publicado, está disponible.",
      count: usados,
      icon: Hammer,
      tone: "terracota" as const,
    },
    {
      href: "/productos/nuevos",
      eyebrow: "Materiales y hierro",
      title: "Productos nuevos",
      description:
        "Chapas acanaladas, perfiles, hierro y materiales listos para usar o instalar. Consultá stock y cotizá sin precio publicado.",
      count: nuevos,
      icon: Layers,
      tone: "oliva" as const,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <header className="mb-8 border-b border-arena pb-6">
        <nav className="mb-3 flex items-center gap-2 text-xs text-tinta-suave">
          <Link href="/" className="hover:text-terracota">
            Inicio
          </Link>
          <span>/</span>
          <span className="text-tinta">Productos</span>
        </nav>
        <span className="text-xs uppercase tracking-[0.35em] text-terracota">
          Elegí tu catálogo
        </span>
        <h1 className="mt-3 font-display text-4xl">Nuestros productos</h1>
        <p className="mt-2 max-w-2xl text-sm text-tinta-suave">
          Tenemos dos catálogos con búsquedas independientes para que encuentres más
          rápido lo que buscás.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group flex flex-col border border-arena bg-crema p-6 sombra-rustica transition-transform duration-300 hover:-translate-y-1 sm:p-8"
          >
            <span
              className={`grid size-12 place-items-center ${
                card.tone === "terracota"
                  ? "bg-terracota text-crema"
                  : "bg-oliva text-crema"
              }`}
            >
              <card.icon className="size-6" />
            </span>
            <span className="mt-5 text-xs uppercase tracking-[0.25em] text-tinta-suave">
              {card.eyebrow}
            </span>
            <h2 className="mt-2 font-display text-3xl">{card.title}</h2>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-tinta-suave">
              {card.description}
            </p>
            <span className="mt-6 inline-flex items-center gap-2 text-xs uppercase tracking-wider text-terracota">
              {card.count} {card.count === 1 ? "publicación" : "publicaciones"}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
