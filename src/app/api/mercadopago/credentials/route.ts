import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const publicKey = process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY ?? null;
  const hasAccessToken = Boolean(process.env.MERCADO_PAGO_ACCESS_TOKEN);

  return new Response(
    JSON.stringify({ ok: true, publicKey, hasAccessToken }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}
