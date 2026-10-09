"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { ArrowLeft, Check, ImagePlus, Loader2, MoveLeft, MoveRight, Save, Trash2, X } from "lucide-react";
import { CATEGORIES } from "@/lib/categories";
import { formatPrice } from "@/lib/format";

export type ProductFormValues = {
  id?: number;
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

const CONDICIONES = [
  "Usado – buen estado",
  "Usado – requiere restauración",
  "Restaurada",
  "En su estado original",
  "Nuevo",
];

const MAX_FILE_SIZE = 15 * 1024 * 1024;
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
  "image/svg+xml",
];

type UploadSignature = {
  cloudName: string;
  apiKey: string;
  folder: string;
  timestamp: number;
  signature: string;
};

async function uploadToCloudinary(file: File, sign: UploadSignature): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("api_key", sign.apiKey);
  fd.append("timestamp", String(sign.timestamp));
  fd.append("folder", sign.folder);
  fd.append("signature", sign.signature);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${sign.cloudName}/image/upload`, {
    method: "POST",
    body: fd,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.secure_url) {
    throw new Error(data?.error?.message || "No se pudo subir la foto a Cloudinary");
  }
  return data.secure_url as string;
}

async function uploadViaApi(list: File[]): Promise<string[]> {
  const fd = new FormData();
  list.forEach((f) => fd.append("files", f));
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "No se pudieron subir las fotos");
  return data.urls as string[];
}

export default function ProductForm({ initial }: { initial?: ProductFormValues }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const isEdit = Boolean(initial?.id);

  const [form, setForm] = useState<ProductFormValues>(
    initial ?? {
      title: "",
      category: CATEGORIES[0].slug,
      kind: "usado",
      price: "",
      stock: 1,
      condition: CONDICIONES[0],
      material: "",
      width: "",
      height: "",
      depth: "",
      description: "",
      history: "",
      featured: false,
      visible: true,
      images: [],
    },
  );
  const [images, setImages] = useState<string[]>(initial?.images ?? []);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const set = <K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const uploadFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const list = Array.from(files);
    const tooBig = list.find((f) => f.size > MAX_FILE_SIZE);
    if (tooBig) {
      setError(`La imagen “${tooBig.name}” supera los 15 MB.`);
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    const badType = list.find((f) => !ALLOWED_TYPES.includes(f.type));
    if (badType) {
      setError(
        `Formato no soportado: ${badType.name}${badType.type ? ` (${badType.type})` : ""}. Usá JPG, PNG, WEBP, AVIF, GIF o SVG.`,
      );
      if (fileRef.current) fileRef.current.value = "";
      return;
    }

    setUploading(true);
    setError("");
    try {
      const signRes = await fetch("/api/upload/sign");
      const sign = await signRes.json().catch(() => ({}));

      let urls: string[];
      if (signRes.ok && sign.configured) {
        try {
          urls = await Promise.all(list.map((file) => uploadToCloudinary(file, sign)));
        } catch (err) {
          console.warn("Subida directa fallida, reintento por servidor", err);
          urls = await uploadViaApi(list);
        }
      } else {
        urls = await uploadViaApi(list);
      }
      setImages((prev) => [...prev, ...urls]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir imágenes");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const moveImage = (index: number, delta: number) => {
    setImages((prev) => {
      const next = [...prev];
      const target = index + delta;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = { ...form, images };
      const res = await fetch("/api/products", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isEdit ? { id: form.id, ...payload } : payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "No se pudo guardar");
      setDone(true);
      window.setTimeout(() => {
        router.push("/admin/productos");
        router.refresh();
      }, 600);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
      setSaving(false);
    }
  };

  const inputCls =
    "mt-1.5 w-full border border-arena-osc bg-crema px-3 py-2.5 text-sm focus:border-terracota focus:outline-none";
  const labelCls = "text-xs font-medium uppercase tracking-wider text-tinta-suave";

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="space-y-5 border border-arena bg-crema p-5 sm:p-6">
        <div>
          <label className={labelCls} htmlFor="title">
            Título *
          </label>
          <input
            id="title"
            required
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="Ej.: Puerta de casona de cedro"
            className={inputCls}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className={labelCls} htmlFor="kind">
              Condición *
            </label>
            <select
              id="kind"
              value={form.kind}
              onChange={(e) => set("kind", e.target.value)}
              className={inputCls}
            >
              <option value="usado">Usado</option>
              <option value="nuevo">Nuevo</option>
            </select>
            <p className="mt-1 text-[11px] text-tinta-suave">
              {form.kind === "nuevo"
                ? "Se publica en el catálogo Nuevos."
                : "Se publica en el catálogo Usados."}
            </p>
          </div>
          <div>
            <label className={labelCls} htmlFor="category">
              Rubro *
            </label>
            <select
              id="category"
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
              className={inputCls}
            >
              {CATEGORIES.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls} htmlFor="stock">
              Stock *
            </label>
            <input
              id="stock"
              type="number"
              min={0}
              required
              value={form.stock}
              onChange={(e) => set("stock", e.target.value)}
              className={inputCls}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls} htmlFor="price">
              Precio (ARS) {form.kind === "usado" ? "*" : "— opcional"}
            </label>
            <input
              id="price"
              type="number"
              min={0}
              step="1000"
              required={form.kind === "usado"}
              value={form.price}
              onChange={(e) => set("price", e.target.value)}
              placeholder={form.kind === "nuevo" ? "Dejalo vacío para cotizar" : "150000"}
              className={inputCls}
            />
            <p className="mt-1 text-[11px] text-tinta-suave">
              {form.price
                ? `Vista: ${formatPrice(Number(form.price) || 0)}`
                : form.kind === "nuevo"
                  ? "Sin precio: se mostrará “Pedir cotización”."
                  : "Sin decimales"}
            </p>
          </div>
          <div>
            <label className={labelCls} htmlFor="material">
              Tipo de material
            </label>
            <input
              id="material"
              list="materiales"
              value={form.material}
              onChange={(e) => set("material", e.target.value)}
              placeholder="Ej.: cedro, hierro, chapa"
              className={inputCls}
            />
            <datalist id="materiales">
              {["cedro", "pino", "roble", "hierro", "chapa", "bronce", "vidrio", "cerámica"].map(
                (m) => (
                  <option key={m} value={m} />
                ),
              )}
            </datalist>
          </div>
        </div>

        <div>
          <p className={labelCls}>Medidas (cm) — opcional</p>
          <div className="mt-1.5 grid gap-4 sm:grid-cols-3">
            <div>
              <label className="text-[11px] text-tinta-suave" htmlFor="width">
                Ancho
              </label>
              <input
                id="width"
                type="number"
                min={0}
                step="0.1"
                value={form.width}
                onChange={(e) => set("width", e.target.value)}
                placeholder="120"
                className={inputCls}
              />
            </div>
            <div>
              <label className="text-[11px] text-tinta-suave" htmlFor="height">
                Alto
              </label>
              <input
                id="height"
                type="number"
                min={0}
                step="0.1"
                value={form.height}
                onChange={(e) => set("height", e.target.value)}
                placeholder="210"
                className={inputCls}
              />
            </div>
            <div>
              <label className="text-[11px] text-tinta-suave" htmlFor="depth">
                Profundidad
              </label>
              <input
                id="depth"
                type="number"
                min={0}
                step="0.1"
                value={form.depth}
                onChange={(e) => set("depth", e.target.value)}
                placeholder="5"
                className={inputCls}
              />
            </div>
          </div>
        </div>

        <div>
          <label className={labelCls} htmlFor="condition">
            Estado de la pieza
          </label>
          <input
            id="condition"
            list="condiciones"
            value={form.condition}
            onChange={(e) => set("condition", e.target.value)}
            className={inputCls}
          />
          <datalist id="condiciones">
            {CONDICIONES.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>

        <div>
          <label className={labelCls} htmlFor="description">
            Descripción *
          </label>
          <textarea
            id="description"
            required
            rows={5}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Medidas, materiales, estado general, detalles de uso…"
            className={`${inputCls} resize-y`}
          />
        </div>

        <div>
          <label className={labelCls} htmlFor="history">
            Historia de la pieza (opcional)
          </label>
          <textarea
            id="history"
            rows={4}
            value={form.history}
            onChange={(e) => set("history", e.target.value)}
            placeholder="De dónde salió, de qué casa o estancia proviene, anécdotas…"
            className={`${inputCls} resize-y`}
          />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => set("featured", e.target.checked)}
            className="size-4 accent-[#8B4513]"
          />
          Marcar como destacado (aparece en el inicio)
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.visible}
            onChange={(e) => set("visible", e.target.checked)}
            className="size-4 accent-[#3B4A3F]"
          />
          Visible en el catálogo público
        </label>
      </div>

      <aside className="space-y-5">
        <div className="border border-arena bg-crema p-5">
          <h2 className="font-display text-lg">Fotos</h2>
          <p className="mt-1 text-[11px] leading-relaxed text-tinta-suave">
            La primera foto es la principal. Podés reordenarlas con las flechas.
            Máximo 8 MB por archivo.
          </p>

          <div className="mt-4 grid grid-cols-3 gap-2">
            {images.map((url, i) => (
              <div
                key={`${url}-${i}`}
                className="group relative aspect-square overflow-hidden border border-arena bg-crema-alt"
              >
                <img src={url} alt={`Foto ${i + 1}`} className="h-full w-full object-cover" />
                {i === 0 && (
                  <span className="absolute left-0 top-0 bg-terracota px-1.5 py-0.5 text-[9px] uppercase text-crema">
                    Principal
                  </span>
                )}
                <div className="absolute inset-x-0 bottom-0 flex justify-center gap-1 bg-tinta/70 p-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => moveImage(i, -1)}
                    disabled={i === 0}
                    className="grid size-6 place-items-center text-crema hover:text-arena disabled:opacity-30"
                    aria-label="Mover a la izquierda"
                  >
                    <MoveLeft className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                    className="grid size-6 place-items-center text-crema hover:text-terracota"
                    aria-label="Quitar foto"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveImage(i, 1)}
                    disabled={i === images.length - 1}
                    className="grid size-6 place-items-center text-crema hover:text-arena disabled:opacity-30"
                    aria-label="Mover a la derecha"
                  >
                    <MoveRight className="size-3.5" />
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="grid aspect-square place-items-center border border-dashed border-arena-osc text-tinta-suave transition-colors hover:border-terracota hover:text-terracota"
            >
              {uploading ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <ImagePlus className="size-5" />
              )}
            </button>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => uploadFiles(e.target.files)}
          />

          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="mt-3 w-full border border-arena-osc px-3 py-2 text-xs uppercase tracking-wider text-tinta-suave transition-colors hover:border-terracota hover:text-terracota disabled:opacity-60"
          >
            {uploading ? "Subiendo…" : "Agregar fotos"}
          </button>
        </div>

        {error && (
          <p className="border-l-2 border-terracota bg-crema px-3 py-2 text-sm text-terracota">
            {error}
          </p>
        )}

        <div className="space-y-2">
          <button
            type="submit"
            disabled={saving || uploading}
            className="inline-flex w-full items-center justify-center gap-2 bg-terracota px-5 py-3 text-sm uppercase tracking-wider text-crema transition-colors hover:bg-terracota-osc disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Guardando…
              </>
            ) : done ? (
              <>
                <Check className="size-4" /> Guardado
              </>
            ) : (
              <>
                <Save className="size-4" /> {isEdit ? "Guardar cambios" : "Publicar producto"}
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => router.push("/admin/productos")}
            className="inline-flex w-full items-center justify-center gap-2 border border-arena-osc px-5 py-3 text-xs uppercase tracking-wider text-tinta-suave transition-colors hover:border-terracota hover:text-terracota"
          >
            <X className="size-4" /> Cancelar
          </button>

          <button
            type="button"
            onClick={() => router.push("/admin")}
            className="inline-flex w-full items-center justify-center gap-2 px-5 py-2 text-xs uppercase tracking-wider text-tinta-suave transition-colors hover:text-terracota"
          >
            <ArrowLeft className="size-3.5" /> Volver al panel
          </button>
        </div>
      </aside>
    </form>
  );
}
