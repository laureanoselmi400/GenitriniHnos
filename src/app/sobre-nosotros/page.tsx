import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Compass, Hammer, Landmark, Sprout } from "lucide-react";
import { OrnamentLine, CornerFlourish } from "@/components/ui/Ornament";

export const metadata: Metadata = {
  title: "Sobre Nosotros",
  description:
    "La historia de Genitrini Hnos.: casi cinco décadas rescatando aberturas, farolas y piezas de estancia en demoliciones y remates.",
};

const VALORES = [
  {
    icon: Hammer,
    titulo: "Rescate",
    texto:
      "Trabajamos junto a empresas de demoliciones y constructoras. Antes de que el martillo caiga, recorremos la obra buscando todo lo que merece seguir vivo.",
  },
  {
    icon: Compass,
    titulo: "Búsqueda",
    texto:
      "Estamos en cada remate de estancia del litoral. Cencerros, faroleros, aperos y muebles rurales que hoy son piezas de colección.",
  },
  {
    icon: Landmark,
    titulo: "Patrimonio",
    texto:
      "Cada puerta de casona guarda el nombre de quien la talló. Restauramos sin falsificar: conservamos las marcas, los nudos y la pátina del tiempo.",
  },
  {
    icon: Sprout,
    titulo: "Reutilidad",
    texto:
      "Nada se descarta. Lo que no puede volver a usarse como pieza, se transforma en material para mobiliario y decoración.",
  },
];

export default function SobreNosotrosPage() {
  return (
    <>
      <section className="textura-papel border-b border-arena">
        <div className="relative mx-auto max-w-4xl px-6 py-16 text-center">
          <CornerFlourish className="absolute left-4 top-4 size-8 text-terracota/40" />
          <CornerFlourish className="absolute right-4 top-4 size-8 rotate-90 text-terracota/40" />
          <span className="text-xs uppercase tracking-[0.4em] text-terracota">
            Sobre nosotros
          </span>
          <h1 className="mt-5 font-display text-4xl sm:text-5xl">
            Casi cinco décadas rescatando lo que otros tiran
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-tinta-suave">
            Genitrini Hnos. nació de una idea simple: lo antiguo no se tira. Lo que
            comenzó como un taller de compra-venta de material de demolición, hoy es un
            archivo vivo de la arquitectura y el campo del litoral argentino.
          </p>
          <OrnamentLine className="mx-auto mt-8 max-w-md" />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-10 md:grid-cols-2">
          <div className="space-y-5 text-[15px] leading-relaxed text-tinta">
            <h2 className="font-display text-3xl">La historia</h2>
            <p>
              Todo empezó con un camión y una lista de caseríos. En los años 80
              recorríamos las construcciones viejas de Pergamino y los pueblos
              vecinos comprando material para reventa: techos de chapa, maderas
              nobles, herrajes. Con el tiempo llegaron las primeras demoliciones por
              encargo, y con ellas la decisión de no llevarse solo lo útil, sino
              también lo bello.
            </p>
            <p>
              Así aparecieron las aberturas de cedro de las casonas del centro, los
              zaguán con medallones tallados, las farolas de hierro que alumbraron
              las veredas de principios del siglo XX. Y en los remates de estancia,
              los cencerros de bronce, los faroleros de campana, las alforjas y los
              yugos de carreta.
            </p>
            <p>
              Hoy cada pieza que ingresamos se documenta, se fotografía y se
              restaura en nuestro taller. Contamos su procedencia y su estado real,
              porque creemos que comprar una pieza antigua es también hacerte cargo
              de su historia.
            </p>
          </div>

          <div className="space-y-4">
            <div className="textura-lino border border-arena bg-crema-alt p-6">
              <span className="font-display text-5xl text-terracota">1978</span>
              <p className="mt-2 text-sm text-tinta-suave">
                Año en que comenzó la primera casa de compra-venta de material de
                demolición de la familia.
              </p>
            </div>
            <div className="textura-lino border border-arena bg-crema-alt p-6">
              <span className="font-display text-5xl text-terracota">+4.000</span>
              <p className="mt-2 text-sm text-tinta-suave">
                Piezas rescatadas, catalogadas y restauradas hasta la fecha.
              </p>
            </div>
            <div className="textura-lino border border-arena bg-crema-alt p-6">
              <span className="font-display text-5xl text-terracota">100%</span>
              <p className="mt-2 text-sm text-tinta-suave">
                Artículos únicos. No fabricamos réplicas ni trabajamos por series.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-arena bg-crema-alt/60 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center font-display text-3xl">Lo que nos mueve</h2>
          <OrnamentLine className="mx-auto mt-6 max-w-sm" />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {VALORES.map((v) => (
              <div key={v.titulo} className="border border-arena bg-crema p-6">
                <v.icon className="size-6 text-terracota" />
                <h3 className="mt-3 font-display text-xl">{v.titulo}</h3>
                <p className="mt-2 text-sm leading-relaxed text-tinta-suave">{v.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h2 className="font-display text-3xl">Vení a conocer el taller</h2>
        <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-tinta-suave">
          Las fotos ayudan, pero la madera se entiende tocándola. Estamos abiertos de
          lunes a viernes y los sábados a la mañana. Podés coordinar una visita o
          pedirnos fotos adicionales de cualquier pieza.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            href="/productos"
            className="inline-flex items-center gap-2 bg-terracota px-6 py-3 text-sm uppercase tracking-wider text-crema transition-colors hover:bg-terracota-osc"
          >
            Ver productos <ArrowRight className="size-4" />
          </Link>
          <Link
            href="/contacto"
            className="inline-flex items-center gap-2 border border-oliva px-6 py-3 text-sm uppercase tracking-wider text-oliva transition-colors hover:bg-oliva hover:text-crema"
          >
            Coordinar visita
          </Link>
        </div>
      </section>
    </>
  );
}
