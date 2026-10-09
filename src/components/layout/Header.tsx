"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDown, ClipboardList, LockKeyhole, Menu, ShoppingBag, X } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { useQuote } from "@/components/quote/QuoteProvider";

const NAV: {
  href: string;
  label: string;
  children?: { href: string; label: string }[];
}[] = [
  { href: "/", label: "Inicio" },
  { href: "/sobre-nosotros", label: "Sobre Nosotros" },
  {
    href: "/productos",
    label: "Productos",
    children: [
      { href: "/productos/nuevos", label: "Nuevos" },
      { href: "/productos/usados", label: "Usados" },
    ],
  },
  { href: "/contacto", label: "Contacto" },
];

export default function Header({
  phone = "+549 2477 42-9537/42-9539",
  whatsapp = "5492477698740",
}: {
  phone?: string;
  whatsapp?: string;
}) {
  const pathname = usePathname();
  const { count } = useCart();
  const { count: quoteCount } = useQuote();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50">
      <div className="bg-oliva text-crema text-[11px] sm:text-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-1.5">
          <p className="tracking-wide">
            Arte y oficio rescatado de demoliciones y estancias
          </p>
          <a
            href={`https://wa.me/${whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline hover:text-arena transition-colors"
          >
            {phone}
          </a>
        </div>
      </div>

      <div className="border-b border-arena bg-crema/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/" className="group flex items-center gap-3" aria-label="Inicio">
            <img
              src="/images/logo5.png"
              alt="Genitrini Hnos."
              className="h-14 w-auto"
            />
            <span className="flex flex-col leading-none">
              <span className="font-display text-xl sm:text-2xl text-tinta">
                Genitrini <span className="text-terracota">Hnos.</span>
              </span>
              <span className="text-xs uppercase tracking-[0.25em] text-tinta-suave">
                Antigüedades de campo
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((item) =>
              item.children ? (
                <div key={item.href} className="group relative">
                  <Link
                    href={item.href}
                    className={`relative flex items-center gap-1 px-3 py-2 text-sm tracking-wide transition-colors ${
                      isActive(item.href)
                        ? "text-terracota"
                        : "text-tinta hover:text-terracota"
                    }`}
                  >
                    {item.label}
                    <ChevronDown className="size-3.5" />
                    <span
                      className={`absolute inset-x-3 -bottom-0.5 h-px bg-terracota transition-transform ${
                        isActive(item.href) ? "scale-x-100" : "scale-x-0"
                      }`}
                    />
                  </Link>
                  <div className="invisible absolute left-0 top-full z-50 min-w-44 translate-y-1 border border-arena bg-crema p-1 opacity-0 shadow-lg transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`block px-3 py-2 text-sm transition-colors ${
                          pathname.startsWith(child.href)
                            ? "bg-terracota text-crema"
                            : "text-tinta hover:bg-crema-alt hover:text-terracota"
                        }`}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative px-3 py-2 text-sm tracking-wide transition-colors ${
                    isActive(item.href)
                      ? "text-terracota"
                      : "text-tinta hover:text-terracota"
                  }`}
                >
                  {item.label}
                  <span
                    className={`absolute inset-x-3 -bottom-0.5 h-px bg-terracota transition-transform ${
                      isActive(item.href) ? "scale-x-100" : "scale-x-0"
                    }`}
                  />
                </Link>
              ),
            )}
          </nav>

          <div className="flex items-center gap-1">
            <Link
              href="/cotizacion"
              className="relative grid size-10 place-items-center rounded-full text-tinta transition-colors hover:bg-crema-alt hover:text-terracota"
              aria-label={`Pedido de cotización, ${quoteCount} ítems`}
              title="Pedido de cotización"
            >
              <ClipboardList className="size-5" />
              {quoteCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid min-w-4 place-items-center rounded-full bg-oliva px-1 text-[10px] font-semibold text-crema">
                  {quoteCount}
                </span>
              )}
            </Link>

            <Link
              href="/carrito"
              className="relative grid size-10 place-items-center rounded-full text-tinta transition-colors hover:bg-crema-alt hover:text-terracota"
              aria-label={`Carrito, ${count} artículos`}
            >
              <ShoppingBag className="size-5" />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid min-w-4 place-items-center rounded-full bg-terracota px-1 text-[10px] font-semibold text-crema">
                  {count}
                </span>
              )}
            </Link>

            <Link
              href="/admin"
              className="grid size-10 place-items-center rounded-full text-tinta transition-colors hover:bg-crema-alt hover:text-terracota"
              aria-label="Panel de administración"
              title="Panel de administración"
            >
              <LockKeyhole className="size-[18px]" />
            </Link>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="grid size-10 place-items-center rounded-full text-tinta transition-colors hover:bg-crema-alt md:hidden"
              aria-label={open ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={open}
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {open && (
          <nav className="border-t border-arena bg-crema px-4 pb-4 md:hidden">
            {NAV.map((item) => (
              <div key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`block border-b border-arena/70 py-3 text-sm ${
                    isActive(item.href) ? "text-terracota" : "text-tinta"
                  }`}
                >
                  {item.label}
                </Link>
                {item.children && (
                  <div className="flex border-b border-arena/70 pl-4">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={() => setOpen(false)}
                        className={`py-2.5 pr-5 text-sm ${
                          pathname.startsWith(child.href)
                            ? "text-terracota"
                            : "text-tinta-suave"
                        }`}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
