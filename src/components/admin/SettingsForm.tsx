"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, Loader2, Save } from "lucide-react";

const CAMPOS: { key: string; label: string; type?: "text" | "textarea"; hint?: string }[] = [
  { key: "site_name", label: "Nombre del negocio" },
  { key: "slogan", label: "Slogan del banner" },
  { key: "address", label: "Dirección física" },
  { key: "hours", label: "Horarios de atención" },
  { key: "phone", label: "Teléfono" },
  { key: "email", label: "Email" },
  {
    key: "whatsapp",
    label: "WhatsApp (solo números, con código de país)",
    hint: "Ej.: 5492477698740 — se usa en el botón flotante y en los formularios.",
  },
  { key: "footer_note", label: "Texto del pie de página", type: "textarea" },
];

export default function SettingsForm({ initial }: { initial: Record<string, string> }) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>(initial);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "No se pudo guardar");
      setDone(true);
      window.setTimeout(() => setDone(false), 2000);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="max-w-3xl border border-arena bg-crema p-5 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        {CAMPOS.map((campo) => (
          <label key={campo.key} className={campo.type === "textarea" ? "sm:col-span-2" : ""}>
            <span className="text-xs font-medium uppercase tracking-wider text-tinta-suave">
              {campo.label}
            </span>
            {campo.type === "textarea" ? (
              <textarea
                rows={3}
                value={values[campo.key] ?? ""}
                onChange={(e) => setValues((v) => ({ ...v, [campo.key]: e.target.value }))}
                className="mt-1.5 w-full resize-y border border-arena-osc bg-crema-alt px-3 py-2.5 text-sm focus:border-terracota focus:outline-none"
              />
            ) : (
              <input
                type="text"
                value={values[campo.key] ?? ""}
                onChange={(e) => setValues((v) => ({ ...v, [campo.key]: e.target.value }))}
                className="mt-1.5 w-full border border-arena-osc bg-crema-alt px-3 py-2.5 text-sm focus:border-terracota focus:outline-none"
              />
            )}
            {campo.hint && (
              <span className="mt-1 block text-[11px] text-tinta-suave">{campo.hint}</span>
            )}
          </label>
        ))}
      </div>

      {error && (
        <p className="mt-4 border-l-2 border-terracota bg-crema-alt px-3 py-2 text-sm text-terracota">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="mt-5 inline-flex items-center gap-2 bg-terracota px-5 py-3 text-sm uppercase tracking-wider text-crema transition-colors hover:bg-terracota-osc disabled:opacity-60"
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
            <Save className="size-4" /> Guardar configuración
          </>
        )}
      </button>
    </form>
  );
}
