"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  Cpu,
  Gamepad2,
  HardDrive,
  Keyboard,
  Laptop,
  Lock,
  Monitor,
  Mouse,
  PcCase,
  Tag,
  Truck,
  BadgeCheck,
} from "lucide-react";

import { ThemeToggle } from "@/components/ThemeToggle";
import { AccountButton } from "@/components/auth/AccountButton";
import { useCart } from "@/components/cart/CartContext";

import {
  formatCOP,
  getProductDetailsHref,
  type Category,
  type CategoryId,
  type Product,
} from "@/lib/catalog";

const CATEGORY_ICON: Record<CategoryId, React.ReactNode> = {
  "pc-gamer": <PcCase size={22} />,
  portatil: <Laptop size={22} />,
  "portatil-gamer": <Gamepad2 size={22} />,
  accesorios: <Keyboard size={22} />,
  componentes: <Cpu size={22} />,
};

function IconButton({
  label,
  children,
  onClick,
}: {
  label: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-foreground/10 bg-background text-foreground/80 transition-colors hover:bg-foreground/5 hover:text-foreground"
    >
      {children}
    </button>
  );
}

function Badge({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-orange-500/15 px-2 py-1 text-[11px] font-medium text-orange-600 dark:text-orange-400">
      {text}
    </span>
  );
}

function ProductMedia({
  src,
  fallbackSrc,
  alt,
}: {
  src?: string;
  fallbackSrc: string;
  alt: string;
}) {
  const [currentSrc, setCurrentSrc] = useState(src ?? fallbackSrc);

  return (
    <img
      src={currentSrc}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => {
        if (currentSrc !== fallbackSrc) setCurrentSrc(fallbackSrc);
      }}
      className="h-28 w-auto select-none"
    />
  );
}

function ProductCard({
  product,
  categoryTitle,
}: {
  product: Product;
  categoryTitle?: string;
}) {
  const { addItem } = useCart();
  const productIcon =
    product.category === "pc-gamer" ? (
      <PcCase size={28} />
    ) : product.category === "portatil" ? (
      <Laptop size={28} />
    ) : product.category === "portatil-gamer" ? (
      <Gamepad2 size={28} />
    ) : product.name.toLowerCase().includes("monitor") ? (
      <Monitor size={28} />
    ) : product.name.toLowerCase().includes("teclado") ? (
      <Keyboard size={28} />
    ) : product.name.toLowerCase().includes("mouse") ? (
      <Mouse size={28} />
    ) : product.name.toLowerCase().includes("ssd") ? (
      <HardDrive size={28} />
    ) : (
      <Cpu size={28} />
    );

  return (
    <article className="group rounded-3xl border border-foreground/10 bg-background p-4 transition-transform motion-safe:animate-[fadeUp_600ms_ease-out_both] hover:-translate-y-0.5 hover:shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs text-foreground/70">
          {categoryTitle}
        </p>
        <p className="text-sm font-semibold">{formatCOP(product.priceCOP)}</p>
      </div>

      <div className="relative mt-3 overflow-hidden rounded-2xl border border-foreground/10 bg-foreground/[0.03]">
        <div className="absolute left-3 top-3 z-10">
          {product.badge ? <Badge text={product.badge} /> : null}
        </div>
        <div className="flex items-center justify-center p-6 transition-transform duration-300 group-hover:scale-[1.04]">
          <div className="relative">
            <div className="absolute -left-10 -top-10 h-24 w-24 rounded-full bg-orange-500/15 blur-2xl" />
            <div className="absolute -bottom-10 -right-10 h-24 w-24 rounded-full bg-orange-500/10 blur-2xl" />

            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 rounded-2xl bg-foreground/[0.02]" />
              <div className="relative flex items-center justify-center gap-3 rounded-2xl border border-foreground/10 bg-background/60 px-4 py-3 text-foreground/80 backdrop-blur">
                <span className="text-foreground/70">{productIcon}</span>
                <ProductMedia
                  src={product.photo}
                  fallbackSrc={product.image}
                  alt={product.name}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <h3 className="mt-4 line-clamp-1 font-semibold tracking-tight">
        {product.name}
      </h3>
      <p className="mt-1 line-clamp-2 text-sm leading-6 text-foreground/80">
        {product.description}
      </p>

      <div className="mt-4 flex items-center gap-3">
        <a
          href={getProductDetailsHref(product)}
          className="inline-flex h-10 flex-1 items-center justify-center rounded-full border border-foreground/10 bg-background px-4 text-sm font-medium text-foreground/80 transition-colors hover:bg-foreground/5 hover:text-foreground"
        >
          Más detalles
        </a>
        <button
          type="button"
          onClick={() => addItem(product)}
          className="inline-flex h-10 flex-1 items-center justify-center rounded-full bg-foreground px-4 text-sm font-medium text-background transition-transform hover:scale-[1.01] active:scale-[0.99]"
        >
          Agregar
        </button>
      </div>
    </article>
  );
}

export default function Home() {
  const { openCart, itemsCount } = useCart();
  const [query, setQuery] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const heroBgRef = useRef<HTMLDivElement | null>(null);
  const categoriesPopoverRef = useRef<HTMLDivElement | null>(null);
  const closeCategoriesTimerRef = useRef<number | null>(null);
  const [categoriesMenuState, setCategoriesMenuState] = useState<
    "closed" | "open" | "closing"
  >("closed");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch("/api/catalog", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as {
          categories: Category[];
          products: Product[];
        };
        if (cancelled) return;
        setCategories(Array.isArray(json.categories) ? json.categories : []);
        setProducts(Array.isArray(json.products) ? json.products : []);
        setCatalogError(null);
      } catch (e) {
        if (cancelled) return;
        setCatalogError(
          e instanceof Error
            ? e.message
            : "No se pudo cargar el catálogo desde la base de datos."
        );
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const openCategories = () => {
    if (closeCategoriesTimerRef.current) {
      window.clearTimeout(closeCategoriesTimerRef.current);
      closeCategoriesTimerRef.current = null;
    }
    setCategoriesMenuState("open");
  };

  const closeCategories = () => {
    setCategoriesMenuState((prev) => {
      if (prev === "closed") return prev;
      return "closing";
    });

    if (closeCategoriesTimerRef.current) {
      window.clearTimeout(closeCategoriesTimerRef.current);
    }
    closeCategoriesTimerRef.current = window.setTimeout(() => {
      setCategoriesMenuState("closed");
      closeCategoriesTimerRef.current = null;
    }, 160);
  };

  useEffect(() => {
    if (categoriesMenuState !== "open") return;

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const root = categoriesPopoverRef.current;
      if (!root) return;
      const target = event.target as Node | null;
      if (!target) return;
      if (!root.contains(target)) closeCategories();
    };

    document.addEventListener("mousedown", onPointerDown, true);
    document.addEventListener("touchstart", onPointerDown, true);
    return () => {
      document.removeEventListener("mousedown", onPointerDown, true);
      document.removeEventListener("touchstart", onPointerDown, true);
    };
  }, [categoriesMenuState]);

  useEffect(() => {
    return () => {
      if (closeCategoriesTimerRef.current) {
        window.clearTimeout(closeCategoriesTimerRef.current);
        closeCategoriesTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const element = heroBgRef.current;
    if (!element) return;

    const prefersReducedMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    let raf = 0;

    const update = () => {
      const y = window.scrollY || 0;
      const xShift = Math.sin(y / 300) * 12;
      const yShift = Math.min(80, y * 0.18);

      element.style.setProperty("--hero-bg-x", `${xShift.toFixed(2)}px`);
      element.style.setProperty("--hero-bg-y", `${yShift.toFixed(2)}px`);
      raf = 0;
    };

    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  const normalizedQuery = query.trim().toLowerCase();

  const filteredProducts = useMemo(() => {
    if (!normalizedQuery) return products;
    return products.filter((p) => {
      const categoryTitle = categories.find((c) => c.id === p.category)?.title;
      const haystack = `${p.name} ${p.description} ${categoryTitle ?? ""}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [normalizedQuery, products, categories]);

  const menuProductsByCategory = useMemo(() => {
    const map = new Map<CategoryId, Product[]>();
    for (const category of categories) {
      map.set(category.id, []);
    }
    for (const product of products) {
      map.get(product.category)?.push(product);
    }
    return map;
  }, [categories, products]);

  const productsByCategory = useMemo(() => {
    const map = new Map<CategoryId, Product[]>();
    for (const category of categories) {
      map.set(category.id, []);
    }
    for (const product of filteredProducts) {
      map.get(product.category)?.push(product);
    }
    return map;
  }, [filteredProducts, categories]);

  return (
    <div className="bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-foreground/10 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <a href="#inicio" className="flex items-center gap-2">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-orange-500/15 text-orange-600 dark:text-orange-400">
                  <span className="text-sm font-semibold">T</span>
                </span>
                <span className="font-semibold tracking-tight">TechStore</span>
              </a>

              <div
                ref={categoriesPopoverRef}
                className="relative hidden sm:block"
              >
                <button
                  type="button"
                  onClick={() => {
                    if (categoriesMenuState === "open") closeCategories();
                    else openCategories();
                  }}
                  className="cursor-pointer rounded-full border border-foreground/10 bg-background px-4 py-2 text-sm text-foreground/80 transition-colors hover:bg-foreground/5 hover:text-foreground"
                  aria-haspopup="menu"
                  aria-expanded={categoriesMenuState === "open"}
                >
                  <span className="inline-flex items-center gap-2">
                    Categorías
                    <ChevronDown size={16} className="text-foreground/60" />
                  </span>
                </button>

                {categoriesMenuState === "closed" ? null : (
                  <div
                    className={
                      "absolute left-0 mt-2 w-[46rem] overflow-hidden rounded-3xl border border-foreground/10 bg-background p-3 shadow-sm transition-all duration-150 " +
                      (categoriesMenuState === "open"
                        ? "opacity-100 translate-y-0 scale-100"
                        : "pointer-events-none opacity-0 translate-y-1 scale-[0.98]")
                    }
                  >
                    <div className="flex items-center justify-between gap-4 px-2 pb-3">
                      <p className="text-xs font-medium text-foreground/70">
                        Explorar categorías
                      </p>
                      <a
                        href="/categorias"
                        onClick={closeCategories}
                        className="text-xs font-medium text-orange-600 hover:underline dark:text-orange-400"
                      >
                        Ver todas las categorías →
                      </a>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {categories.map((c) => {
                        const items = (menuProductsByCategory.get(c.id) ?? []).slice(
                          0,
                          4
                        );
                        return (
                          <div
                            key={c.id}
                            className="rounded-3xl border border-foreground/10 bg-foreground/[0.02] p-3"
                          >
                            <a
                              href={`/categorias?c=${c.id}`}
                              onClick={closeCategories}
                              className="flex items-start justify-between gap-3 rounded-2xl p-2 transition-colors hover:bg-foreground/5"
                            >
                              <div>
                                <p className="flex items-center gap-2 font-medium text-foreground">
                                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-foreground/10 bg-background text-foreground/80">
                                    {CATEGORY_ICON[c.id]}
                                  </span>
                                  {c.title}
                                </p>
                                <p className="mt-1 text-xs text-foreground/70">
                                  {c.description}
                                </p>
                              </div>
                              <span className="text-sm text-orange-600 dark:text-orange-400">
                                Ver →
                              </span>
                            </a>

                            <div className="mt-2 grid gap-1">
                              {items.map((p) => (
                                <a
                                  key={p.id}
                                  href={`/categorias?c=${c.id}`}
                                  onClick={closeCategories}
                                  className="flex items-center justify-between gap-3 rounded-2xl px-3 py-2 text-sm text-foreground/80 transition-colors hover:bg-foreground/5 hover:text-foreground"
                                >
                                  <span className="line-clamp-1">{p.name}</span>
                                </a>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden lg:block">
                <div className="flex h-10 items-center gap-2 rounded-full border border-foreground/10 bg-background px-4">
                  <span className="text-foreground/60">⌕</span>
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-[26rem] bg-transparent text-sm outline-none placeholder:text-foreground/50"
                    placeholder="Buscar productos, por ejemplo: laptop, SSD, gamer..."
                    aria-label="Buscar"
                  />
                </div>
              </div>

              <ThemeToggle />
              <AccountButton />
              <IconButton label="Mi cesta" onClick={openCart}>
                <span className="relative">
                  <span className="text-sm">🛒</span>
                  {itemsCount > 0 ? (
                    <span className="absolute -right-2 -top-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-[11px] font-semibold text-white">
                      {itemsCount}
                    </span>
                  ) : null}
                </span>
              </IconButton>
            </div>
          </div>

          <div className="mt-3 grid gap-2 lg:hidden">
            <div className="flex h-10 items-center gap-2 rounded-full border border-foreground/10 bg-background px-4">
              <span className="text-foreground/60">⌕</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent text-sm outline-none placeholder:text-foreground/50"
                placeholder="Buscar en el catálogo..."
                aria-label="Buscar"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <a
                  key={c.id}
                  href={`/categorias?c=${c.id}`}
                  className="rounded-full border border-foreground/10 bg-background px-3 py-2 text-xs text-foreground/80 transition-colors hover:bg-foreground/5 hover:text-foreground"
                >
                  {c.title}
                </a>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main id="inicio">
        <section className="relative overflow-hidden border-b border-foreground/10">
          <div
            ref={heroBgRef}
            className="pointer-events-none absolute inset-0"
          >
            <div
              className="absolute inset-0"
              style={{
                transform:
                  "translate3d(var(--hero-bg-x, 0px), var(--hero-bg-y, 0px), 0)",
              }}
            >
              <div
                className="absolute inset-0 bg-center bg-cover bg-no-repeat"
                style={{
                  backgroundImage:
                    "url(/images/hero/hero-tech-light.svg)",
                }}
              />

              <div
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(900px 420px at 30% 25%, rgba(255,255,255,0.75), rgba(255,255,255,0.35) 55%, rgba(255,255,255,0) 75%)",
                }}
              />
            </div>
          </div>

          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-12 lg:px-8">
            <div className="lg:col-span-12">
              <p className="inline-flex items-center rounded-full border border-foreground/10 bg-background px-3 py-1 text-xs text-foreground/80">
                Tienda de computadores · Componentes · Accesorios
              </p>
              <h1 className="mt-5 text-balance text-4xl font-semibold tracking-tight motion-safe:animate-[fadeUp_650ms_ease-out_both] sm:text-5xl">
                Productos de tecnología con una vista clara y responsive.
              </h1>
              <p className="mt-4 max-w-xl text-pretty text-base leading-7 text-foreground/80 motion-safe:animate-[fadeUp_750ms_ease-out_both] sm:text-lg">
                Categorías como computador gamer, portátiles, accesorios y
                componentes. Explora el catálogo y visualiza precio y
                descripción de forma limpia.
              </p>

              <div className="mt-7 flex flex-col gap-3 motion-safe:animate-[fadeUp_850ms_ease-out_both] sm:flex-row">
                <a
                  className="inline-flex h-12 items-center justify-center rounded-full bg-foreground px-6 text-sm font-medium text-background transition-transform hover:scale-[1.02] active:scale-[0.98]"
                  href="#pc-gamer"
                >
                  Ver productos
                </a>
                <a
                  className="inline-flex h-12 items-center justify-center rounded-full border border-foreground/10 bg-background px-6 text-sm font-medium text-foreground transition-colors hover:bg-foreground/5"
                  href="/categorias"
                >
                  Categorías
                </a>
              </div>
            </div>
          </div>
        </section>

        <section id="categorias" className="scroll-mt-24">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between gap-6">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">
                  Categorías principales
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground/80">
                  Entra a cada categoría y mira productos con buena lectura.
                </p>
              </div>
              <p className="hidden text-sm text-foreground/70 sm:block">
                Hover suave y responsive
              </p>
            </div>

            <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {categories.map((category) => (
                <a
                  key={category.id}
                  href={`/categorias?c=${category.id}`}
                  className="group overflow-hidden rounded-3xl border border-foreground/10 bg-background transition-transform hover:-translate-y-0.5"
                >
                  <div className="relative flex items-center justify-center border-b border-foreground/10 bg-foreground/[0.02] p-4">
                    <div className="absolute left-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-foreground/10 bg-background text-foreground/80">
                          {CATEGORY_ICON[category.id]}
                    </div>
                    <Image
                      src={category.image}
                      alt={category.title}
                      width={320}
                      height={200}
                      className="h-24 w-auto text-foreground transition-transform duration-300 group-hover:scale-[1.04]"
                    />
                  </div>
                  <div className="p-4">
                    <p className="font-medium tracking-tight">
                      {category.title}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-foreground/80">
                      {category.description}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        {categories.map((category) => {
          const list = productsByCategory.get(category.id) ?? [];
          if (list.length === 0) return null;

          return (
            <section
              key={category.id}
              id={category.anchor}
              className="scroll-mt-24"
            >
              <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="flex items-end justify-between gap-6">
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight">
                      {category.title}
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground/80">
                      {category.description}
                    </p>
                  </div>
                  <a
                    href={`/categorias?c=${category.id}`}
                    className="hidden text-sm text-orange-600 hover:underline dark:text-orange-400 sm:inline"
                  >
                    Ver más →
                  </a>
                </div>

                <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {list.slice(0, 3).map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      categoryTitle={category.title}
                    />
                  ))}
                </div>

                <div className="mt-6">
                  <a
                    href={`/categorias?c=${category.id}`}
                    className="inline-flex h-11 items-center justify-center rounded-full border border-foreground/10 bg-background px-5 text-sm font-medium text-foreground transition-colors hover:bg-foreground/5"
                  >
                    Ver más de {category.title}
                  </a>
                </div>
              </div>
            </section>
          );
        })}

        <section className="border-t border-foreground/10">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="text-center">
                <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-foreground/10 bg-foreground/[0.03]">
                  <Truck className="text-foreground/80" size={22} />
                </div>
                <h3 className="mt-4 font-semibold tracking-tight">Envíos nacionales</h3>
                <p className="mt-2 text-sm leading-6 text-foreground/70">
                  Entregamos a toda Colombia con seguimiento y empaques
                  protegidos para tecnología.
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-foreground/10 bg-foreground/[0.03]">
                  <BadgeCheck className="text-foreground/80" size={22} />
                </div>
                <h3 className="mt-4 font-semibold tracking-tight">Garantía y soporte</h3>
                <p className="mt-2 text-sm leading-6 text-foreground/70">
                  Productos verificados, asistencia post-venta y recomendaciones
                  para tu compra.
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-foreground/10 bg-foreground/[0.03]">
                  <Tag className="text-foreground/80" size={22} />
                </div>
                <h3 className="mt-4 font-semibold tracking-tight">Ofertas tech</h3>
                <p className="mt-2 text-sm leading-6 text-foreground/70">
                  Precios competitivos en PCs, portátiles, periféricos y
                  componentes para tu setup.
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-foreground/10 bg-foreground/[0.03]">
                  <Lock className="text-foreground/80" size={22} />
                </div>
                <h3 className="mt-4 font-semibold tracking-tight">Pagos seguros</h3>
                <p className="mt-2 text-sm leading-6 text-foreground/70">
                  Compra con confianza: métodos de pago protegidos y confirmación
                  de pedido en tiempo real.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-foreground/10">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="grid gap-4 lg:grid-cols-3">
              <a
                href="#pc-gamer"
                className="group relative overflow-hidden rounded-3xl border border-foreground/10 bg-foreground/[0.02]"
              >
                <div className="absolute inset-0">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-80 dark:from-black/70" />
                </div>
                <div className="relative flex items-center justify-center p-10 sm:p-12">
                  <Image
                    src="/images/products/pc-tower.svg"
                    alt="PC gamer"
                    width={640}
                    height={420}
                    className="h-40 w-auto opacity-95 transition-transform duration-300 group-hover:scale-[1.04]"
                  />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <p className="text-sm font-semibold text-white">Rendimiento sin límites</p>
                  <p className="mt-1 text-sm text-white/85">
                    PCs gamer para jugar y crear con fluidez.
                  </p>
                </div>
              </a>

              <a
                href="/categorias?c=portatil"
                className="group relative overflow-hidden rounded-3xl border border-foreground/10 bg-foreground/[0.02]"
              >
                <div className="absolute inset-0">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-80 dark:from-black/70" />
                </div>
                <div className="relative flex items-center justify-center p-10 sm:p-12">
                  <Image
                    src="/images/products/laptop-creator.svg"
                    alt="Portátiles"
                    width={640}
                    height={420}
                    className="h-40 w-auto opacity-95 transition-transform duration-300 group-hover:scale-[1.04]"
                  />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <p className="text-sm font-semibold text-white">Trabaja desde cualquier lugar</p>
                  <p className="mt-1 text-sm text-white/85">
                    Portátiles para estudio, oficina y creatividad.
                  </p>
                </div>
              </a>

              <a
                href="/categorias?c=accesorios"
                className="group relative overflow-hidden rounded-3xl border border-foreground/10 bg-foreground/[0.02]"
              >
                <div className="absolute inset-0">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-80 dark:from-black/70" />
                </div>
                <div className="relative flex items-center justify-center p-10 sm:p-12">
                  <Image
                    src="/images/products/keyboard.svg"
                    alt="Accesorios"
                    width={640}
                    height={420}
                    className="h-40 w-auto opacity-95 transition-transform duration-300 group-hover:scale-[1.04]"
                  />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <p className="text-sm font-semibold text-white">Setup a tu estilo</p>
                  <p className="mt-1 text-sm text-white/85">
                    Teclados, mouse y periféricos para tu día a día.
                  </p>
                </div>
              </a>
            </div>
          </div>
        </section>
      </main>

      {catalogError ? (
        <div className="fixed bottom-4 left-4 z-50 max-w-[92vw] rounded-2xl border border-foreground/10 bg-background px-4 py-3 text-xs text-foreground/80 shadow-sm">
          <p className="font-medium text-foreground">Catálogo (BD)</p>
          <p className="mt-1 text-foreground/70">{catalogError}</p>
        </div>
      ) : null}
    </div>
  );
}
