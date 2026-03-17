"use client";

import Image from "next/image";

import { useCart } from "@/components/cart/CartContext";
import { formatCOP, getProductDetailsHref, type Product } from "@/lib/catalog";

export function ProductGridCard({ product }: { product: Product }) {
  const { addItem } = useCart();

  return (
    <article className="group overflow-hidden rounded-3xl border border-foreground/10 bg-background transition-transform hover:-translate-y-0.5 hover:shadow-sm">
      <div className="relative border-b border-foreground/10 bg-foreground/[0.02] p-4">
        <div className="flex items-center justify-center">
          <Image
            src={product.image}
            alt={product.name}
            width={420}
            height={260}
            className="h-28 w-auto text-foreground transition-transform duration-300 group-hover:scale-[1.03]"
          />
        </div>
      </div>

      <div className="p-4">
        <h3 className="line-clamp-1 font-semibold tracking-tight">
          {product.name}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm leading-6 text-foreground/80">
          {product.description}
        </p>
        <p className="mt-4 text-base font-semibold">{formatCOP(product.priceCOP)}</p>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <a
            href={getProductDetailsHref(product)}
            className="inline-flex h-10 w-full items-center justify-center rounded-full border border-foreground/10 bg-background px-4 text-sm font-medium text-foreground/80 transition-colors hover:bg-foreground/5 hover:text-foreground"
          >
            Más detalles
          </a>
          <button
            type="button"
            onClick={() => addItem(product)}
            className="inline-flex h-10 w-full items-center justify-center rounded-full bg-foreground px-4 text-sm font-medium text-background transition-transform hover:scale-[1.01] active:scale-[0.99]"
          >
            Agregar
          </button>
        </div>
      </div>
    </article>
  );
}
