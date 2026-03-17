import { prisma } from "@/lib/db";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ key: string }> }
) {
  const { key } = await context.params;
  const body = (await request.json().catch(() => null)) as
    | { title?: unknown; description?: unknown }
    | null;

  const title = typeof body?.title === "string" ? body.title.trim() : undefined;
  const description =
    typeof body?.description === "string" ? body.description.trim() : undefined;

  if (!title && !description) {
    return new Response("Missing fields", { status: 400 });
  }

  const updated = await prisma.category.update({
    where: { key },
    data: {
      ...(title ? { title } : {}),
      ...(description ? { description } : {}),
    },
  });

  return Response.json({
    id: updated.id,
    key: updated.key,
    title: updated.title,
    description: updated.description,
    image: updated.image,
    anchor: updated.anchor,
  });
}
