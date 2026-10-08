import Link from "next/link";
import { ArrowRight, Bell, DoorOpen, Gavel, Hammer, KeyRound, Lamp, Paintbrush } from "lucide-react";
import ProductGrid from "@/components/products/ProductGrid";
import { OrnamentLine, CornerFlourish } from "@/components/ui/Ornament";
import { CATEGORIES } from "@/lib/categories";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

const ICONS = { aberturas: DoorOpen, iluminacion: Lamp, campo: Bell, varios: KeyRound };

const PASOS = [
  {
    icon: Hammer,
    titulo: "Rescate en demoliciones",
    texto:
      "Intervenimos en casas y casonas antes de la demolición para salvar puertas, ventanas, zaguanes y hierros con historia.",
  },
  {
    icon: Gavel,
    titulo: "Remates de estancia",
    texto:
      "Recorremos remates y martilleros de la región buscando cencerros, farolas, aperos y mobiliario de época.",
  },
  {
    icon: Paintbrush,
    titulo: "Restauración artesanal",
    texto:
      "Limpiamos, reforzamos y devolvemos la funcionalidad a cada pieza sin borrar las marcas del tiempo.",
  },
];

export default async function HomePage() {
  const s = await getSettings();

  const productos = await db.product.findMany({
    where: { visible: true },
    orderBy: [{ featured: "desc" }, { views: "desc" }],
    take: 8,
    include: { images: { orderBy: { position: "asc" } } },
  });

  return (
    <>
      {/* HERO */}
      <section className="textura-papel relative overflow-hidden border-b border-arena">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 90% at 50% 0%, rgba(139,69,19,0.10) 0%, rgba(253,251,247,0) 60%)",
          }}
        />
        <CornerFlourish className="absolute left-4 top-4 size-10 text-terracota/40" />
        <CornerFlourish className="absolute right-4 top-4 size-10 rotate-90 text-terracota/40" />
        <CornerFlourish className="absolute bottom-4 left-4 size-10 -rotate-90 text-terracota/40" />
        <CornerFlourish className="absolute bottom-4 right-4 size-10 rotate-180 text-terracota/40" />

        <div className="relative mx-auto max-w-4xl px-6 py-20 text-center sm:py-28">
          <span className="text-xs uppercase tracking-[0.4em] text-terracota">
            Desde 1978 · Concordia, Entre Ríos
          </span>
          <h1 className="mt-6 font-display text-4xl leading-[1.1] sm:text-6xl">
            Rescatamos historias,
            <br />
            <em className="text-terracota not-italic">conservamos oficios</em>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-tinta-suave sm:text-lg">
            Aberturas de madera antigua, farolas, cencerros y piezas de estancia. Cada
            artículo fue rescatado, restaurado y es absolutamente único.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/productos"
              className="inline-flex items-center gap-2 bg-terracota px-6 py-3.5 text-sm uppercase tracking-wider text-crema transition-colors hover:bg-terracota-osc"
            >
              Ver catálogo <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/sobre-nosotros"
              className="inline-flex items-center gap-2 border border-oliva px-6 py-3.5 text-sm uppercase tracking-wider text-oliva transition-colors hover:bg-oliva hover:text-crema"
            >
              Nuestra historia
            </Link>
          </div>
        </div>
      </section>

      {/* RUBROS */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <OrnamentLine className="mb-10" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((c) => {
            const Icon = ICONS[c.slug];
            return (
              <Link
                key={c.slug}
                href={`/productos?cat=${c.slug}`}
                className="group border border-arena bg-crema p-6 transition-colors hover:border-terracota hover:bg-crema-alt"
              >
                <span className="grid size-12 place-items-center border border-arena-osc bg-crema-alt text-terracota transition-colors group-hover:border-terracota group-hover:bg-terracota group-hover:text-crema">
                  <Icon className="size-6" />
                </span>
                <h2 className="mt-4 font-display text-xl">{c.label}</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-tinta-suave">
                  {c.description}
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs uppercase tracking-wider text-terracota">
                  Ver piezas <ArrowRight className="size-3" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* DESTACADOS */}
      <section className="border-y border-arena bg-crema-alt/60 py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-[0.3em] text-terracota">
                Selección de la casa
              </span>
              <h2 className="mt-2 font-display text-3xl sm:text-4xl">
                Los más vistos
              </h2>
              <p className="mt-2 max-w-xl text-sm text-tinta-suave">
                Artículos destacados y las piezas que más están mirando nuestros
                visitantes.
              </p>
            </div>
            <Link
              href="/productos"
              className="inline-flex items-center gap-2 border border-terracota px-5 py-2.5 text-xs uppercase tracking-wider text-terracota transition-colors hover:bg-terracota hover:text-crema"
            >
              Ver todos <ArrowRight className="size-3.5" />
            </Link>
          </div>

          <ProductGrid products={productos} showViews />
        </div>
      </section>

      {/* CÓMO TRABAJAMOS */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {PASOS.map((p, i) => (
            <div key={p.titulo} className="relative border border-arena bg-crema p-6">
              <span className="absolute -top-4 left-6 font-display text-5xl text-arena-osc">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p.icon className="mt-4 size-6 text-terracota" />
              <h3 className="mt-3 font-display text-xl">{p.titulo}</h3>
              <p className="mt-2 text-sm leading-relaxed text-tinta-suave">{p.texto}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 border border-oliva bg-oliva px-6 py-8 text-crema sm:px-10">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <h3 className="font-display text-2xl text-crema">
                ¿Buscás una pieza en particular?
              </h3>
              <p className="mt-2 max-w-xl text-sm text-crema/80">
                {s.footer_note}
              </p>
            </div>
            <Link
              href="/contacto"
              className="inline-flex shrink-0 items-center gap-2 bg-crema px-6 py-3 text-xs uppercase tracking-wider text-oliva transition-colors hover:bg-arena"
            >
              Consultanos <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
