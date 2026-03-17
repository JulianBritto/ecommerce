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
    <footer className="border-t border-foreground/10 bg-background">
      <div className="mx-auto max-w-6xl px-4 py-12 text-sm text-foreground/70 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <a href="#inicio" className="inline-flex items-center gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-orange-500/15 text-orange-600 dark:text-orange-400">
                <span className="text-sm font-semibold">T</span>
              </span>
              <span className="font-semibold tracking-tight text-foreground">
                TechStore
              </span>
            </a>
            <p className="mt-3 max-w-md text-foreground/70">
              Tienda demo de computadores, componentes y accesorios. Catálogo
              claro, responsive y listo para crecer.
            </p>
          </div>

          <div className="lg:col-span-3">
            <p className="font-medium text-foreground">Categorías</p>
            <div className="mt-3 grid gap-2">
              {categories.length > 0 ? (
                categories.map((c) => (
                  <a
                    key={c.id}
                    className="hover:text-foreground"
                    href={`/categorias?c=${encodeURIComponent(c.id)}`}
                  >
                    {c.title}
                  </a>
                ))
              ) : (
                <a className="hover:text-foreground" href="/categorias">
                  Ver categorías
                </a>
              )}
            </div>
          </div>

          <div className="lg:col-span-4">
            <p className="font-medium text-foreground">Contacto</p>
            <div className="mt-3 grid gap-2 text-foreground/70">
              <p>Dirección: Calle 93 #15-32, Bogotá, Colombia</p>
              <p>Tel: +57 310 555 1234</p>
              <p>Email: soporte@techstore.com</p>
              <p>Horario: Lun–Sáb 9:00–18:00</p>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-foreground/10 pt-6 text-xs text-foreground/60">
          <p>
            © {new Date().getFullYear()} TechStore. Todos los derechos
            reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
