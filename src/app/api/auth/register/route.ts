import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { AUTH_COOKIE_NAME, authCookieOptions, signAuthToken } from "@/lib/auth";

export const runtime = "nodejs";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { name?: unknown; email?: unknown; password?: unknown }
    | null;

  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (name.length < 2) {
    return NextResponse.json({ error: "Nombre inválido." }, { status: 400 });
  }
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Correo inválido." }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json(
      { error: "La contraseña debe tener al menos 6 caracteres." },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "Este correo ya está registrado." },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  const signed = await signAuthToken({
    userId: user.id,
    name: user.name,
    email: user.email,
  });

  if (!signed) {
    return NextResponse.json(
      { error: "AUTH_SECRET no está configurado en el servidor." },
      { status: 500 }
    );
  }

  const res = NextResponse.json({ user }, { status: 201 });
  res.cookies.set(AUTH_COOKIE_NAME, signed, {
    ...authCookieOptions(),
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
