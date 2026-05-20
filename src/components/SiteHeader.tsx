"use client";

import { useState } from "react";
import { AccountButton } from "@/components/auth/AccountButton";
import { useCart } from "@/components/cart/CartContext";

function IconButton({
  label,
  children,
  onClick,
  className,
}: {
  label: string;
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={
        "inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors " +
        (className ??
          "border border-foreground/10 bg-background text-foreground/80 hover:bg-foreground/5 hover:text-foreground")
      }
    >
      {children}
    </button>
  );
}

export function SiteHeader({
  collapsed = false,
}: {
  collapsed?: boolean;
}) {
  const { openCart, itemsCount } = useCart();
  const [query, setQuery] = useState("");

  return (
    <header className="sticky top-0 z-50 border-b border-foreground/10 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div
        className={
          "border-b border-foreground/10 bg-foreground/[0.02] " +
          (collapsed ? "hidden" : "")
        }
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2 text-[11px] text-foreground/70 sm:px-6 lg:px-8">
          <p className="line-clamp-1">¿Algún problema con el uso de esta página? (319) 626-2690</p>

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
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                window.location.assign("/");
              }}
              className="flex items-center gap-2"
            >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-orange-500/15 text-orange-600 dark:text-orange-400">
              <span className="text-sm font-semibold">T</span>
            </span>
            <span className="font-semibold tracking-tight">TechStore</span>
          </a>

          <nav className="hidden flex-1 items-center justify-center gap-6 text-xs font-semibold uppercase tracking-wide text-foreground/80 lg:flex">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                window.location.assign("/");
              }}
              className="hover:text-foreground"
            >
              Inicio
            </a>
            <a href="/#categorias" className="hover:text-foreground">
              Categorias
            </a>
          </nav>

          <div
            className={
              "flex items-center gap-2 " + (collapsed ? "hidden" : "")
            }
          >
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

        <div
          className={
            "mt-3 grid gap-2 lg:hidden " + (collapsed ? "hidden" : "")
          }
        >
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
  );
}
