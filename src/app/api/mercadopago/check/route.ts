import type { NextRequest } from "next/server";
import { getMercadoPagoCredentialSummary, getMercadoPagoEnvironmentWarning } from "@/lib/mercadopago";

type PaymentMethod = {
  id: string | null;
  name: string | null;
  payment_type_id: string | null;
};

export async function GET(_request: NextRequest) {
  const summary = getMercadoPagoCredentialSummary();
  const warning = getMercadoPagoEnvironmentWarning();

  if (!summary.accessTokenConfigured) {
    return new Response(
      JSON.stringify({
        ok: false,
        connection: false,
        environment: summary.environment,
        warning,
        message: "MERCADO_PAGO_ACCESS_TOKEN no está configurado.",
        credentialSummary: summary,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    const response = await fetch("https://api.mercadopago.com/v1/payment_methods", {
      headers: {
        Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return new Response(
        JSON.stringify({
          ok: false,
          connection: false,
          environment: summary.environment,
          warning,
          message: "No se pudo conectar con Mercado Pago.",
          mpStatus: response.status,
          mpStatusText: response.statusText,
          details: data,
          credentialSummary: summary,
        }),
        {
          status: 502,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const methods: PaymentMethod[] = Array.isArray(data)
      ? data.map((method: Record<string, unknown>) => ({
          id: typeof method.id === "string" ? method.id : null,
          name: typeof method.name === "string" ? method.name : null,
          payment_type_id:
            typeof method.payment_type_id === "string"
              ? method.payment_type_id
              : null,
        }))
      : [];

    // Bancos PSE: vienen dentro del payment method "pse" en financial_institutions.
    const pseMethodRaw = Array.isArray(data)
      ? data.find(
          (m: Record<string, unknown>) => m?.id === "pse" || m?.payment_type_id === "bank_transfer"
        )
      : undefined;

    const financialInstitutionsRaw = (pseMethodRaw as Record<string, unknown> | undefined)?.financial_institutions;

    const financialInstitutions = Array.isArray(financialInstitutionsRaw)
      ? financialInstitutionsRaw
      : [];

    const pseMethods: PaymentMethod[] = financialInstitutions.map((fi: Record<string, unknown>) => {
      const id =
        typeof fi.id === "string"
          ? fi.id
          : typeof (fi as Record<string, unknown>).bank_id === "string"
            ? String((fi as Record<string, unknown>).bank_id)
            : null;

      const name =
        typeof fi.name === "string"
          ? fi.name
          : typeof (fi as Record<string, unknown>).description === "string"
            ? String((fi as Record<string, unknown>).description)
            : null;

      return {
        id,
        name,
        payment_type_id: "bank_transfer",
      };
    }).filter((m) => Boolean(m.id) && Boolean(m.name));

    return new Response(
      JSON.stringify({
        ok: true,
        connection: true,
        environment: summary.environment,
        warning,
        methods,
        pseMethods,
        totalMethods: methods.length,
        credentialSummary: summary,
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
        connection: false,
        environment: summary.environment,
        warning,
        message: error instanceof Error ? error.message : String(error),
        credentialSummary: summary,
      }),
      {
        status: 502,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
