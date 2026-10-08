"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Filter, RotateCcw, Search } from "lucide-react";
import { CATEGORIES } from "@/lib/categories";

const SORTS = [
  { value: "", label: "Recomendados" },
  { value: "vistas", label: "Más vistos" },
  { value: "nuevos", label: "Más recientes" },
  { value: "precio-asc", label: "Menor precio" },
  { value: "precio-desc", label: "Mayor precio" },
];

type Props = {
  q: string;
  cat: string;
  min: string;
  max: string;
  sort: string;
};

export default function Filters({ q, cat, min, max, sort }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [keyword, setKeyword] = useState(q);
  const [minValue, setMinValue] = useState(min);
  const [maxValue, setMaxValue] = useState(max);

  const apply = (patch: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (value === null || value === "") params.delete(key);
      else params.set(key, value);
    }
    const qs = params.toString();
    router.replace(qs ? `/productos?${qs}` : "/productos", { scroll: false });
  };

  useEffect(() => {
    setKeyword(q);
    setMinValue(min);
    setMaxValue(max);
  }, [q, min, max]);

  useEffect(() => {
    if (keyword === q) return;
    const t = window.setTimeout(() => apply({ q: keyword || null }), 450);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword]);

  const applyPrice = () => {
    apply({ min: minValue || null, max: maxValue || null });
  };

  const hasFilters = Boolean(q || cat || min || max || sort);

  return (
    <div className="space-y-6">
      <section className="border border-arena bg-crema p-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-oliva">
          <Search className="size-4" /> Buscar
        </h2>
        <div className="relative mt-3">
          <input
            type="search"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Ej.: farola, cedro, cencerro…"
            className="w-full border border-arena-osc bg-crema-alt px-3 py-2.5 pr-3 text-sm placeholder:text-tinta-suave/70 focus:border-terracota focus:outline-none"
          />
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-tinta-suave">
          Se busca por título, descripción e historia de la pieza.
        </p>
      </section>

      <section className="border border-arena bg-crema p-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-oliva">
          <Filter className="size-4" /> Rubro
        </h2>
        <div className="mt-3 flex flex-col gap-1">
          <button
            type="button"
            onClick={() => apply({ cat: null })}
            className={`flex items-center justify-between px-2 py-2 text-sm transition-colors ${
              !cat ? "bg-terracota text-crema" : "hover:bg-crema-alt"
            }`}
          >
            Todos
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.slug}
              type="button"
              onClick={() => apply({ cat: cat === c.slug ? null : c.slug })}
              className={`flex items-center justify-between px-2 py-2 text-sm transition-colors ${
                cat === c.slug ? "bg-terracota text-crema" : "hover:bg-crema-alt"
              }`}
            >
              <span>{c.label}</span>
              <span className={cat === c.slug ? "text-crema/70" : "text-tinta-suave/70"}>
                {c.short}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="border border-arena bg-crema p-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-oliva">
          Precio
        </h2>
        <div className="mt-3 flex items-center gap-2">
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={minValue}
            onChange={(e) => setMinValue(e.target.value)}
            onBlur={applyPrice}
            onKeyDown={(e) => e.key === "Enter" && applyPrice()}
            placeholder="Mín."
            aria-label="Precio mínimo"
            className="w-full border border-arena-osc bg-crema-alt px-2 py-2 text-sm focus:border-terracota focus:outline-none"
          />
          <span className="text-tinta-suave">—</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={maxValue}
            onChange={(e) => setMaxValue(e.target.value)}
            onBlur={applyPrice}
            onKeyDown={(e) => e.key === "Enter" && applyPrice()}
            placeholder="Máx."
            aria-label="Precio máximo"
            className="w-full border border-arena-osc bg-crema-alt px-2 py-2 text-sm focus:border-terracota focus:outline-none"
          />
        </div>
        <button
          type="button"
          onClick={applyPrice}
          className="mt-3 w-full border border-oliva bg-oliva px-3 py-2 text-xs uppercase tracking-wider text-crema transition-colors hover:bg-oliva-cl"
        >
          Aplicar rango
        </button>
      </section>

      <section className="border border-arena bg-crema p-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-oliva">
          Ordenar por
        </h2>
        <select
          value={sort}
          onChange={(e) => apply({ sort: e.target.value || null })}
          aria-label="Ordenar productos"
          className="mt-3 w-full border border-arena-osc bg-crema-alt px-2 py-2.5 text-sm focus:border-terracota focus:outline-none"
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        {hasFilters && (
          <button
            type="button"
            onClick={() => router.replace("/productos", { scroll: false })}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 border border-arena-osc px-3 py-2 text-xs uppercase tracking-wider text-tinta-suave transition-colors hover:border-terracota hover:text-terracota"
          >
            <RotateCcw className="size-3.5" /> Limpiar filtros
          </button>
        )}
      </section>
    </div>
  );
}
