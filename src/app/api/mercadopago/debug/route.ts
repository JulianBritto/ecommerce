import type { NextRequest } from "next/server";

function safeParseJson(value: string) {
  try {
    return JSON.parse(value) as Record<string, unknown>;
  } catch {
    return { raw: value };
  }
}

export async function POST(_request: NextRequest) {
  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  const publicKey = process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY;

  if (!accessToken) {
    return new Response(
      JSON.stringify({
        ok: false,
        tokenValid: false,
        message: "MERCADO_PAGO_ACCESS_TOKEN no está configurado.",
        publicKey: publicKey ? "CONFIGURADO" : "NO CONFIGURADO",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const mpResponse = await fetch("https://api.mercadopago.com/v1/payment_methods", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    const responseText = await mpResponse.text();
    const mpData = responseText ? safeParseJson(responseText) : {};
    const methods = Array.isArray(mpData) ? mpData : [];

    if (!mpResponse.ok) {
      return new Response(
        JSON.stringify({
          ok: false,
          tokenValid: false,
          mpStatus: mpResponse.status,
          mpStatusText: mpResponse.statusText,
          message:
            (typeof mpData.message === "string" && mpData.message) ||
            (typeof mpData.error === "string" && mpData.error) ||
            "Mercado Pago rechazó el token.",
          details: mpData,
          publicKey: publicKey ? "CONFIGURADO" : "NO CONFIGURADO",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        ok: true,
        tokenValid: true,
        mpStatus: mpResponse.status,
        publicKey: publicKey ? "CONFIGURADO" : "NO CONFIGURADO",
        totalMethods: methods.length,
        methods: methods.slice(0, 5).map((method: Record<string, unknown>) => ({
          id: method.id ?? null,
          name: method.name ?? null,
          payment_type_id: method.payment_type_id ?? null,
        })),
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        ok: false,
        tokenValid: false,
        message: error instanceof Error ? error.message : String(error),
      }),
      { status: 502, headers: { "Content-Type": "application/json" } }
    );
  }
}
