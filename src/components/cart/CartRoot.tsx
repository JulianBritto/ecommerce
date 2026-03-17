"use client";

import type { ReactNode } from "react";

import { CartDrawer } from "./CartDrawer";
import { CartProvider } from "./CartContext";
import { ToastHost } from "./ToastHost";

export function CartRoot({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      {children}
      <CartDrawer />
      <ToastHost />
    </CartProvider>
  );
}
