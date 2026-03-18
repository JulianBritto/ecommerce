"use client";

import { useEffect, useMemo, useState } from "react";

type AdminProduct = {
  id: string;
  categoryId: number;
  name: string;
  slug: string;
  description: string;
  priceCOP: number;
  image: string;
  photo?: string | null;
  badge?: string | null;
};

type AdminCategory = {
  id: number;
  key: string;
  title: string;
  description: string;
  image: string;
  anchor: string;
  products: AdminProduct[];
};

type AdminCatalogResponse = {
  categories: AdminCategory[];
};

function formatCOP(value: number) {
  try {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${value} COP`;
  }
}

export default function DashboardPage() {
  const [catalog, setCatalog] = useState<AdminCatalogResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [section, setSection] = useState<"categorias" | "productos">(
    "productos"
  );

  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  const [categoryEdits, setCategoryEdits] = useState<
    Record<string, { title: string; description: string }>
  >({});
  const [productEdits, setProductEdits] = useState<
    Record<string, { name: string; description: string; priceCOP: string }>
  >({});

  async function load() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/catalog", { cache: "no-store" });
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as AdminCatalogResponse;
      setCatalog(data);

      const nextCategoryEdits: Record<
        string,
        { title: string; description: string }
      > = {};
      const nextProductEdits: Record<string, { name: string; description: string; priceCOP: string }> = {};

      for (const c of data.categories) {
        nextCategoryEdits[c.key] = { title: c.title ?? "", description: c.description ?? "" };
        for (const p of c.products) {
          nextProductEdits[p.id] = {
            name: p.name ?? "",
            description: p.description ?? "",
            priceCOP: String(p.priceCOP ?? 0),
          };
        }
      }

      setCategoryEdits(nextCategoryEdits);
      setProductEdits(nextProductEdits);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error cargando dashboard");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function saveCategory(key: string) {
    const edit = categoryEdits[key];
    if (!edit) return;

    setSaving(`category:${key}`);
    setSaved(null);
    setError(null);

    try {
      const res = await fetch(`/api/admin/categories/${encodeURIComponent(key)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: edit.title, description: edit.description }),
        }
      );
      if (!res.ok) throw new Error(await res.text());

      setSaved(`category:${key}`);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error guardando categoría");
    } finally {
      setSaving(null);
    }
  }

  async function saveProduct(id: string) {
    const edit = productEdits[id];
    if (!edit) return;

    setSaving(`product:${id}`);
    setSaved(null);
    setError(null);

    const priceNumber = Number(edit.priceCOP);

    try {
      const res = await fetch(`/api/admin/products/${encodeURIComponent(id)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: edit.name,
            description: edit.description,
            priceCOP: Number.isFinite(priceNumber) ? priceNumber : edit.priceCOP,
          }),
        }
      );
      if (!res.ok) throw new Error(await res.text());

      setSaved(`product:${id}`);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error guardando producto");
    } finally {
      setSaving(null);
    }
  }

  const totalProducts = useMemo(() => {
    if (!catalog) return 0;
    return catalog.categories.reduce((acc, c) => acc + c.products.length, 0);
  }, [catalog]);

  const allProducts = useMemo(() => {
    if (!catalog) return [] as Array<AdminProduct & { categoryKey: string; categoryTitle: string }>;
    return catalog.categories.flatMap((c) =>
      c.products.map((p) => ({
        ...p,
        categoryKey: c.key,
        categoryTitle: c.title,
      }))
    );
  }, [catalog]);

  return (
    <main className="bg-background text-foreground">
      <div className="mx-auto w-full max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-3xl border border-foreground/10 bg-background p-4">
              <div className="mb-4 flex items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-medium text-foreground/60">Panel</div>
                  <div className="text-lg font-semibold tracking-tight">Dashboard</div>
                </div>
              </div>

              <nav className="space-y-2">
                <button
                  type="button"
                  onClick={() => setSection("productos")}
                  aria-pressed={section === "productos"}
                  className={
                    "w-full rounded-2xl border px-3 py-3 text-left text-sm font-medium transition-colors " +
                    (section === "productos"
                      ? "border-foreground bg-foreground text-background"
                      : "border-foreground/10 bg-background text-foreground hover:bg-foreground/5")
                  }
                >
                  Productos
                  <div className="mt-1 text-xs font-normal text-foreground/70">
                    {catalog ? `${totalProducts} en total` : ""}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSection("categorias")}
                  aria-pressed={section === "categorias"}
                  className={
                    "w-full rounded-2xl border px-3 py-3 text-left text-sm font-medium transition-colors " +
                    (section === "categorias"
                      ? "border-foreground bg-foreground text-background"
                      : "border-foreground/10 bg-background text-foreground hover:bg-foreground/5")
                  }
                >
                  Categorías
                  <div className="mt-1 text-xs font-normal text-foreground/70">
                    {catalog ? `${catalog.categories.length} en total` : ""}
                  </div>
                </button>
              </nav>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  className="rounded-2xl border border-foreground/10 bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-foreground/5 disabled:opacity-60"
                  onClick={() => void load()}
                  disabled={loading || saving !== null}
                >
                  Recargar
                </button>
                <div className="rounded-2xl border border-foreground/10 bg-background px-3 py-2 text-xs text-foreground/70">
                  {saving ? "Guardando…" : saved ? "Guardado" : "Listo"}
                </div>
              </div>
            </div>
          </aside>

          <section>
            <div className="mb-5">
              <h1 className="text-2xl font-semibold tracking-tight">
                {section === "productos" ? "Productos" : "Categorías"}
              </h1>
              <p className="text-sm text-foreground/70">
                {section === "productos"
                  ? "Edita nombre, descripción y precio (COP)."
                  : "Edita título y descripción."}
              </p>
            </div>

            {error ? (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-500/30 dark:bg-red-950/30 dark:text-red-200">
                {error}
              </div>
            ) : null}

            {loading ? (
              <div className="rounded-3xl border border-foreground/10 bg-background p-6 text-sm text-foreground/80">
                Cargando…
              </div>
            ) : null}

            {!loading && catalog ? (
              section === "categorias" ? (
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                  {catalog.categories.map((c) => {
                    const edit = categoryEdits[c.key] ?? { title: "", description: "" };
                    const isSaving = saving === `category:${c.key}`;
                    const isSaved = saved === `category:${c.key}`;

                    return (
                      <div
                        key={c.key}
                        className="rounded-3xl border border-foreground/10 bg-background p-5"
                      >
                        <div className="mb-4 flex items-start justify-between gap-3">
                          <div>
                            <div className="text-xs font-medium text-foreground/60">
                              key: <span className="text-neutral-700 dark:text-neutral-200">{c.key}</span> · id:{" "}
                              <span className="text-neutral-700 dark:text-neutral-200">{c.id}</span>
                            </div>
                            <div className="text-sm font-semibold">{c.title}</div>
                          </div>
                          <button
                            className="rounded-2xl bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90 disabled:opacity-60"
                            onClick={() => void saveCategory(c.key)}
                            disabled={isSaving}
                          >
                            {isSaving ? "Guardando…" : isSaved ? "Guardado" : "Guardar"}
                          </button>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                          <label className="block">
                            <div className="mb-1 text-xs font-medium text-foreground/70">Título</div>
                            <input
                              className="w-full rounded-2xl border border-foreground/10 bg-background px-3 py-2 text-sm text-foreground outline-none ring-0 focus:border-foreground/20"
                              value={edit.title}
                              onChange={(e) =>
                                setCategoryEdits((prev) => ({
                                  ...prev,
                                  [c.key]: { ...edit, title: e.target.value },
                                }))
                              }
                            />
                          </label>

                          <label className="block">
                            <div className="mb-1 text-xs font-medium text-foreground/70">Descripción</div>
                            <textarea
                              className="min-h-[96px] w-full resize-y rounded-2xl border border-foreground/10 bg-background px-3 py-2 text-sm text-foreground outline-none ring-0 focus:border-foreground/20"
                              value={edit.description}
                              onChange={(e) =>
                                setCategoryEdits((prev) => ({
                                  ...prev,
                                  [c.key]: { ...edit, description: e.target.value },
                                }))
                              }
                            />
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                  {allProducts.map((p) => {
                    const ped =
                      productEdits[p.id] ??
                      ({ name: p.name, description: p.description, priceCOP: String(p.priceCOP) } as const);

                    const pSaving = saving === `product:${p.id}`;
                    const pSaved = saved === `product:${p.id}`;

                    return (
                      <div
                        key={p.id}
                        className="rounded-3xl border border-foreground/10 bg-background p-5"
                      >
                        <div className="mb-4 flex items-start justify-between gap-3">
                          <div>
                            <div className="text-xs text-foreground/60">
                              id: <span className="text-foreground">{p.id}</span> · slug:{" "}
                              <span className="text-foreground">{p.slug}</span>
                            </div>
                            <div className="text-xs text-foreground/60">
                              Categoría: <span className="text-foreground">{p.categoryTitle}</span>
                            </div>
                            <div className="text-sm font-semibold">{p.name}</div>
                            <div className="text-xs text-foreground/60">Actual: {formatCOP(p.priceCOP)}</div>
                          </div>

                          <button
                            className="rounded-2xl bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90 disabled:opacity-60"
                            onClick={() => void saveProduct(p.id)}
                            disabled={pSaving}
                          >
                            {pSaving ? "Guardando…" : pSaved ? "Guardado" : "Guardar"}
                          </button>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <label className="block md:col-span-2">
                            <div className="mb-1 text-xs font-medium text-foreground/70">Nombre</div>
                            <input
                              className="w-full rounded-2xl border border-foreground/10 bg-background px-3 py-2 text-sm text-foreground outline-none ring-0 focus:border-foreground/20"
                              value={ped.name}
                              onChange={(e) =>
                                setProductEdits((prev) => ({
                                  ...prev,
                                  [p.id]: { ...ped, name: e.target.value },
                                }))
                              }
                            />
                          </label>

                          <label className="block">
                            <div className="mb-1 text-xs font-medium text-foreground/70">Precio (COP)</div>
                            <input
                              className="w-full rounded-2xl border border-foreground/10 bg-background px-3 py-2 text-sm text-foreground outline-none ring-0 focus:border-foreground/20"
                              value={ped.priceCOP}
                              onChange={(e) =>
                                setProductEdits((prev) => ({
                                  ...prev,
                                  [p.id]: { ...ped, priceCOP: e.target.value },
                                }))
                              }
                            />
                          </label>

                          <label className="block md:col-span-2">
                            <div className="mb-1 text-xs font-medium text-foreground/70">Descripción</div>
                            <textarea
                              className="min-h-[96px] w-full resize-y rounded-2xl border border-foreground/10 bg-background px-3 py-2 text-sm text-foreground outline-none ring-0 focus:border-foreground/20"
                              value={ped.description}
                              onChange={(e) =>
                                setProductEdits((prev) => ({
                                  ...prev,
                                  [p.id]: { ...ped, description: e.target.value },
                                }))
                              }
                            />
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            ) : null}
          </section>
        </div>
      </div>
    </main>
  );
}
