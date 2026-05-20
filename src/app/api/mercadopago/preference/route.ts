import type { NextRequest } from "next/server";
import { logPreferenceError, logPaymentEvent } from "@/lib/logger";
import {
  getMercadoPagoCredentialSummary,
  getMercadoPagoEnvironmentWarning,
} from "@/lib/mercadopago";

type PayerIdentification = {
  identification?: {
    type?: string;
    number?: string;
  };
  bank_id?: string;
  entity_type?: string;

  // Campos extra típicos requeridos por PSE (Checkout API)
  phone?: {
    area_code?: string;
    number?: string;
  };

  address?: {
    zip_code?: string;
    street_name?: string;
    street_number?: string | null;
    neighborhood?: string;
    city?: string;
    federal_unit?: string;
  };
};

export async function POST(request: NextRequest) {
  const summary = getMercadoPagoCredentialSummary();
  const warning = getMercadoPagoEnvironmentWarning();
  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;

  if (!accessToken) {
    const msg = "MERCADO_PAGO_ACCESS_TOKEN no está configurado.";
    logPreferenceError(msg, { credentialSummary: summary });
    return new Response(
      JSON.stringify({ ok: false, message: msg, credentialSummary: summary }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch (error) {
    const msg = "El cuerpo de la solicitud no es JSON válido.";
    logPreferenceError(
      msg,
      { credentialSummary: summary, warning },
      error instanceof Error ? error : String(error)
    );
    return new Response(JSON.stringify({ ok: false, message: msg, credentialSummary: summary }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const amount = Number(body.amount ?? 0);
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const name = typeof body.name === "string" ? body.name.trim() : "Cliente";
  const description =
    typeof body.description === "string" ? body.description.trim() : "Pago PSE";
  const preferred =
    typeof body.preferred_payment_type === "string" ? body.preferred_payment_type : null;

  const payer = (body.payer && typeof body.payer === "object"
    ? (body.payer as PayerIdentification)
    : null) as PayerIdentification | null;

  const payerIdentification = payer?.identification ?? null;
  const bankId = payer?.bank_id ?? null;

  if (!email || !amount || amount <= 0) {
    const msg = "Email y monto válido son requeridos.";
    logPreferenceError(msg, { email, amount, credentialSummary: summary, warning });
    return new Response(
      JSON.stringify({ ok: false, message: msg, credentialSummary: summary }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const url = new URL(request.url);

  // Importante: en local evitamos usar x-forwarded-* porque pueden venir con el host de ngrok/proxy.
  const protocol = url.protocol.replace(":", "");
  const host = url.host;
  const origin = `${protocol}://${host}`;

  const originUrl = new URL(origin);
  const isLocalOrigin =
    originUrl.hostname === "localhost" || originUrl.hostname === "127.0.0.1";

  // Si estamos en local, forzamos back/redirect a origin (evita depender de ngrok y del reload de env).
  const returnBaseUrl = isLocalOrigin
    ? origin
    : (process.env.MP_RETURN_BASE_URL ?? origin).trim();

  // Si NO es local, exigir https:// (para producción/sandbox pública suele ser necesario).
  if (!isLocalOrigin && !returnBaseUrl.startsWith("https://")) {
    const msg =
      "MP_RETURN_BASE_URL debe ser una URL https:// cuando NO es entorno local.";
    logPreferenceError(msg, { origin, returnBaseUrl, credentialSummary: summary });
    return new Response(JSON.stringify({ ok: false, message: msg }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const items =
    Array.isArray(body.items) && body.items.length > 0
      ? body.items.map((item) => ({
          ...(item as Record<string, unknown>),
          unit_price: Number((item as { unit_price?: unknown }).unit_price ?? 0),
        }))
      : [
          {
            title: description,
            quantity: 1,
            unit_price: amount,
          },
        ];

  const nameParts = name.trim().split(/\s+/);
  const firstName = nameParts[0] || "Cliente";
  const lastName = nameParts.slice(1).join(" ") || " ";

  const payerPayload: Record<string, unknown> = {
    name: firstName,
    surname: lastName,
    email,
  };

  // Para PSE, enviamos los datos que el usuario selecciona:
  // - identificación
  // - banco (PSE / bank_id)
  // - phone/address (para evitar campos vacíos que causan fatal)
  if (preferred === "bank_transfer") {
    payerPayload.entity_type = "individual";

    if (payerIdentification) {
      payerPayload.identification = payerIdentification;
    }
    if (bankId) {
      payerPayload.bank_id = bankId;
    }

    const payerPhone = payer?.phone ?? null;
    if (payerPhone?.area_code && payerPhone?.number) {
      payerPayload.phone = {
        area_code: payerPhone.area_code,
        number: payerPhone.number,
      };
    }

    const payerAddress = payer?.address ?? null;
    if (payerAddress) {
      payerPayload.address = {
        zip_code: payerAddress.zip_code ?? "",
        street_name: payerAddress.street_name ?? "",
        street_number: payerAddress.street_number ?? null,
        neighborhood: payerAddress.neighborhood ?? "",
        city: payerAddress.city ?? "",
        federal_unit: payerAddress.federal_unit ?? "",
      };
    }
  }

  const payload: Record<string, unknown> = {
    items,
    payer: payerPayload,
    back_urls: {
      success: `${returnBaseUrl}/comprobante?status=success`,
      failure: `${returnBaseUrl}/comprobante?status=failure`,
      pending: `${returnBaseUrl}/comprobante?status=pending`,
    },
    redirect_urls: {
      success: `${returnBaseUrl}/comprobante?status=success`,
      failure: `${returnBaseUrl}/comprobante?status=failure`,
      pending: `${returnBaseUrl}/comprobante?status=pending`,
    },
  };

  // Nota: en este proyecto estamos usando PSE mediante preferred_payment_type.
  // Para PSE es necesario enviar también el banco (financial_institutions).
  if (preferred === "bank_transfer") {
    payload.payment_methods = {
      excluded_payment_types: [
        { id: "atm" },
        { id: "ticket" },
        { id: "credit_card" },
        { id: "debit_card" },
        { id: "digital_wallet" },
      ],
      ...(bankId
        ? {
            financial_institutions: [{ id: bankId }],
          }
        : {}),
    };

    // Campos extra típicos para PSE:
    // - transaction_details.financial_institution
    if (bankId) {
      payload.transaction_details = {
        financial_institution: bankId,
      };
    }
  } else if (preferred) {
    payload.payment_methods = {
      excluded_payment_types: [
        { id: "atm" },
        { id: "ticket" },
      ],
    };
  }

  const response = await fetch(
    "https://api.mercadopago.com/checkout/preferences",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    const message =
      typeof data?.message === "string"
        ? data.message
        : "Error al crear la preferencia de pago.";

    logPreferenceError(message, {
      email,
      amount,
      preferred_payment_type: preferred,
      bank_id: bankId,
      statusCode: response.status,
      origin,
      credentialSummary: summary,
      warning,
      payloadSent: JSON.stringify(payload),
      apiResponse: data,
    });

    return new Response(
      JSON.stringify({
        ok: false,
        message,
        warning,
        details: data,
        credentialSummary: summary,
      }),
      {
        status: 502,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const sandboxInitPoint =
    typeof data?.sandbox_init_point === "string"
      ? data.sandbox_init_point
      : null;
  const initPoint =
    typeof data?.init_point === "string" ? data.init_point : null;

  // Seleccionamos el ambiente SOLO por credenciales/config (no por presencia de sandbox_init_point).
  // Esto evita inconsistencias: /conexion puede decir production, pero aquí se infiere sandbox.
  const environment: "sandbox" | "production" =
    summary.environment === "sandbox"
      ? "sandbox"
      : "production";

  const checkoutUrl =
    environment === "sandbox"
      ? sandboxInitPoint ?? initPoint
      : initPoint ?? sandboxInitPoint;

  logPaymentEvent("Preferencia de pago creada exitosamente.", {
    debugLogVersion: "v-payloadSent-1-credEnv",
    email,
    amount,
    preferred_payment_type: preferred,
    bank_id: bankId,
    origin,
    environment,
    credentialSummary: summary,
    preference_id: data?.id,
    init_point: initPoint ? "OK" : "MISSING",
    sandbox_init_point: sandboxInitPoint ? "OK" : "MISSING",
    payloadSent: JSON.stringify(payload),
    payloadBackUrls: (payload as Record<string, unknown>).back_urls ?? null,
    payloadRedirectUrls:
      (payload as Record<string, unknown>).redirect_urls ?? null,
  });

  return new Response(
    JSON.stringify({
      ok: true,
      environment,
      warning,
      init_point: initPoint ?? null,
      sandbox_init_point: sandboxInitPoint ?? null,
      checkout_url: checkoutUrl ?? null,
      preference_id: data?.id,
      cus: data?.id,
      credentialSummary: summary,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}
