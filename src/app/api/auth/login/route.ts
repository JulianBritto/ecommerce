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
    | { email?: unknown; password?: unknown }
    | null;

  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Correo inválido." }, { status: 400 });
  }
  if (password.length < 1) {
    return NextResponse.json({ error: "Contraseña inválida." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true, passwordHash: true },
  });

  if (!user) {
    return NextResponse.json(
      { error: "Correo o contraseña incorrectos." },
      { status: 401 }
    );
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return NextResponse.json(
      { error: "Correo o contraseña incorrectos." },
      { status: 401 }
    );
  }

  const token = await signAuthToken({
    userId: user.id,
    name: user.name,
    email: user.email,
  });

  if (!token) {
    return NextResponse.json(
      { error: "AUTH_SECRET no está configurado en el servidor." },
      { status: 500 }
    );
  }

  const res = NextResponse.json(
    { user: { id: user.id, name: user.name, email: user.email } },
    { status: 200 }
  );

  res.cookies.set(AUTH_COOKIE_NAME, token, {
    ...authCookieOptions(),
    maxAge: 60 * 60 * 24 * 7,
  });

  return res;
}
