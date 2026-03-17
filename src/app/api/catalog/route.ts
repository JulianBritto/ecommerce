import { prisma } from "@/lib/db";
import type { Category, Product, CategoryId } from "@/lib/catalog";

export async function GET() {
  const dbCategories = await prisma.category.findMany({
    orderBy: { title: "asc" },
    include: { products: { orderBy: { name: "asc" } } },
  });

  const categories: Category[] = dbCategories.map((c) => ({
    id: c.key as CategoryId,
    title: c.title,
    description: c.description,
    image: c.image,
    anchor: c.anchor,
  }));

  const products: Product[] = dbCategories.flatMap((c) =>
    c.products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      priceCOP: p.priceCOP,
      category: c.key as CategoryId,
      image: p.image,
      photo: p.photo ?? undefined,
      badge: p.badge ?? undefined,
    }))
  );

  return Response.json({ categories, products });
}
