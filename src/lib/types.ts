export type ProductCardData = {
  id: number;
  title: string;
  slug: string;
  category: string;
  price: number;
  stock: number;
  featured: boolean;
  views: number;
  description: string;
  images: { url: string; alt?: string | null }[];
};

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
  price: number | string;
  stock: number | string;
  condition: string;
  description: string;
  history: string;
  featured: boolean;
  visible: boolean;
  images: string[];
};
