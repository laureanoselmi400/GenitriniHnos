import type { Metadata } from "next";
import { inter, playfair } from "@/lib/fonts";
import { getSettings } from "@/lib/settings";
import { CartProvider } from "@/components/cart/CartProvider";
import SiteChrome from "@/components/layout/SiteChrome";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppFab from "@/components/layout/WhatsAppFab";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    title: {
      default: `${s.site_name} — ${s.slogan}`,
      template: `%s | ${s.site_name}`,
    },
    description:
      "Catálogo de artículos antiguos, reciclados y de campo: aberturas de madera, farolas, cencerros y piezas de estancia rescatadas y restauradas.",
    keywords: [
      "antigüedades",
      "artículos de campo",
      "aberturas de madera",
      "farolas antiguas",
      "cencerros",
      "estancia",
      "reciclados",
    ],
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const s = await getSettings();

  return (
    <html lang="es" className={`${playfair.variable} ${inter.variable}`}>
      <body className="flex min-h-screen flex-col">
        <CartProvider>
          <SiteChrome
            header={<Header phone={s.phone} whatsapp={s.whatsapp} />}
            footer={<Footer />}
            fab={<WhatsAppFab />}
          >
            <main className="flex-1">{children}</main>
          </SiteChrome>
        </CartProvider>
      </body>
    </html>
  );
}
