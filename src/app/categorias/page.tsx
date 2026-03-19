import Image from "next/image";
import Link from "next/link";
import {
  ChevronRight,
  Cpu,
  Gamepad2,
  Keyboard,
  Laptop,
  PcCase,
} from "lucide-react";
import { ProductGridCard } from "@/components/catalog/ProductGridCard";
import {
  type CategoryId,
  type Product,
} from "@/lib/catalog";
import { prisma } from "@/lib/db";
import type { Category } from "@/lib/catalog";

const CATEGORY_ICON: Record<CategoryId, React.ReactNode> = {
  "pc-gamer": <PcCase size={20} />,
  portatil: <Laptop size={20} />,
  "portatil-gamer": <Gamepad2 size={20} />,
  accesorios: <Keyboard size={20} />,
  componentes: <Cpu size={20} />,
};

function categoriasHref(params: { c: string; q?: string; page?: number }) {
  const sp = new URLSearchParams();
  sp.set("c", params.c);
  if (params.q) sp.set("q", params.q);
  if (params.page) sp.set("page", String(params.page));
  return `/categorias?${sp.toString()}`;
}

function parsePositiveInt(value: unknown): number | null {
  if (typeof value !== "string") return null;
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n)) return null;
  if (n <= 0) return null;
  return n;
}

export default async function CategoriasPage({
  searchParams,
}: {
  searchParams?:
    | { [key: string]: string | string[] | undefined }
    | Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await Promise.resolve(searchParams ?? {});
  const raw = resolvedSearchParams.c;
  const fromQuery = Array.isArray(raw) ? raw[0] : raw;

  const rawPage = resolvedSearchParams.page;
  const pageFromQuery = Array.isArray(rawPage) ? rawPage[0] : rawPage;
  const requestedPage = parsePositiveInt(pageFromQuery) ?? 1;

  const rawQ = resolvedSearchParams.q;
  const qFromQuery = Array.isArray(rawQ) ? rawQ[0] : rawQ;
  const q = typeof qFromQuery === "string" ? qFromQuery.trim() : "";

  const dbCategories = await prisma.category.findMany({
    orderBy: { title: "asc" },
  });
  const categories: Category[] = dbCategories.map((c) => ({
    id: c.key as CategoryId,
    title: c.title,
    description: c.description,
    image: c.image,
    anchor: c.anchor,
  }));

  const isValidCategoryId =
    typeof fromQuery === "string" && categories.some((c) => c.id === fromQuery);
  const selectedId =
    (isValidCategoryId ? fromQuery : categories[0]?.id ?? "pc-gamer") as CategoryId;
  const selected = categories.find((c) => c.id === selectedId) ?? categories[0];

  const selectedDbCategory = dbCategories.find((c) => c.key === selectedId);
  const selectedDbCategoryId = selectedDbCategory?.id ?? 0;

  const dbProducts = await prisma.product.findMany({
    where: { categoryId: selectedDbCategoryId },
    orderBy: { name: "asc" },
  });

  const products: Product[] = dbProducts.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    priceCOP: p.priceCOP,
    category: selectedId,
    image: p.image,
    photo: p.photo ?? undefined,
    badge: p.badge ?? undefined,
  }));

  const filteredProducts = q
    ? products.filter((p) => {
        const needle = q.toLowerCase();
        return (
          p.name.toLowerCase().includes(needle) ||
          p.description.toLowerCase().includes(needle)
        );
      })
    : products;

  const pageSize = 6;
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const currentPage = Math.min(totalPages, Math.max(1, requestedPage));
  const start = (currentPage - 1) * pageSize;
  const pagedProducts = filteredProducts.slice(start, start + pageSize);

  return (
    <div className="bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-foreground/10 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-orange-500/15 text-orange-600 dark:text-orange-400">
                <span className="text-sm font-semibold">T</span>
              </span>
              <span className="font-semibold tracking-tight">TechStore</span>
            </Link>

            <span className="hidden text-sm text-foreground/60 sm:inline">
              <ChevronRight size={16} className="inline" /> Categorías
              {selected ? (
                <>
                  <span className="mx-1">/</span>
                  {selected.title}
                </>
              ) : null}
            </span>
          </div>

          <div className="hidden flex-1 justify-center px-4 lg:flex">
            <form action="/categorias" method="GET" className="w-full max-w-md">
              <input type="hidden" name="c" value={selectedId} />
              <div className="flex h-10 items-center gap-2 rounded-full border border-foreground/10 bg-background px-4">
                <span className="text-foreground/60">⌕</span>
                <input
                  name="q"
                  defaultValue={q}
                  className="w-full bg-transparent text-sm outline-none placeholder:text-foreground/50"
                  placeholder="Buscar en esta categoría..."
                  aria-label="Buscar"
                />
              </div>
            </form>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="rounded-full border border-foreground/10 bg-background px-4 py-2 text-sm text-foreground/80 transition-colors hover:bg-foreground/5 hover:text-foreground"
            >
              Volver
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-screen-2xl px-4 pt-4 sm:px-6 lg:hidden lg:px-10">
          <form action="/categorias" method="GET">
            <input type="hidden" name="c" value={selectedId} />
            <div className="flex h-10 items-center gap-2 rounded-full border border-foreground/10 bg-background px-4">
              <span className="text-foreground/60">⌕</span>
              <input
                name="q"
                defaultValue={q}
                className="w-full bg-transparent text-sm outline-none placeholder:text-foreground/50"
                placeholder="Buscar en esta categoría..."
                aria-label="Buscar"
              />
            </div>
          </form>
        </section>

        <section className="relative overflow-hidden border-b border-foreground/10">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/18 via-foreground/5 to-orange-500/10 [mask-image:radial-gradient(65%_60%_at_50%_35%,#000,transparent)]" />
          <div className="mx-auto max-w-screen-2xl px-4 py-10 sm:px-6 lg:px-10">
            <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              Categorías
            </h1>
            <p className="mt-3 max-w-2xl text-pretty text-sm leading-7 text-foreground/80 sm:text-base">
              Selecciona una categoría a la izquierda y revisa todos sus productos.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-screen-2xl px-4 py-10 sm:px-6 lg:px-10">
          <div className="grid gap-6 lg:grid-cols-12 lg:gap-10">
            <aside className="lg:col-span-3">
              <div className="sticky top-[76px] rounded-3xl border border-foreground/10 bg-background p-4">
                <p className="px-2 py-2 text-sm font-medium text-foreground/70">
                  Categorías
                </p>
                <nav className="grid gap-2">
                  {categories.map((c) => {
                    const isActive = c.id === selectedId;
                    return (
                      <Link
                        key={c.id}
                        href={categoriasHref({ c: c.id, q })}
                        aria-current={isActive ? "page" : undefined}
                        className={
                          "flex items-start gap-3 rounded-2xl border px-4 py-4 transition-colors " +
                          (isActive
                            ? "border-orange-500/30 bg-orange-500/10 text-foreground"
                            : "border-foreground/10 bg-background text-foreground/80 hover:bg-foreground/5 hover:text-foreground")
                        }
                      >
                        <span className={
                          "mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-2xl border bg-background " +
                          (isActive
                            ? "border-orange-500/25 text-orange-600 dark:text-orange-400"
                            : "border-foreground/10 text-foreground/70")
                        }>
                          {CATEGORY_ICON[c.id]}
                        </span>
                        <span className="min-w-0">
                          <span className="block font-medium leading-5">
                            {c.title}
                          </span>
                          <span className="mt-1 block line-clamp-2 text-sm leading-6 text-foreground/70">
                            {c.description}
                          </span>
                        </span>
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </aside>

            <section className="lg:col-span-9">
              <div className="rounded-3xl border border-foreground/10 bg-background">
                <div className="flex flex-col gap-4 border-b border-foreground/10 bg-foreground/[0.02] p-5 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight">
                      {selected?.title}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-foreground/80">
                      {selected?.description}
                    </p>
                  </div>

                  {selected ? (
                    <Image
                      src={selected.image}
                      alt={selected.title}
                      width={360}
                      height={220}
                      className="h-20 w-auto text-foreground"
                    />
                  ) : null}
                </div>

                <div className="p-5">
                  {products.length === 0 ? (
                    <div className="rounded-3xl border border-foreground/10 bg-background p-8 text-sm text-foreground/80">
                      No hay productos en esta categoría.
                    </div>
                  ) : filteredProducts.length === 0 ? (
                    <div className="rounded-3xl border border-foreground/10 bg-background p-8 text-sm text-foreground/80">
                      No hay resultados para “{q}”.
                    </div>
                  ) : (
                    <>
                      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                        {pagedProducts.map((p) => (
                        <ProductGridCard key={p.id} product={p} />
                        ))}
                      </div>

                      {totalPages > 1 ? (
                        <nav
                          className="mt-8 flex flex-wrap items-center justify-center gap-2"
                          aria-label="Paginación"
                        >
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                            (page) => {
                              const isActive = page === currentPage;
                              return (
                                <Link
                                  key={page}
                                  href={categoriasHref({ c: selectedId, q, page })}
                                  aria-current={isActive ? "page" : undefined}
                                  className={
                                    "inline-flex h-10 min-w-10 items-center justify-center rounded-full border px-4 text-sm font-medium transition-colors " +
                                    (isActive
                                      ? "border-orange-500/30 bg-orange-500/10 text-foreground"
                                      : "border-foreground/10 bg-background text-foreground/80 hover:bg-foreground/5 hover:text-foreground")
                                  }
                                >
                                  {page}
                                </Link>
                              );
                            }
                          )}
                        </nav>
                      ) : null}
                    </>
                  )}
                </div>
              </div>
            </section>
          </div>
        </section>
      </main>
    </div>
  );
}
