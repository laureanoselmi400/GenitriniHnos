type Props = { className?: string };

/** Filete ornamental colonial: línea con motivos centrados. */
export function OrnamentLine({ className = "" }: Props) {
  return (
    <div className={`flex items-center gap-3 ${className}`} aria-hidden="true">
      <span className="h-px flex-1 linea-ornamental" />
      <svg viewBox="0 0 60 16" className="h-4 w-16 text-terracota" fill="none">
        <path
          d="M2 8h14M44 8h14"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <path
          d="M30 2c3.5 2.5 6 4.4 6 6s-2.5 3.5-6 6c-3.5-2.5-6-4.4-6-6s2.5-3.5 6-6z"
          stroke="currentColor"
          strokeWidth="1.2"
        />
        <circle cx="22" cy="8" r="1.6" fill="currentColor" />
        <circle cx="38" cy="8" r="1.6" fill="currentColor" />
      </svg>
      <span className="h-px flex-1 linea-ornamental" />
    </div>
  );
}

/** Rincón decorativo para tarjetas y banners. */
export function CornerFlourish({ className = "" }: Props) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      aria-hidden="true"
    >
      <path d="M2 46V14C2 7.4 7.4 2 14 2h32" />
      <path d="M8 46V16c0-4.4 3.6-8 8-8h30" />
      <path d="M2 24c6 0 10-4 10-10S16 4 22 4" />
      <circle cx="14" cy="14" r="2" fill="currentColor" stroke="none" />
    </svg>
  );
}
