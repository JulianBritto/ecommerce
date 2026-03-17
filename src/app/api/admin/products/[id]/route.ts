import { prisma } from "@/lib/db";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  if (!id) return new Response("Invalid id", { status: 400 });

  const body = (await request.json().catch(() => null)) as
    | { name?: unknown; description?: unknown; priceCOP?: unknown }
    | null;

  const name = typeof body?.name === "string" ? body.name.trim() : undefined;
  const description =
    typeof body?.description === "string" ? body.description.trim() : undefined;

  let priceCOP: number | undefined;
  if (typeof body?.priceCOP === "number") {
    priceCOP = body.priceCOP;
  } else if (typeof body?.priceCOP === "string") {
    const parsed = Number(body.priceCOP);
    if (Number.isFinite(parsed)) priceCOP = parsed;
  }

  if (!name && !description && priceCOP === undefined) {
    return new Response("Missing fields", { status: 400 });
  }

  if (priceCOP !== undefined && (!Number.isFinite(priceCOP) || priceCOP < 0)) {
    return new Response("Invalid price", { status: 400 });
  }

  const updated = await prisma.product.update({
    where: { id },
    data: {
      ...(name ? { name } : {}),
      ...(description ? { description } : {}),
      ...(priceCOP !== undefined ? { priceCOP } : {}),
    },
    select: {
      id: true,
      categoryId: true,
      name: true,
      slug: true,
      description: true,
      priceCOP: true,
      image: true,
      photo: true,
      badge: true,
    },
  });

  return Response.json(updated);
}
