"use client";

import { useEffect, useState } from "react";

import { useCart } from "./CartContext";

function ToastItem({
  id,
  message,
}: {
  id: string;
  message: string;
}) {
  const { dismissToast } = useCart();
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const startClose = window.setTimeout(() => setClosing(true), 2800);
    const remove = window.setTimeout(() => dismissToast(id), 3150);
    return () => {
      window.clearTimeout(startClose);
      window.clearTimeout(remove);
    };
  }, [dismissToast, id]);

  return (
    <div
      className={
        "rounded-3xl border border-foreground/10 bg-background px-4 py-3 text-sm text-foreground shadow-sm transition-all duration-200 " +
        (closing ? "opacity-0 translate-y-1" : "opacity-100 translate-y-0")
      }
      role="status"
      aria-live="polite"
    >
      <p className="text-foreground/90">{message}</p>
    </div>
  );
}

export function ToastHost() {
  const { toasts } = useCart();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed right-4 top-4 z-[70] grid w-[22rem] gap-2">
      {toasts.map((t) => (
        <ToastItem key={t.id} id={t.id} message={t.message} />
      ))}
    </div>
  );
}
