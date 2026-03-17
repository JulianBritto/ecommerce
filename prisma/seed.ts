import { PrismaClient } from "@prisma/client";

import { CATEGORIES, PRODUCTS, slugify } from "../src/lib/catalog";

const prisma = new PrismaClient();

async function main() {
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  await prisma.category.createMany({
    data: CATEGORIES.map((c) => ({
      key: c.id,
      title: c.title,
      description: c.description,
      image: c.image,
      anchor: c.anchor,
    })),
  });

  const dbCategories = await prisma.category.findMany({
    select: { id: true, key: true },
  });
  const categoryIdByKey = new Map(dbCategories.map((c) => [c.key, c.id] as const));

  await prisma.product.createMany({
    data: PRODUCTS.map((p) => ({
      id: p.id,
      name: p.name,
      slug: slugify(p.name),
      description: p.description,
      priceCOP: p.priceCOP,
      image: p.image,
      photo: p.photo ?? null,
      badge: p.badge ?? null,
      categoryId: categoryIdByKey.get(p.category) ?? 0,
    })),
  });

  await prisma.product.deleteMany({ where: { categoryId: 0 } });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
