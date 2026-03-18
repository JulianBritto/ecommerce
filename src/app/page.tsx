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

  const heroProduct = useMemo(() => {
    return (
      products.find((p) => p.category === "pc-gamer") ??
      products.find((p) => p.category === "portatil-gamer") ??
      products[0] ??
      null
    );
  }, [products]);

  const anchorByCategoryId = useMemo(() => {
    const map = new Map<CategoryId, string>();
    for (const c of categories) map.set(c.id, c.anchor);
    return map;
  }, [categories]);

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
        <div className="border-b border-foreground/10 bg-foreground/[0.02]">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2 text-[11px] text-foreground/70 sm:px-6 lg:px-8">
            <p className="line-clamp-1">
              ¿Algún problema con el uso de esta página? (319) 626-2690
            </p>
            <div className="flex items-center gap-4">
              <a
                href="mailto:ventas@techstore.com"
                className="hidden hover:text-foreground sm:inline"
              >
                ventas@techstore.com
              </a>
              <AccountButton variant="link" />
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <a href="#inicio" className="flex items-center gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-orange-500/15 text-orange-600 dark:text-orange-400">
                <span className="text-sm font-semibold">T</span>
              </span>
              <span className="font-semibold tracking-tight">TechStore</span>
            </a>

            <nav className="hidden flex-1 items-center justify-center gap-6 text-xs font-semibold uppercase tracking-wide text-foreground/80 lg:flex">
              <a href="#inicio" className="hover:text-foreground">
                Inicio
              </a>
              <a
                href={`#${anchorByCategoryId.get("pc-gamer") ?? "pc-gamer"}`}
                className="hover:text-foreground"
              >
                PC para gaming
              </a>
              <a
                href={`#${
                  anchorByCategoryId.get("portatil-gamer") ?? "portatil-gamer"
                }`}
                className="hover:text-foreground"
              >
                ¿Qué vamos a jugar?
              </a>
              <a
                href={`#${anchorByCategoryId.get("portatil") ?? "portatil"}`}
                className="hover:text-foreground"
              >
                PC para trabajo
              </a>
              <a
                href={`#${anchorByCategoryId.get("accesorios") ?? "accesorios"}`}
                className="hover:text-foreground"
              >
                Partes y accesorios
              </a>
            </nav>

            <div className="flex items-center gap-2">
              <div className="hidden lg:block">
                <div className="flex h-10 items-center gap-2 rounded-full border border-foreground/10 bg-background px-4">
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-[18rem] bg-transparent text-sm outline-none placeholder:text-foreground/50"
                    placeholder="Buscar productos"
                    aria-label="Buscar"
                  />
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-white">
                    ⌕
                  </span>
                </div>
              </div>

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
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent text-sm outline-none placeholder:text-foreground/50"
                placeholder="Buscar productos"
                aria-label="Buscar"
              />
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-white">
                ⌕
              </span>
            </div>
          </div>
        </div>
      </header>

      <main id="inicio">
        <section className="relative overflow-hidden bg-foreground text-white">
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
                    "url(/images/hero/17041-4k.jpg)",
                }}
              />

              <div className="absolute inset-0 bg-foreground/45" />
              <div className="absolute inset-0 bg-gradient-to-r from-foreground/85 via-foreground/55 to-foreground/20" />
            </div>
          </div>

          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-12 lg:px-8">
            <div className="lg:col-span-7">
              <p className="text-xs font-semibold uppercase tracking-wide text-white">
                El poder
              </p>
              <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                TechStore
                <span className="block text-white">PC Gamer Ultra</span>
              </h1>

              <ul className="mt-5 grid gap-2 text-sm leading-6 text-white">
                <li>• Productos listos para usar y con buena lectura.</li>
                <li>• Diseñado para gaming, trabajo y creadores.</li>
                <li>• Configurado, probado y optimizado.</li>
              </ul>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                <a
                  className="inline-flex h-12 items-center justify-center rounded-full bg-orange-500 px-6 text-sm font-medium text-white transition-transform hover:scale-[1.02] active:scale-[0.98]"
                  href={heroProduct ? getProductDetailsHref(heroProduct) : "#pc-gamer"}
                >
                  Ver producto
                </a>
                {heroProduct ? (
                  <p className="text-3xl font-semibold tracking-tight text-white">
                    {formatCOP(heroProduct.priceCOP)}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md overflow-hidden rounded-3xl border border-background/15 bg-background/10 p-6 backdrop-blur">
                <div className="flex items-center justify-center">
                  <ProductMedia
                    src={heroProduct?.photo ?? heroProduct?.image}
                    fallbackSrc="/images/products/pc-tower.svg"
                    alt={heroProduct?.name ?? "PC"}
                  />
                </div>
                {heroProduct ? (
                  <div className="mt-5">
                    <p className="text-sm font-medium">{heroProduct.name}</p>
                    <p className="mt-1 text-sm text-white">
                      {heroProduct.description}
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-foreground text-white">
          <div
            className="absolute inset-0 bg-center bg-cover bg-no-repeat opacity-85"
            style={{ backgroundImage: "url(/images/hero/17041-4k.jpg)" }}
          />
          <div className="absolute inset-0 bg-foreground/45" />
          <div className="absolute inset-0 bg-gradient-to-b from-foreground/55 via-foreground/55 to-foreground/70" />

          <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="text-sm font-medium text-white">
                Somos los #1 en
              </p>
              <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
                PC PARA GAMING
              </h2>
              <p className="mx-auto mt-4 max-w-3xl text-pretty text-sm leading-7 text-white sm:text-base">
                Llevamos años armando equipos para gaming, creadores y trabajo. Elige un nivel y mira opciones listas para comprar.
              </p>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  title: "PC Gamer Básico",
                  desc: "Ideal para empezar con buenos FPS.",
                  img: "/images/products/pc-tower.svg",
                },
                {
                  title: "PC Pro Gamer",
                  desc: "Balance perfecto para jugar y crear.",
                  img: "/images/products/gpu.svg",
                },
                {
                  title: "PC Ultra Gamer",
                  desc: "Más potencia para competir al siguiente nivel.",
                  img: "/images/products/ssd.svg",
                },
                {
                  title: "PC Extreme Gamer",
                  desc: "Para quienes van al máximo sin límites.",
                  img: "/images/products/monitor.svg",
                },
              ].map((card) => (
                <div
                  key={card.title}
                  className="overflow-hidden rounded-3xl border border-background/15 bg-background/10 backdrop-blur"
                >
                  <div className="flex items-center justify-center border-b border-background/15 bg-background/5 p-6">
                    <Image
                      src={card.img}
                      alt={card.title}
                      width={360}
                      height={240}
                      className="h-32 w-auto opacity-90"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold tracking-tight">
                      {card.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-white">
                      {card.desc}
                    </p>
                    <div className="mt-6">
                      <a
                        href="/categorias?c=pc-gamer"
                        className="inline-flex h-11 items-center justify-center rounded-full bg-orange-500 px-6 text-sm font-medium text-white transition-transform hover:scale-[1.02] active:scale-[0.98]"
                      >
                        Ver más
                      </a>
                    </div>
                  </div>
                </div>
              ))}
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
                    className="text-sm text-orange-600 hover:underline dark:text-orange-400"
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
