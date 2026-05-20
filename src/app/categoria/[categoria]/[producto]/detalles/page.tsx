import { notFound } from "next/navigation";

import ProductDetailsClient from "./ProductDetailsClient";

import { prisma } from "@/lib/db";
import type { Category, CategoryId, Product } from "@/lib/catalog";

export default async function ProductDetailsPage({
  params,
}: {
  params:
    | { categoria?: string; producto?: string }
    | Promise<{ categoria?: string; producto?: string }>;
}) {
  const resolvedParams = await Promise.resolve(params);

  const categoryId = resolvedParams?.categoria;
  const productSlug = resolvedParams?.producto;
  if (typeof categoryId !== "string") notFound();
  if (typeof productSlug !== "string") notFound();

  const dbCategory = await prisma.category.findUnique({ where: { key: categoryId } });
  if (!dbCategory) notFound();

  const dbProduct = await prisma.product.findFirst({
    where: { categoryId: dbCategory.id, slug: productSlug },
  });
  if (!dbProduct) notFound();

  const category: Category = {
    id: dbCategory.key as CategoryId,
    title: dbCategory.title,
    description: dbCategory.description,
    image: dbCategory.image,
    anchor: dbCategory.anchor,
  };

  const product: Product = {
    id: dbProduct.id,
    name: dbProduct.name,
    slug: dbProduct.slug,
    description: dbProduct.description,
    priceCOP: dbProduct.priceCOP,
    category: category.id,
    image: dbProduct.image,
    photo: dbProduct.photo ?? undefined,
    badge: dbProduct.badge ?? undefined,
  };

  return (
    <ProductDetailsClient category={category} product={product} />
  );
}
