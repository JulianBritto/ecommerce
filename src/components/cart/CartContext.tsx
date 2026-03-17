"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type { Product } from "@/lib/catalog";

export type CartItem = {
  id: string;
  name: string;
  description: string;
  priceCOP: number;
};

type CartLine = {
  item: CartItem;
  quantity: number;
};

type CartContextValue = {
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;

  lines: CartLine[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clear: () => void;

  itemsCount: number;
  totalCOP: number;

  toasts: { id: string; message: string }[];
  pushToast: (message: string) => void;
  dismissToast: (id: string) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function toCartItem(product: Product): CartItem {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    priceCOP: product.priceCOP,
  };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [byId, setById] = useState<Record<string, CartLine>>({});
  const [toasts, setToasts] = useState<{ id: string; message: string }[]>([]);
  const toastTimersRef = useRef<Record<string, number>>({});
  const toastSeqRef = useRef(0);

  const lines = useMemo(() => Object.values(byId), [byId]);

  const itemsCount = useMemo(
    () => lines.reduce((sum, line) => sum + line.quantity, 0),
    [lines]
  );

  const totalCOP = useMemo(
    () => lines.reduce((sum, line) => sum + line.item.priceCOP * line.quantity, 0),
    [lines]
  );

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = toastTimersRef.current[id];
    if (timer) window.clearTimeout(timer);
    delete toastTimersRef.current[id];
  };

  const pushToast = (message: string) => {
    const id = `t_${Date.now()}_${toastSeqRef.current++}`;
    setToasts((prev) => [...prev, { id, message }]);
    const timer = window.setTimeout(() => dismissToast(id), 3200);
    toastTimersRef.current[id] = timer;
  };

  useEffect(() => {
    return () => {
      for (const t of Object.values(toastTimersRef.current)) {
        window.clearTimeout(t);
      }
      toastTimersRef.current = {};
    };
  }, []);

  const value: CartContextValue = useMemo(
    () => ({
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),

      lines,
      addItem: (product, quantity = 1) => {
        const qty = Number.isFinite(quantity) ? Math.max(1, Math.floor(quantity)) : 1;
        const cartItem = toCartItem(product);
        setById((prev) => {
          const existing = prev[cartItem.id];
          const nextQty = (existing?.quantity ?? 0) + qty;
          return {
            ...prev,
            [cartItem.id]: { item: cartItem, quantity: nextQty },
          };
        });

        pushToast(
          `Producto (${product.name}) ha sido agregado al carrito de compras.`
        );
      },
      removeItem: (productId) => {
        setById((prev) => {
          if (!prev[productId]) return prev;
          const { [productId]: _, ...rest } = prev;
          return rest;
        });
      },
      setQuantity: (productId, quantity) => {
        const qty = Number.isFinite(quantity) ? Math.max(0, Math.floor(quantity)) : 0;
        setById((prev) => {
          const existing = prev[productId];
          if (!existing) return prev;
          if (qty === 0) {
            const { [productId]: _, ...rest } = prev;
            return rest;
          }
          return {
            ...prev,
            [productId]: { ...existing, quantity: qty },
          };
        });
      },
      clear: () => setById({}),

      itemsCount,
      totalCOP,

      toasts,
      pushToast,
      dismissToast,
    }),
    [isOpen, lines, itemsCount, totalCOP, toasts]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
