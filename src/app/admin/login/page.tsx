"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { KeyRound } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "No se pudo iniciar sesión");
      }
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16">
      <div className="border border-arena bg-crema p-8 sombra-rustica">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center border border-terracota bg-terracota text-crema">
            <KeyRound className="size-5" />
          </span>
          <div>
            <h1 className="font-display text-2xl">Panel interno</h1>
            <p className="text-xs uppercase tracking-wider text-tinta-suave">
              Genitrini Hnos. · Administración
            </p>
          </div>
        </div>

        <form onSubmit={submit} className="mt-7">
          <label className="block">
            <span className="text-xs uppercase tracking-wider text-tinta-suave">
              Contraseña
            </span>
            <input
              type="password"
              autoFocus
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full border border-arena-osc bg-crema-alt px-3 py-2.5 text-sm focus:border-terracota focus:outline-none"
              placeholder="••••••••"
            />
          </label>

          {error && (
            <p className="mt-3 border-l-2 border-terracota bg-crema-alt px-3 py-2 text-sm text-terracota">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-5 w-full bg-terracota px-5 py-3 text-sm uppercase tracking-wider text-crema transition-colors hover:bg-terracota-osc disabled:opacity-60"
          >
            {loading ? "Verificando…" : "Ingresar"}
          </button>
        </form>

        <p className="mt-4 text-[11px] leading-relaxed text-tinta-suave">
          Acceso reservado al personal del negocio. La contraseña se configura en el
          archivo <code className="text-terracota">.env</code> (ADMIN_PASSWORD).
        </p>
      </div>
    </div>
  );
}
