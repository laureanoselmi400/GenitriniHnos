"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Image = { url: string; alt?: string | null };

export default function Gallery({
  images,
  title,
}: {
  images: Image[];
  title: string;
}) {
  const list = images.length > 0 ? images : [];
  const [index, setIndex] = useState(0);
  const current = list[index];

  const go = (delta: number) => {
    if (list.length === 0) return;
    setIndex((i) => (i + delta + list.length) % list.length);
  };

  return (
    <div>
      <div className="relative aspect-[4/3] overflow-hidden border border-arena bg-crema-alt sombra-rustica">
        {current ? (
          <img
            src={current.url}
            alt={current.alt || title}
            width={1000}
            height={750}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="grid h-full place-items-center text-sm uppercase tracking-widest text-tinta-suave">
            Sin fotos
          </div>
        )}

        {list.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Foto anterior"
              className="absolute left-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-crema/85 text-tinta transition-colors hover:bg-terracota hover:text-crema"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Foto siguiente"
              className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-crema/85 text-tinta transition-colors hover:bg-terracota hover:text-crema"
            >
              <ChevronRight className="size-5" />
            </button>
            <span className="absolute bottom-2 right-2 bg-tinta/70 px-2 py-1 text-[11px] text-crema">
              {index + 1} / {list.length}
            </span>
          </>
        )}
      </div>

      {list.length > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-2">
          {list.map((img, i) => (
            <button
              key={`${img.url}-${i}`}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Ver foto ${i + 1}`}
              className={`aspect-square overflow-hidden border transition-colors ${
                i === index ? "border-terracota" : "border-arena hover:border-arena-osc"
              }`}
            >
              <img
                src={img.url}
                alt={`${title} ${i + 1}`}
                width={200}
                height={200}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
