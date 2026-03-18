"use client";

import { useMemo, useState } from "react";

import { AccountButton } from "@/components/auth/AccountButton";
import { useCart } from "@/components/cart/CartContext";
import { formatCOP, type Category, type Product } from "@/lib/catalog";

export default function ProductDetailsClient({
  category,
  product,
}: {
  category: Category;
  product: Product;
}) {
  const { addItem, openCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [currentSrc, setCurrentSrc] = useState(product.photo ?? product.image);

  const safeQuantity = useMemo(() => {
    if (!Number.isFinite(quantity)) return 1;
    return Math.max(1, Math.floor(quantity));
  }, [quantity]);

  return (
    <div className="bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-foreground/10 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-screen-2xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-10">
          <div className="min-w-0">
            <a href="/" className="flex items-center gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-orange-500/15 text-orange-600 dark:text-orange-400">
                <span className="text-sm font-semibold">T</span>
              </span>
              <span className="font-semibold tracking-tight">TechStore</span>
            </a>
            <p className="mt-1 line-clamp-1 text-sm text-foreground/60">
              <a href="/categorias" className="hover:text-foreground">
                Categorías
              </a>
              <span className="mx-2">/</span>
              <a
                href={`/categorias?c=${category.id}`}
                className="hover:text-foreground"
              >
                {category.title}
              </a>
              <span className="mx-2">/</span>
              <span className="text-foreground/80">Detalles</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <AccountButton />
            <button
              type="button"
              onClick={openCart}
              className="rounded-full border border-foreground/10 bg-background px-4 py-2 text-sm text-foreground/80 transition-colors hover:bg-foreground/5 hover:text-foreground"
            >
              Ver carrito
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-screen-2xl px-4 py-10 sm:px-6 lg:px-10">
          <div className="overflow-hidden rounded-3xl border border-foreground/10 bg-background">
            <div className="grid lg:grid-cols-2">
              <div className="flex items-center justify-center border-b border-foreground/10 bg-foreground/[0.02] p-6 lg:border-b-0 lg:border-r">
                <div className="flex w-full items-center justify-center rounded-3xl border border-foreground/10 bg-background p-6">
                  <img
                    src={currentSrc}
                    alt={product.name}
                    loading="eager"
                    decoding="async"
                    onError={() => {
                      if (currentSrc !== product.image) setCurrentSrc(product.image);
                    }}
                    className="max-h-[420px] w-auto select-none"
                  />
                </div>
              </div>

              <div className="p-6 sm:p-8">
                <p className="text-sm text-foreground/70">{category.title}</p>
                <h1 className="mt-2 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
                  {product.name}
                </h1>

                <p className="mt-4 text-pretty text-sm leading-7 text-foreground/80 sm:text-base">
                  {product.description}
                </p>

                <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
                  <p className="text-3xl font-semibold tracking-tight">
                    {formatCOP(product.priceCOP)}
                  </p>
                  {product.badge ? (
                    <span className="inline-flex items-center rounded-full bg-orange-500/15 px-3 py-1 text-xs font-medium text-orange-600 dark:text-orange-400">
                      {product.badge}
                    </span>
                  ) : null}
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-3">
                    <label
                      htmlFor="qty"
                      className="text-sm font-medium text-foreground/80"
                    >
                      Cantidad
                    </label>
                    <input
                      id="qty"
                      type="number"
                      inputMode="numeric"
                      min={1}
                      step={1}
                      value={safeQuantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="h-11 w-24 rounded-2xl border border-foreground/10 bg-background px-4 text-sm text-foreground outline-none transition-colors focus:border-orange-500/40"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => addItem(product, safeQuantity)}
                    className="inline-flex h-11 flex-1 items-center justify-center rounded-full bg-foreground px-6 text-sm font-medium text-background transition-transform hover:scale-[1.01] active:scale-[0.99]"
                  >
                    Añadir al carrito
                  </button>
                </div>

                <div className="mt-10 rounded-3xl border border-foreground/10 bg-foreground/[0.02] p-5">
                  <p className="text-sm font-medium text-foreground">
                    Detalles del producto
                  </p>
                  <p className="mt-2 text-sm leading-7 text-foreground/80">
                    Compra segura y rápida. Puedes ajustar la cantidad y agregar el producto al carrito para continuar con tu compra.
                  </p>
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <a
                    href={`/categorias?c=${category.id}`}
                    className="inline-flex h-11 flex-1 items-center justify-center rounded-full border border-foreground/10 bg-background px-6 text-sm font-medium text-foreground/80 transition-colors hover:bg-foreground/5 hover:text-foreground"
                  >
                    Volver a {category.title}
                  </a>
                  <a
                    href="/categorias"
                    className="inline-flex h-11 flex-1 items-center justify-center rounded-full border border-foreground/10 bg-background px-6 text-sm font-medium text-foreground/80 transition-colors hover:bg-foreground/5 hover:text-foreground"
                  >
                    Ver todas las categorías
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
