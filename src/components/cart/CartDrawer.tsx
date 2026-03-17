"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";

import { formatCOP } from "@/lib/catalog";
import { useCart } from "./CartContext";

export function CartDrawer() {
  const {
    isOpen,
    closeCart,
    lines,
    totalCOP,
    removeItem,
    setQuantity,
    itemsCount,
  } = useCart();

  const panelRef = useRef<HTMLDivElement | null>(null);
  const [renderState, setRenderState] = useState<"closed" | "open" | "closing">(
    "closed"
  );
  const [removeQtyById, setRemoveQtyById] = useState<Record<string, number>>({});
  const [removeOpenById, setRemoveOpenById] = useState<Record<string, boolean>>(
    {}
  );

  useEffect(() => {
    if (isOpen) {
      setRenderState("open");
      return;
    }

    if (renderState === "open") {
      setRenderState("closing");
      const t = window.setTimeout(() => setRenderState("closed"), 180);
      return () => window.clearTimeout(t);
    }
  }, [isOpen, renderState]);

  useEffect(() => {
    if (renderState !== "open") return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const panel = panelRef.current;
      const target = e.target as Node | null;
      if (!panel || !target) return;
      if (!panel.contains(target)) closeCart();
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown, true);
    document.addEventListener("touchstart", onPointerDown, true);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown, true);
      document.removeEventListener("touchstart", onPointerDown, true);
    };
  }, [closeCart, renderState]);

  const visible = renderState !== "closed";
  const opening = renderState === "open";

  const headerSubtitle = useMemo(() => {
    if (itemsCount === 0) return "Tu carrito está vacío.";
    if (itemsCount === 1) return "1 producto";
    return `${itemsCount} productos`;
  }, [itemsCount]);

  if (!visible) return null;

  return (
    <div
      aria-hidden={!opening}
      className={
        "fixed inset-0 z-[60] transition-all duration-150 " +
        (opening ? "opacity-100" : "pointer-events-none opacity-0")
      }
    >
      <div className="absolute inset-0 bg-foreground/15" />

      <div
        ref={panelRef}
        className={
          "absolute right-0 top-0 h-full w-full max-w-md border-l border-foreground/10 bg-background shadow-sm transition-transform duration-200 " +
          (opening ? "translate-x-0" : "translate-x-full")
        }
        role="dialog"
        aria-label="Carrito de compra"
      >
        <div className="flex h-full flex-col">
          <div className="flex items-start justify-between gap-4 border-b border-foreground/10 p-5">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Carrito</h2>
              <p className="mt-1 text-xs text-foreground/70">{headerSubtitle}</p>
            </div>

            <button
              type="button"
              onClick={closeCart}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-foreground/10 bg-background text-foreground/80 transition-colors hover:bg-foreground/5 hover:text-foreground"
              aria-label="Cerrar carrito"
              title="Cerrar"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-auto p-5">
            {lines.length === 0 ? (
              <div className="rounded-3xl border border-foreground/10 bg-background p-6 text-sm text-foreground/80">
                Aún no has agregado productos.
              </div>
            ) : (
              <div className="grid gap-3">
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
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-foreground/70">
                          {line.item.description}
                        </p>
                      </div>
                      <p className="shrink-0 text-sm font-semibold">
                        {formatCOP(line.item.priceCOP)}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <div className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-background px-3 py-2 text-xs text-foreground/80">
                        <span>Cantidad:</span>
                        <span className="font-semibold">{line.quantity}</span>
                      </div>

                      {line.quantity > 6 ? (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setRemoveOpenById((prev) => ({
                                ...prev,
                                [line.item.id]: true,
                              }));
                              setRemoveQtyById((prev) => ({
                                ...prev,
                                [line.item.id]: prev[line.item.id] ?? 1,
                              }));
                            }}
                            className="inline-flex h-9 items-center justify-center rounded-full border border-foreground/10 bg-background px-4 text-xs font-medium text-foreground/80 transition-colors hover:bg-foreground/5 hover:text-foreground"
                          >
                            Eliminar
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => removeItem(line.item.id)}
                          className="inline-flex h-9 items-center justify-center rounded-full border border-foreground/10 bg-background px-4 text-xs font-medium text-foreground/80 transition-colors hover:bg-foreground/5 hover:text-foreground"
                        >
                          Eliminar
                        </button>
                      )}
                    </div>

                    {line.quantity > 6 && removeOpenById[line.item.id] ? (
                      <div className="mt-3 rounded-3xl border border-foreground/10 bg-foreground/[0.02] p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-xs text-foreground/70">
                            Cantidad a eliminar (máx. {line.quantity})
                          </p>
                          <button
                            type="button"
                            onClick={() =>
                              setRemoveOpenById((prev) => ({
                                ...prev,
                                [line.item.id]: false,
                              }))
                            }
                            className="text-xs font-medium text-foreground/70 hover:text-foreground"
                          >
                            Cancelar
                          </button>
                        </div>

                        <div className="mt-3 flex items-center gap-2">
                          <label className="sr-only" htmlFor={`remove-${line.item.id}`}>
                            Cantidad
                          </label>
                          <input
                            id={`remove-${line.item.id}`}
                            type="number"
                            min={1}
                            max={line.quantity}
                            value={removeQtyById[line.item.id] ?? 1}
                            onChange={(e) => {
                              const value = Math.floor(Number(e.target.value));
                              const safe = Number.isFinite(value)
                                ? Math.min(line.quantity, Math.max(1, value))
                                : 1;
                              setRemoveQtyById((prev) => ({
                                ...prev,
                                [line.item.id]: safe,
                              }));
                            }}
                            className="h-10 w-24 rounded-full border border-foreground/10 bg-background px-4 text-sm text-foreground outline-none"
                          />

                          <button
                            type="button"
                            onClick={() => {
                              const qty = removeQtyById[line.item.id] ?? 1;
                              const toRemove = Math.min(
                                line.quantity,
                                Math.max(1, Math.floor(qty))
                              );
                              const nextQty = line.quantity - toRemove;

                              if (nextQty <= 0) removeItem(line.item.id);
                              else setQuantity(line.item.id, nextQty);

                              setRemoveOpenById((prev) => ({
                                ...prev,
                                [line.item.id]: false,
                              }));
                              setRemoveQtyById((prev) => ({
                                ...prev,
                                [line.item.id]: 1,
                              }));
                            }}
                            className="inline-flex h-10 flex-1 items-center justify-center rounded-full bg-foreground px-4 text-sm font-medium text-background transition-transform hover:scale-[1.01] active:scale-[0.99]"
                          >
                            Eliminar cantidad
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-foreground/10 p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-foreground/80">Total</p>
              <p className="text-lg font-semibold">{formatCOP(totalCOP)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
