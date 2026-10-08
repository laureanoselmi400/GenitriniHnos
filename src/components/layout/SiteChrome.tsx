"use client";

import { usePathname } from "next/navigation";

/**
 * Envuelve el sitio público y oculta header/footer/botón de WhatsApp
 * cuando el usuario está dentro del panel de administración.
 */
export default function SiteChrome({
  header,
  footer,
  fab,
  children,
}: {
  header: React.ReactNode;
  footer: React.ReactNode;
  fab: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const enAdmin = pathname.startsWith("/admin");

  return (
    <>
      {!enAdmin && header}
      {children}
      {!enAdmin && footer}
      {!enAdmin && fab}
    </>
  );
}
