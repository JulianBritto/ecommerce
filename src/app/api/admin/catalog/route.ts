import { prisma } from "@/lib/db";
import type { CategoryId } from "@/lib/catalog";

export const runtime = "nodejs";

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { title: "asc" },
    include: { products: { orderBy: { name: "asc" } } },
  });

  return Response.json({
    categories: categories.map((c) => ({
      id: c.id,
      key: c.key as CategoryId,
      title: c.title,
      description: c.description,
      image: c.image,
      anchor: c.anchor,
      products: c.products.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        priceCOP: p.priceCOP,
        image: p.image,
        photo: p.photo,
        badge: p.badge,
        categoryId: p.categoryId,
      })),
    })),
  });
}
