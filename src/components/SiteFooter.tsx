"use client";

import { useEffect, useState } from "react";

type FooterCategory = {
  id: string;
  title: string;
};

export function SiteFooter() {
  const [categories, setCategories] = useState<FooterCategory[]>([]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch("/api/catalog", { cache: "no-store" });
        if (!res.ok) return;
        const json = (await res.json()) as { categories?: unknown };
        const list = Array.isArray(json.categories) ? json.categories : [];

        const parsed: FooterCategory[] = [];
        for (const item of list) {
          if (
            item &&
            typeof item === "object" &&
            "id" in item &&
            "title" in item &&
            typeof (item as any).id === "string" &&
            typeof (item as any).title === "string"
          ) {
            parsed.push({ id: (item as any).id, title: (item as any).title });
          }
        }

        if (!cancelled) setCategories(parsed);
      } catch {
        // Silent: footer should not block the page.
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <footer className="relative overflow-hidden bg-foreground text-white">
      <div className="pointer-events-none absolute inset-0 bg-foreground" />
      <div
        className="pointer-events-none absolute inset-0 opacity-100 mix-blend-screen"
        style={{
          backgroundImage: [
            "radial-gradient(1200px 320px at 50% 122%, rgba(249,115,22,1.00), rgba(249,115,22,0) 68%)",
            "radial-gradient(980px 300px at 50% 124%, rgba(239,68,68,0.42), rgba(239,68,68,0) 74%)",
            "radial-gradient(640px 280px at 28% 120%, rgba(249,115,22,0.36), rgba(249,115,22,0) 70%)",
            "radial-gradient(640px 280px at 72% 120%, rgba(249,115,22,0.30), rgba(249,115,22,0) 70%)",
            "radial-gradient(520px 260px at 50% 116%, rgba(249,115,22,0.18), rgba(249,115,22,0) 72%)",
            "radial-gradient(460px 240px at 10% 86%, rgba(249,115,22,0.20), rgba(249,115,22,0) 70%)",
            "radial-gradient(460px 240px at 90% 86%, rgba(249,115,22,0.16), rgba(249,115,22,0) 70%)",

            "radial-gradient(2px 2px at 14% 72%, rgba(249,115,22,0.95), rgba(249,115,22,0) 62%)",
            "radial-gradient(2px 2px at 18% 78%, rgba(249,115,22,0.78), rgba(249,115,22,0) 62%)",
            "radial-gradient(2px 2px at 24% 70%, rgba(249,115,22,0.88), rgba(249,115,22,0) 62%)",
            "radial-gradient(2px 2px at 30% 82%, rgba(249,115,22,0.72), rgba(249,115,22,0) 62%)",
            "radial-gradient(2px 2px at 64% 74%, rgba(249,115,22,0.84), rgba(249,115,22,0) 62%)",
            "radial-gradient(2px 2px at 70% 80%, rgba(249,115,22,0.70), rgba(249,115,22,0) 62%)",
            "radial-gradient(2px 2px at 78% 72%, rgba(249,115,22,0.92), rgba(249,115,22,0) 62%)",
            "radial-gradient(1.5px 1.5px at 46% 76%, rgba(249,115,22,0.70), rgba(249,115,22,0) 62%)",
            "radial-gradient(1.5px 1.5px at 54% 72%, rgba(249,115,22,0.62), rgba(249,115,22,0) 62%)",
          ].join(", "),
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-black/80" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/55 via-transparent to-black/55" />

      <div className="relative mx-auto max-w-6xl px-4 py-12 text-sm text-white/75 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                window.location.assign("/");
              }}
              className="inline-flex items-center gap-2"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-orange-500/15 text-orange-600 dark:text-orange-400">
                <span className="text-sm font-semibold">T</span>
              </span>
              <span className="font-semibold tracking-tight text-white">TechStore</span>
            </a>
            <p className="mt-3 max-w-md text-white/70">
              Tienda demo de computadores, componentes y accesorios. Catálogo
              claro, responsive y listo para crecer.
            </p>
          </div>

          <div className="lg:col-span-3">
            <p className="font-medium text-white">Categorías</p>
            <div className="mt-3 grid gap-2">
              {categories.length > 0 ? (
                categories.map((c) => (
                  <a
                    key={c.id}
                    className="text-white/75 hover:text-white"
                    href={`/categorias?c=${encodeURIComponent(c.id)}`}
                  >
                    {c.title}
                  </a>
                ))
              ) : (
                <a className="text-white/75 hover:text-white" href="/categorias">
                  Ver categorías
                </a>
              )}
            </div>
          </div>

          <div className="lg:col-span-4">
            <p className="font-medium text-white">Contacto</p>
            <div className="mt-3 grid gap-2 text-white/70">
              <p>Dirección: Calle 93 #15-32, Bogotá, Colombia</p>
              <p>Tel: +57 310 555 1234</p>
              <p>Email: soporte@techstore.com</p>
              <p>Horario: Lun–Sáb 9:00–18:00</p>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-xs text-white/60">
          <p>
            © {new Date().getFullYear()} TechStore. Todos los derechos
            reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
