import { SignJWT, jwtVerify, type JWTPayload } from "jose";

export const AUTH_COOKIE_NAME = "techstore_auth";

export type AuthUserPayload = {
  sub: string;
  name: string;
  email: string;
};

function getSecretBytes(): Uint8Array | null {
  const secret = process.env.AUTH_SECRET;
  if (!secret) return null;
  return new TextEncoder().encode(secret);
}

export async function signAuthToken(input: {
  userId: string;
  name: string;
  email: string;
}): Promise<string | null> {
  const secret = getSecretBytes();
  if (!secret) return null;

  return new SignJWT({ name: input.name, email: input.email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setSubject(input.userId)
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyAuthToken(token: string): Promise<AuthUserPayload | null> {
  const secret = getSecretBytes();
  if (!secret) return null;

  try {
    const { payload } = await jwtVerify(token, secret);
    const sub = payload.sub;
    const name = payload.name;
    const email = payload.email;

    if (typeof sub !== "string") return null;
    if (typeof name !== "string") return null;
    if (typeof email !== "string") return null;

    return { sub, name, email };
  } catch {
    return null;
  }
}

export function authCookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: isProd,
    path: "/",
  };
}

export function redactJwtPayload(payload: JWTPayload) {
  return {
    sub: payload.sub,
    name: payload.name,
    email: payload.email,
    exp: payload.exp,
    iat: payload.iat,
  };
}
