export type CategorySlug = "aberturas" | "iluminacion" | "campo" | "varios";

export type Category = {
  slug: CategorySlug;
  label: string;
  short: string;
  description: string;
  icon: "door" | "lamp" | "bell" | "key";
};

export const CATEGORIES: Category[] = [
  {
    slug: "aberturas",
    label: "Aberturas",
    short: "Aberturas",
    description: "Puertas, ventanas y marcos de madera rescatados de casonas y casas antiguas.",
    icon: "door",
  },
  {
    slug: "iluminacion",
    label: "Iluminación",
    short: "Iluminación",
    description: "Farolas, faroleros, candelabros y luminarias de época.",
    icon: "lamp",
  },
  {
    slug: "campo",
    label: "Campo",
    short: "Campo",
    description: "Cencerros, aperos, herramientas y elementos de estancia.",
    icon: "bell",
  },
  {
    slug: "varios",
    label: "Varios",
    short: "Varios",
    description: "Piezas singulares, decoración y objetos con historia.",
    icon: "key",
  },
];

export function categoryLabel(slug?: string | null): string {
  if (!slug) return "Sin rubro";
  return CATEGORIES.find((c) => c.slug === slug)?.label ?? slug;
}

export function isCategory(value?: string): value is CategorySlug {
  return CATEGORIES.some((c) => c.slug === value);
}
