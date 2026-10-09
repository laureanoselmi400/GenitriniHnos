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
  basePath: string;
  q: string;
  cat: string;
  min: string;
  max: string;
  sort: string;
  mat: string;
  anchoMin: string;
  anchoMax: string;
  altoMin: string;
  altoMax: string;
  profMin: string;
  profMax: string;
  materials: string[];
};

type RangeKey =
  | "anchoMin"
  | "anchoMax"
  | "altoMin"
  | "altoMax"
  | "profMin"
  | "profMax";

type RangeState = Record<RangeKey, string>;

export default function Filters(props: Props) {
  const {
    basePath,
    q,
    cat,
    min,
    max,
    sort,
    mat,
    anchoMin,
    anchoMax,
    altoMin,
    altoMax,
    profMin,
    profMax,
    materials,
  } = props;

  const router = useRouter();
  const searchParams = useSearchParams();
  const [keyword, setKeyword] = useState(q);
  const [minValue, setMinValue] = useState(min);
  const [maxValue, setMaxValue] = useState(max);
  const [range, setRange] = useState<RangeState>({
    anchoMin,
    anchoMax,
    altoMin,
    altoMax,
    profMin,
    profMax,
  });

  const apply = (patch: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (value === null || value === "") params.delete(key);
      else params.set(key, value);
    }
    const qs = params.toString();
    router.replace(qs ? `${basePath}?${qs}` : basePath, { scroll: false });
  };

  useEffect(() => {
    setKeyword(q);
    setMinValue(min);
    setMaxValue(max);
    setRange({ anchoMin, anchoMax, altoMin, altoMax, profMin, profMax });
  }, [q, min, max, anchoMin, anchoMax, altoMin, altoMax, profMin, profMax]);

  useEffect(() => {
    if (keyword === q) return;
    const t = window.setTimeout(() => apply({ q: keyword || null }), 450);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword]);

  const applyPrice = () => {
    apply({ min: minValue || null, max: maxValue || null });
  };

  const applyMeasures = () => {
    apply({
      anchoMin: range.anchoMin || null,
      anchoMax: range.anchoMax || null,
      altoMin: range.altoMin || null,
      altoMax: range.altoMax || null,
      profMin: range.profMin || null,
      profMax: range.profMax || null,
    });
  };

  const setRangeField = (key: RangeKey, value: string) =>
    setRange((prev) => ({ ...prev, [key]: value }));

  const hasFilters = Boolean(
    q ||
      cat ||
      min ||
      max ||
      sort ||
      mat ||
      anchoMin ||
      anchoMax ||
      altoMin ||
      altoMax ||
      profMin ||
      profMax,
  );

  const rangeInputCls =
    "w-full border border-arena-osc bg-crema-alt px-2 py-2 text-sm focus:border-terracota focus:outline-none";

  const MeasureRange = ({
    label,
    minKey,
    maxKey,
  }: {
    label: string;
    minKey: RangeKey;
    maxKey: RangeKey;
  }) => (
    <div className="flex items-center gap-2">
      <span className="w-20 shrink-0 text-xs text-tinta-suave">{label}</span>
      <input
        type="number"
        inputMode="numeric"
        min={0}
        value={range[minKey]}
        onChange={(e) => setRangeField(minKey, e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && applyMeasures()}
        placeholder="Mín."
        aria-label={`${label} mínimo`}
        className={rangeInputCls}
      />
      <span className="text-tinta-suave">—</span>
      <input
        type="number"
        inputMode="numeric"
        min={0}
        value={range[maxKey]}
        onChange={(e) => setRangeField(maxKey, e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && applyMeasures()}
        placeholder="Máx."
        aria-label={`${label} máximo`}
        className={rangeInputCls}
      />
    </div>
  );

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

      {materials.length > 0 && (
        <section className="border border-arena bg-crema p-4">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-oliva">
            Material
          </h2>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => apply({ mat: null })}
              className={`border px-2.5 py-1.5 text-xs capitalize transition-colors ${
                !mat
                  ? "border-terracota bg-terracota text-crema"
                  : "border-arena-osc text-tinta hover:border-terracota hover:text-terracota"
              }`}
            >
              Todos
            </button>
            {materials.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => apply({ mat: mat === m ? null : m })}
                className={`border px-2.5 py-1.5 text-xs capitalize transition-colors ${
                  mat === m
                    ? "border-terracota bg-terracota text-crema"
                    : "border-arena-osc text-tinta hover:border-terracota hover:text-terracota"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="border border-arena bg-crema p-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-oliva">
          Medidas (cm)
        </h2>
        <div className="mt-3 space-y-2">
          <MeasureRange label="Ancho" minKey="anchoMin" maxKey="anchoMax" />
          <MeasureRange label="Alto" minKey="altoMin" maxKey="altoMax" />
          <MeasureRange label="Profundidad" minKey="profMin" maxKey="profMax" />
        </div>
        <button
          type="button"
          onClick={applyMeasures}
          className="mt-3 w-full border border-oliva bg-oliva px-3 py-2 text-xs uppercase tracking-wider text-crema transition-colors hover:bg-oliva-cl"
        >
          Aplicar medidas
        </button>
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
            className={rangeInputCls}
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
            className={rangeInputCls}
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
            onClick={() => router.replace(basePath, { scroll: false })}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 border border-arena-osc px-3 py-2 text-xs uppercase tracking-wider text-tinta-suave transition-colors hover:border-terracota hover:text-terracota"
          >
            <RotateCcw className="size-3.5" /> Limpiar filtros
          </button>
        )}
      </section>
    </div>
  );
}
