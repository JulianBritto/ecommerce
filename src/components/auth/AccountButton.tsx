"use client";

import { User } from "lucide-react";
import { useEffect, useState } from "react";

type MeUser = {
  id: string;
  name: string;
  email: string;
};

async function fetchMe(): Promise<MeUser | null> {
  const res = await fetch("/api/auth/me", { cache: "no-store" });
  if (!res.ok) return null;
  const data = (await res.json().catch(() => null)) as { user?: MeUser | null } | null;
  return data?.user ?? null;
}

export function AccountButton() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [me, setMe] = useState<MeUser | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    const user = await fetchMe();
    setMe(user);
  };

  useEffect(() => {
    void refresh();
  }, []);

  const close = () => {
    setOpen(false);
    setError(null);
    setBusy(false);
    setPassword("");
  };

  const openModal = () => {
    setMode("login");
    setOpen(true);
    setError(null);
  };

  const onSubmit = async () => {
    setBusy(true);
    setError(null);

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const payload =
        mode === "login"
          ? { email, password }
          : { name, email, password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json().catch(() => null)) as { error?: string } | null;

      if (!res.ok) {
        setError(data?.error || "No se pudo completar la operación.");
        return;
      }

      await refresh();
      close();
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setBusy(false);
    }
  };

  const onLogout = async () => {
    setBusy(true);
    setError(null);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      await refresh();
      close();
    } catch {
      setError("No se pudo cerrar sesión.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        aria-label="Mi cuenta"
        onClick={openModal}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-foreground/10 bg-background text-foreground/80 transition-colors hover:bg-foreground/5 hover:text-foreground"
      >
        <User size={18} />
      </button>

      {open ? (
        <div className="fixed inset-0 z-[100]">
          <button
            type="button"
            aria-label="Cerrar"
            onClick={close}
            className="absolute inset-0 h-full w-full bg-foreground/30 backdrop-blur-sm"
          />

          <div className="relative flex min-h-full items-center justify-center p-4">
            <div className="w-full max-w-md rounded-3xl border border-foreground/10 bg-background p-6 text-foreground shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-foreground/70">Cuenta</p>
                  <h2 className="mt-1 text-lg font-semibold tracking-tight">
                    {me ? "Mi sesión" : mode === "login" ? "Iniciar sesión" : "Registrarse"}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={close}
                  className="rounded-full border border-foreground/10 bg-background px-3 py-1 text-sm text-foreground/80 transition-colors hover:bg-foreground/5 hover:text-foreground"
                >
                  Cerrar
                </button>
              </div>

              {me ? (
                <div className="mt-5">
                  <div className="rounded-3xl border border-foreground/10 bg-foreground/[0.02] p-4">
                    <p className="text-sm font-medium">{me.name}</p>
                    <p className="mt-1 text-sm text-foreground/70">{me.email}</p>
                  </div>

                  {error ? (
                    <p className="mt-3 text-sm text-orange-600 dark:text-orange-400">{error}</p>
                  ) : null}

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={onLogout}
                      className="inline-flex h-10 items-center justify-center rounded-full bg-foreground px-4 text-sm font-medium text-background disabled:opacity-60"
                    >
                      Cerrar sesión
                    </button>
                    <button
                      type="button"
                      onClick={close}
                      className="inline-flex h-10 items-center justify-center rounded-full border border-foreground/10 bg-background px-4 text-sm font-medium text-foreground/80 transition-colors hover:bg-foreground/5 hover:text-foreground"
                    >
                      Listo
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-5">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setMode("login")}
                      className={
                        "h-10 rounded-full border px-4 text-sm font-medium transition-colors " +
                        (mode === "login"
                          ? "border-foreground bg-foreground text-background"
                          : "border-foreground/10 bg-background text-foreground/80 hover:bg-foreground/5 hover:text-foreground")
                      }
                    >
                      Iniciar sesión
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode("register")}
                      className={
                        "h-10 rounded-full border px-4 text-sm font-medium transition-colors " +
                        (mode === "register"
                          ? "border-foreground bg-foreground text-background"
                          : "border-foreground/10 bg-background text-foreground/80 hover:bg-foreground/5 hover:text-foreground")
                      }
                    >
                      Registrarse
                    </button>
                  </div>

                  <div className="mt-4 grid gap-3">
                    {mode === "register" ? (
                      <label className="grid gap-1">
                        <span className="text-sm text-foreground/70">Nombre</span>
                        <input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="h-11 rounded-2xl border border-foreground/10 bg-background px-4 text-sm outline-none transition-colors focus:border-orange-500/40"
                          placeholder="Tu nombre"
                        />
                      </label>
                    ) : null}

                    <label className="grid gap-1">
                      <span className="text-sm text-foreground/70">Correo</span>
                      <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        type="email"
                        className="h-11 rounded-2xl border border-foreground/10 bg-background px-4 text-sm outline-none transition-colors focus:border-orange-500/40"
                        placeholder="correo@ejemplo.com"
                      />
                    </label>

                    <label className="grid gap-1">
                      <span className="text-sm text-foreground/70">Contraseña</span>
                      <input
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type="password"
                        className="h-11 rounded-2xl border border-foreground/10 bg-background px-4 text-sm outline-none transition-colors focus:border-orange-500/40"
                        placeholder="••••••••"
                      />
                    </label>

                    {error ? (
                      <p className="text-sm text-orange-600 dark:text-orange-400">{error}</p>
                    ) : null}

                    <button
                      type="button"
                      disabled={busy}
                      onClick={onSubmit}
                      className="inline-flex h-11 items-center justify-center rounded-full bg-foreground px-6 text-sm font-medium text-background transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
                    >
                      {mode === "login" ? "Entrar" : "Crear cuenta"}
                    </button>

                    <p className="text-xs leading-5 text-foreground/60">
                      Tu contraseña se guarda en la base de datos en forma encriptada (hash).
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
