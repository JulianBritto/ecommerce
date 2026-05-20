import type { NextRequest } from "next/server";
import { writeLog } from "@/lib/logger";
import { getMercadoPagoCredentialSummary } from "@/lib/mercadopago";

function getLogFilename(prefix: string): string {
  const d = new Date().toISOString().split("T")[0];
  return `${prefix}-${d}.log`;
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const preferenceId = url.searchParams.get("preference_id");

  const summary = getMercadoPagoCredentialSummary();
  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;

  const filename = getLogFilename("fatal-inspect");

  if (!preferenceId) {
    const msg = "Falta query param: preference_id";
    writeLog(filename, "ERROR", msg, { preferenceId: null, credentialSummary: summary });
    return new Response(JSON.stringify({ ok: false, message: msg }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!accessToken) {
    const msg = "MERCADO_PAGO_ACCESS_TOKEN no está configurado.";
    writeLog(filename, "ERROR", msg, { preferenceId, credentialSummary: summary });
    return new Response(JSON.stringify({ ok: false, message: msg }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const mpRes = await fetch(`https://api.mercadopago.com/checkout/preferences/${encodeURIComponent(preferenceId)}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      method: "GET",
    });

    const mpData = await mpRes.json().catch(() => ({}));

    if (!mpRes.ok) {
      writeLog(
        filename,
        "ERROR",
        "Error al inspeccionar preference en Mercado Pago",
        {
          preferenceId,
          mpStatus: mpRes.status,
          credentialSummary: summary,
          apiResponse: mpData,
        },
        mpRes.statusText
      );

      return new Response(
        JSON.stringify({
          ok: false,
          message: "Mercado Pago rechazó la consulta de preferencia.",
          status: mpRes.status,
          details: mpData,
        }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    writeLog(filename, "INFO", "Preference inspectada exitosamente.", {
      preferenceId,
      credentialSummary: summary,
      // No guardamos todo el objeto por si trae datos extensos.
      // Solo campos relevantes para sandbox/flujo.
      init_point: typeof mpData?.init_point === "string" ? mpData.init_point : null,
      sandbox_init_point: typeof mpData?.sandbox_init_point === "string" ? mpData.sandbox_init_point : null,
      back_urls: mpData?.back_urls ?? null,
      payer: mpData?.payer ?? null,
      payment_methods: mpData?.payment_methods ?? null,
      external_reference: mpData?.external_reference ?? null,
    });

    return new Response(
      JSON.stringify({
        ok: true,
        preferenceId,
        credentialSummary: summary,
        data: mpData,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    writeLog(filename, "ERROR", "Error inesperado inspeccionando preference.", { preferenceId, credentialSummary: summary }, msg);

    return new Response(
      JSON.stringify({ ok: false, message: "Error inesperado inspeccionando preference.", error: msg }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
