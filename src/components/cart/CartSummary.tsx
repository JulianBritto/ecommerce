"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, X } from "lucide-react";

import { formatCOP } from "@/lib/catalog";
import { useCart } from "./CartContext";

export function CartSummary() {
  const { lines, itemsCount, totalCOP, openCart } = useCart();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const title = useMemo(() => {
    if (itemsCount === 0) return "Carrito vacío";
    if (itemsCount === 1) return "1 producto en el carrito";
    return `${itemsCount} productos en el carrito`;
  }, [itemsCount]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (!containerRef.current || !target) return;
      if (!containerRef.current.contains(target)) {
        setIsOpen(false);
      }
    };

    if (!isOpen) return;

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-background px-4 py-2 text-sm text-foreground/80 transition-colors hover:bg-foreground/5 hover:text-foreground"
      >
        <ShoppingBag size={18} />
        <span>Carrito</span>
        {itemsCount > 0 ? (
          <span className="inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-orange-500 px-2 text-xs font-semibold text-background">
            {itemsCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-full z-20 mt-3 w-[24rem] rounded-3xl border border-foreground/10 bg-background p-4 shadow-lg">
          <div className="flex items-center justify-between gap-3 border-b border-foreground/10 pb-3">
            <div>
              <p className="text-sm font-semibold text-foreground">{title}</p>
              <p className="mt-1 text-xs leading-5 text-foreground/70">
                Revisa tus productos antes de continuar.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-foreground/10 bg-background text-foreground/80 transition-colors hover:bg-foreground/5 hover:text-foreground"
              aria-label="Cerrar resumen de carrito"
            >
              <X size={16} />
            </button>
          </div>

          {lines.length === 0 ? (
            <div className="mt-4 rounded-3xl border border-foreground/10 bg-foreground/[0.02] p-4 text-sm text-foreground/70">
              Aún no has agregado productos.
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {lines.map((line) => (
                <div
                  key={line.item.id}
                  className="rounded-3xl border border-foreground/10 bg-background p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="line-clamp-1 font-medium text-foreground">
                        {line.item.name}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-foreground/70">
                        {line.quantity} × {formatCOP(line.item.priceCOP)}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-foreground">
                      {formatCOP(line.item.priceCOP * line.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 rounded-3xl border border-foreground/10 bg-foreground/[0.02] p-4">
            <div className="flex items-center justify-between gap-3 text-sm text-foreground/80">
              <span>Total</span>
              <span className="font-semibold text-foreground">{formatCOP(totalCOP)}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                openCart();
              }}
              className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-foreground px-4 py-3 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
            >
              Ver carrito completo
            </button>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  router.push('/checkout');
                }}
                className="mt-3 inline-flex w-full items-center justify-center rounded-full border border-foreground/10 bg-background px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-foreground/5"
              >
                Ir al formulario de compra
              </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
