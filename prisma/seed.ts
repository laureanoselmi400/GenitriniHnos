import { mkdirSync, writeFileSync } from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { DEFAULT_SETTINGS } from "../src/lib/settings";

const db = new PrismaClient();

const OUT_DIR = path.join(process.cwd(), "public", "images", "catalogo");

const PALETTES: Record<string, { bg: string; ink: string; label: string }> = {
  aberturas: { bg: "#F2E7D6", ink: "#8B4513", label: "ABERTURAS" },
  iluminacion: { bg: "#F5EBDC", ink: "#A9671F", label: "ILUMINACIÓN" },
  campo: { bg: "#E8ECE3", ink: "#3B4A3F", label: "CAMPO" },
  varios: { bg: "#F1E9DE", ink: "#6E3510", label: "VARIOS" },
};

function glyph(category: string, ink: string): string {
  const s = `stroke="${ink}" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"`;
  switch (category) {
    case "aberturas":
      return `
      <g ${s}>
        <rect x="300" y="110" width="200" height="320" rx="3"/>
        <rect x="322" y="132" width="72" height="120"/>
        <rect x="406" y="132" width="72" height="120"/>
        <rect x="322" y="268" width="72" height="140"/>
        <rect x="406" y="268" width="72" height="140"/>
        <circle cx="480" cy="278" r="7" fill="${ink}"/>
      </g>`;
    case "iluminacion":
      return `
      <g ${s}>
        <path d="M400 78 v46"/>
        <rect x="352" y="124" width="96" height="26" rx="4"/>
        <path d="M362 150 h76 l24 172 h-124 z"/>
        <path d="M348 322 h104"/>
        <path d="M372 344 h56"/>
        <path d="M400 196 c16 24 24 40 24 56 a24 24 0 0 1 -48 0 c0-16 8-32 24-56z" fill="${ink}" stroke="none"/>
        <path d="M338 380 h124"/>
      </g>`;
    case "campo":
      return `
      <g ${s}>
        <path d="M400 96 c74 0 116 62 116 148 v92 h-232 v-92 c0-86 42-148 116-148z"/>
        <path d="M400 96 v-24"/>
        <circle cx="400" cy="60" r="14"/>
        <rect x="268" y="336" width="264" height="34" rx="10"/>
        <path d="M356 300 h88"/>
        <path d="M400 370 v34"/>
        <circle cx="400" cy="420" r="20"/>
      </g>`;
    default:
      return `
      <g ${s}>
        <circle cx="400" cy="180" r="66"/>
        <circle cx="400" cy="180" r="30"/>
        <path d="M400 246 v186"/>
        <path d="M400 356 h52"/>
        <path d="M400 396 h34"/>
        <path d="M468 300 a68 68 0 0 1 -68 68"/>
      </g>`;
  }
}

function productSvg(title: string, category: string, index: number): string {
  const palette = PALETTES[category] ?? PALETTES.varios;
  const short = title.length > 38 ? `${title.slice(0, 36)}…` : title;
  const rot = index === 0 ? 0 : index === 1 ? -1.5 : 1.5;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600" role="img">
  <rect width="800" height="600" fill="${palette.bg}"/>
  <g opacity="0.10" fill="${palette.ink}">
    ${Array.from({ length: 40 })
      .map(
        (_, i) =>
          `<circle cx="${(i * 97) % 800}" cy="${(i * 211) % 600}" r="${1 + (i % 3)}"/>`,
      )
      .join("")}
  </g>
  <rect x="26" y="26" width="748" height="548" fill="none" stroke="${palette.ink}" stroke-width="3"/>
  <rect x="40" y="40" width="720" height="520" fill="none" stroke="${palette.ink}" stroke-width="1" opacity="0.55"/>
  <g transform="translate(0 ${index * 4}) rotate(${rot} 400 260)">
    ${glyph(category, palette.ink)}
  </g>
  <text x="400" y="474" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="34" fill="#2B231D">${escapeXml(short)}</text>
  <text x="400" y="514" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="13" letter-spacing="7" fill="#6B5D4F">${palette.label} · GENITRINI HNOS.</text>
  <text x="400" y="544" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="12" letter-spacing="3" fill="#6B5D4F">Foto ${index + 1}</text>
</svg>`;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

type Spec = {
  title: string;
  slug: string;
  category: string;
  price: number;
  stock: number;
  condition: string;
  description: string;
  history?: string;
  featured?: boolean;
  views: number;
  photos: number;
};

const PRODUCTOS: Spec[] = [
  {
    title: "Puerta de casona de cedro",
    slug: "puerta-de-casona-de-cedro",
    category: "aberturas",
    price: 1850000,
    stock: 1,
    condition: "Restaurada",
    description:
      "Puerta principal de dos hojas en cedro macizo, con paneles originales y herrajes de hierro forjado. Medidas: 1,65 m de ancho x 2,90 m de alto. Rescatada de una casona del centro de Pergamino programada para demolición. Restaurada en taller: se reforzó el bastidor, se reposicionaron los goznejas originales y se aplicó aceite natural.",
    history:
      "Perteneció a una casa de familia fundadora del barrio La Picasa, construida a fines del siglo XIX. La familia conservó durante décadas el mismo picaporte de bronce, que viene incluido.",
    featured: true,
    views: 486,
    photos: 3,
  },
  {
    title: "Ventana enrejada de madera",
    slug: "ventana-enrejada-de-madera",
    category: "aberturas",
    price: 420000,
    stock: 2,
    condition: "Usado – buen estado",
    description:
      "Ventana de guillotina con reja de hierro integrada, típica de las casas de principios del siglo XX. Medidas: 1,10 m x 1,45 m. Madera de pino laurófila en buen estado, vidrio original con leve ondulación. Ideal para reventa en casas quinta o para completar un juego de tres.",
    history: "Salida de una demolición en calle Santiago, junto a otras cuatro piezas del mismo juego.",
    views: 312,
    photos: 2,
  },
  {
    title: "Zaguán con medallón tallado",
    slug: "zagan-con-medallon-tallado",
    category: "aberturas",
    price: 980000,
    stock: 1,
    condition: "Usado – requiere restauración",
    description:
      "Marco de zaguán completo con medallón tallado a mano en el dintel. Medidas exteriores: 1,48 m x 2,60 m. Requiere limpieza profunda y reposición de dos tablas del alféizar. Pieza de gran presencia para recibidores o restaurantes.",
    history: "Correspondía a la entrada de servicio de una casona de la calle Rocha, hoy demolida.",
    featured: true,
    views: 264,
    photos: 2,
  },
  {
    title: "Farola de hierro a kerosene",
    slug: "farola-de-hierro-a-kerosene",
    category: "iluminacion",
    price: 320000,
    stock: 1,
    condition: "Restaurada",
    description:
      "Farola caminera de hierro fundido con pantalla de vidrio esmerilado y mecha original. Altura total: 1,65 m. Funcionaba a kerosene; se puede electrificar sin intervenir la estructura (no incluye cableado). Restaurada: viruta, antioxidante y pintura al horno color verde americano.",
    history: "Una de las tres farolas que alumbraron el acceso al puerto viejo de Pergamino.",
    featured: true,
    views: 658,
    photos: 3,
  },
  {
    title: "Farolero de campana de bronce",
    slug: "farolero-de-campana-de-bronce",
    category: "iluminacion",
    price: 185000,
    stock: 2,
    condition: "Usado – buen estado",
    description:
      "Farolero de campana en bronce con gancho de suspensión forjado. Diámetro de la campana: 34 cm. Excelente estado, con pátina original conservada. Funciona con vela o lámpara eléctrica portátil.",
    history: "Comprado en un remate de estancia de la zona de Caseros, junto a dos cencerros.",
    views: 408,
    photos: 2,
  },
  {
    title: "Candelabro de bronce de estancia",
    slug: "candelabro-de-bronce-de-estancia",
    category: "iluminacion",
    price: 145000,
    stock: 3,
    condition: "Usado – buen estado",
    description:
      "Candelabro de tres brazos en bronce con base pesada y detalle floral. Altura: 42 cm. Presenta golpes de uso acorde a su antigüedad. Se entrega limpio y con las tres portavelas completas.",
    views: 224,
    photos: 2,
  },
  {
    title: "Cencerro de bronce forjado",
    slug: "cencerro-de-bronce-forjado",
    category: "campo",
    price: 95000,
    stock: 4,
    condition: "Usado – buen estado",
    description:
      "Cencerro de bronce forjado a martillo, sonido limpio y profundo. Altura: 22 cm, boca de 16 cm. Cuerda de suspensión nueva. Pieza de colección para jardines, bodegas o restaurants.",
    history: "Perteneció a un lote de vacas de una estancia fundada en 1902; fue numera 7 del campo.",
    featured: true,
    views: 731,
    photos: 3,
  },
  {
    title: "Cencerro grande de alambre",
    slug: "cencerro-grande-de-alambre",
    category: "campo",
    price: 68000,
    stock: 5,
    condition: "Usado – buen estado",
    description:
      "Cencerro de gran formato en chapa plegada con remaches, estilo tradicional criollo. Altura: 28 cm. Buen estado general con marcas de uso y algo de óxido superficial estable.",
    views: 352,
    photos: 2,
  },
  {
    title: "Yugo de carreta de estancia",
    slug: "yugo-de-carreta-de-estancia",
    category: "campo",
    price: 450000,
    stock: 1,
    condition: "Usado – requiere restauración",
    description:
      "Yugo completo para carreta de bueyes en madera dura con hierros originales. Largo: 2,30 m. Madera seca, sin carcoma, requiere lijado y aceitado. Pieza escultural ideal como cabecera o divisoria de ambientes.",
    history: "Último yugo en uso activo de una estancia de La Criolla, retirado al jubilarse el carruero.",
    views: 196,
    photos: 2,
  },
  {
    title: "Amolador de piedra con base de hierro",
    slug: "amolador-de-piedra-con-base-de-hierro",
    category: "campo",
    price: 210000,
    stock: 1,
    condition: "Restaurada",
    description:
      "Amolador de afilar con rueda de arenisca de 45 cm montado sobre base de hierro fundido con pedal. Funciona perfectamente; se repuso la correa de cuero. Altura de trabajo: 85 cm.",
    views: 154,
    photos: 2,
  },
  {
    title: "Espejo con marco de pasta dorada",
    slug: "espejo-con-marco-de-pasta-dorada",
    category: "varios",
    price: 380000,
    stock: 1,
    condition: "Usado – buen estado",
    description:
      "Espejo de pieza con marco tallado en pasta y pan de oro original, con desgaste uniforme que le da carácter. Medidas: 78 cm x 140 cm. Cristal antiguo con pequeñas manchas de plata, elegantes.",
    history: "Hallado en el desván de una casa quinta centenaria de Villa del Rosario.",
    views: 288,
    photos: 2,
  },
  {
    title: "Baúl de viaje de lata",
    slug: "baul-de-viaje-de-lata",
    category: "varios",
    price: 520000,
    stock: 1,
    condition: "Restaurada",
    description:
      "Baúl de viaje forrado en lata con cantos de hierro, llave original y asas laterales. Interior forrado en papel de estraza nuevo. Medidas: 92 cm x 48 cm x 44 cm. Sirve como mesa de apoyo o storage.",
    featured: true,
    views: 341,
    photos: 2,
  },
  {
    title: "Jaula de hierro para pajarera",
    slug: "jaula-de-hierro-para-pajarera",
    category: "varios",
    price: 88000,
    stock: 2,
    condition: "Usado – buen estado",
    description:
      "Pajarera de hierro con base de madera y cúpula decorativa. Diámetro: 48 cm, altura total: 96 cm. Decorativa, no apta para animales. Se limpia y entrega con su bandeja original.",
    views: 132,
    photos: 2,
  },
];

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  mkdirSync(path.join(process.cwd(), "public", "uploads"), { recursive: true });

  console.log("→ Generando imágenes del catálogo…");
  const imageUrls = new Map<string, string[]>();
  for (const p of PRODUCTOS) {
    const urls: string[] = [];
    for (let i = 0; i < p.photos; i++) {
      const file = `${p.slug}-${i + 1}.svg`;
      writeFileSync(path.join(OUT_DIR, file), productSvg(p.title, p.category, i), "utf8");
      urls.push(`/images/catalogo/${file}`);
    }
    imageUrls.set(p.slug, urls);
  }

  console.log("→ Guardando configuración del sitio…");
  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    await db.setting.upsert({
      where: { key },
      update: {},
      create: { key, value },
    });
  }

  console.log("→ Cargando productos…");
  let creados = 0;
  for (const p of PRODUCTOS) {
    const exists = await db.product.findUnique({ where: { slug: p.slug } });
    if (exists) continue;

    await db.product.create({
      data: {
        title: p.title,
        slug: p.slug,
        category: p.category,
        price: p.price,
        stock: p.stock,
        condition: p.condition,
        description: p.description,
        history: p.history,
        featured: Boolean(p.featured),
        visible: true,
        views: p.views,
        images: {
          create: (imageUrls.get(p.slug) ?? []).map((url, i) => ({
            url,
            alt: `${p.title} — foto ${i + 1}`,
            position: i,
          })),
        },
      },
    });
    creados += 1;
  }

  const total = await db.product.count();
  console.log(`✔ Listo: ${creados} productos nuevos, ${total} en total.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
