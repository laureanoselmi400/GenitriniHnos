"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, LogOut, Package, Receipt, Settings } from "lucide-react";

const TABS = [
  { href: "/admin", label: "Resumen", icon: LayoutDashboard },
  { href: "/admin/productos", label: "Productos", icon: Package },
  { href: "/admin/pedidos", label: "Pedidos", icon: Receipt },
  { href: "/admin/configuracion", label: "Configuración", icon: Settings },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <div className="border-b border-arena bg-crema-alt">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-2">
          <Link href="/" className="font-display text-lg">
            Genitrini <span className="text-terracota">Hnos.</span>
          </Link>
          <span className="border border-terracota px-2 py-0.5 text-[10px] uppercase tracking-wider text-terracota">
            Admin
          </span>
        </div>

        <nav className="flex flex-wrap items-center gap-1">
          {TABS.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={`inline-flex items-center gap-2 px-3 py-2 text-xs uppercase tracking-wider transition-colors ${
                isActive(tab.href)
                  ? "bg-terracota text-crema"
                  : "text-tinta hover:bg-crema hover:text-terracota"
              }`}
            >
              <tab.icon className="size-3.5" />
              {tab.label}
            </Link>
          ))}
          <button
            type="button"
            onClick={logout}
            className="ml-1 inline-flex items-center gap-2 border border-arena-osc px-3 py-2 text-xs uppercase tracking-wider text-tinta-suave transition-colors hover:border-terracota hover:text-terracota"
          >
            <LogOut className="size-3.5" /> Salir
          </button>
        </nav>
      </div>
    </div>
  );
}
