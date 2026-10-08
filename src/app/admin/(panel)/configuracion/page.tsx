import SettingsForm from "@/components/admin/SettingsForm";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function ConfiguracionPage() {
  const settings = await getSettings();

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-3xl">Configuración</h1>
        <p className="mt-1 text-sm text-tinta-suave">
          Datos que aparecen en el header, el pie de página y en los mensajes de
          WhatsApp.
        </p>
      </header>

      <SettingsForm initial={settings} />
    </div>
  );
}
