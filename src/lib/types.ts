export type ProductKind = "nuevo" | "usado";

export type ProductCardData = {
  id: number;
  title: string;
  slug: string;
  category: string;
  kind: string;
  price: number;
  stock: number;
  featured: boolean;
  views: number;
  description: string;
  condition: string;
  material: string;
  width: number | null;
  height: number | null;
  depth: number | null;
  images: { url: string; alt?: string | null }[];
};

export const KIND_LABELS: Record<string, string> = {
  nuevo: "Nuevo",
  usado: "Usado",
};

export function kindLabel(kind?: string | null): string {
  if (!kind) return "Usado";
  return KIND_LABELS[kind] ?? kind;
}

export function hasPrice(price: number | null | undefined): boolean {
  return Number(price) > 0;
}

export type OrderSummary = {
  id: string;
  reference: string;
  status: string;
  total: number;
  demo: boolean;
  createdAt: Date | string;
  buyerName: string;
  buyerEmail: string;
  items: { title: string; qty: number; price: number }[];
};

export type ProductFormData = {
  title: string;
  category: string;
  kind: string;
  price: number | string;
  stock: number | string;
  condition: string;
  material: string;
  width: number | string;
  height: number | string;
  depth: number | string;
  description: string;
  history: string;
  featured: boolean;
  visible: boolean;
  images: string[];
};
