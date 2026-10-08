"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { CATEGORIES } from "@/lib/categories";

type Props = { whatsapp: string };

export default function ContactForm({ whatsapp }: Props) {
  const [form, setForm] = useState({
    nombre: "",
    contacto: "",
    rubro: "",
    mensaje: "",
  });
  const [error, setError] = useState("");

  const set = (key: keyof typeof form) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre.trim() || !form.mensaje.trim()) {
      setError("Completá tu nombre y el mensaje para continuar.");
      return;
    }
    setError("");

    const lineas = [
      `Hola, soy ${form.nombre.trim()}.`,
      form.contacto.trim() ? `Mi contacto: ${form.contacto.trim()}` : "",
      form.rubro ? `Me interesa el rubro: ${form.rubro}` : "",
      "",
      form.mensaje.trim(),
      "",
      "— Enviado desde el sitio de Genitrini Hnos.",
    ].filter((l) => l !== undefined);

    const text = lineas.join("\n");
    const url = `https://wa.me/${whatsapp}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <form
      onSubmit={submit}
      className="border border-arena bg-crema p-6 sombra-rustica sm:p-8"
      id="formulario"
    >
      <h2 className="font-display text-2xl">Escribinos por WhatsApp</h2>
      <p className="mt-1.5 text-sm text-tinta-suave">
        Armamos el mensaje por vos y lo abrimos en WhatsApp Web o la app.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wider text-tinta-suave">
            Nombre *
          </span>
          <input
            type="text"
            required
            value={form.nombre}
            onChange={(e) => set("nombre")(e.target.value)}
            placeholder="Tu nombre"
            className="mt-1.5 w-full border border-arena-osc bg-crema-alt px-3 py-2.5 text-sm placeholder:text-tinta-suave/60 focus:border-terracota focus:outline-none"
          />
        </label>

        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wider text-tinta-suave">
            Teléfono o email
          </span>
          <input
            type="text"
            value={form.contacto}
            onChange={(e) => set("contacto")(e.target.value)}
            placeholder="Para responderte"
            className="mt-1.5 w-full border border-arena-osc bg-crema-alt px-3 py-2.5 text-sm placeholder:text-tinta-suave/60 focus:border-terracota focus:outline-none"
          />
        </label>
      </div>

      <label className="mt-4 block">
        <span className="text-xs font-medium uppercase tracking-wider text-tinta-suave">
          Rubro de interés
        </span>
        <select
          value={form.rubro}
          onChange={(e) => set("rubro")(e.target.value)}
          className="mt-1.5 w-full border border-arena-osc bg-crema-alt px-3 py-2.5 text-sm focus:border-terracota focus:outline-none"
        >
          <option value="">Sin preferencia</option>
          {CATEGORIES.map((c) => (
            <option key={c.slug} value={c.label}>
              {c.label}
            </option>
          ))}
        </select>
      </label>

      <label className="mt-4 block">
        <span className="text-xs font-medium uppercase tracking-wider text-tinta-suave">
          Mensaje *
        </span>
        <textarea
          required
          rows={6}
          value={form.mensaje}
          onChange={(e) => set("mensaje")(e.target.value)}
          placeholder="Contanos qué pieza buscás, medidas, si es para retiro o envío…"
          className="mt-1.5 w-full resize-y border border-arena-osc bg-crema-alt px-3 py-2.5 text-sm placeholder:text-tinta-suave/60 focus:border-terracota focus:outline-none"
        />
      </label>

      {error && (
        <p className="mt-3 border-l-2 border-terracota bg-crema-alt px-3 py-2 text-sm text-terracota">
          {error}
        </p>
      )}

      <button
        type="submit"
        className="mt-5 inline-flex w-full items-center justify-center gap-2 bg-whatsapp px-6 py-3.5 text-sm uppercase tracking-wider text-white transition-colors hover:brightness-95 sm:w-auto"
      >
        <Send className="size-4" /> Abrir WhatsApp con el mensaje
      </button>
    </form>
  );
}
