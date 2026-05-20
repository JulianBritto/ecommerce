import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { writeLog } from "@/lib/logger";
import { getMercadoPagoCredentialSummary } from "@/lib/mercadopago";

function mapMpStatusToTransactionStatus(mpStatus: unknown): string | null {
  if (!mpStatus) return null;

  const normalized = String(mpStatus).toLowerCase();

  // Approved-like
  if (
    normalized === "approved" ||
    normalized === "paid" ||
    normalized === "succeeded" ||
    normalized === "authorized" ||
    normalized === "success"
  ) {
    return "approved";
  }

  // Failure-like
  if (
    normalized === "rejected" ||
    normalized === "failed" ||
    normalized === "failure" ||
    normalized === "cancelled" ||
    normalized === "canceled"
  ) {
    return "failed";
  }

  if (normalized === "pending") return "pending";

  // Sometimes MP returns a composite/string
  if (normalized.includes("pending")) return "pending";
  if (normalized.includes("fail") || normalized.includes("reject") || normalized.includes("cancel")) {
    return "failed";
  }
  if (normalized.includes("approv") || normalized.includes("paid") || normalized.includes("success")) {
    return "approved";
  }

  return null;
}

export async function GET(_request: NextRequest) {
  const summary = getMercadoPagoCredentialSummary();
  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;

  if (!accessToken) {
    return new Response(
      JSON.stringify({ ok: false, message: "MERCADO_PAGO_ACCESS_TOKEN no está configurado." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const filename = `transactions-sync-${new Date().toISOString().split("T")[0]}.log`;

  try {
    const pendingTransactions = await prisma.transaction.findMany({
      where: { status: "pending" },
      orderBy: { transactionDate: "desc" },
      take: 25,
    });

    if (pendingTransactions.length === 0) {
      return new Response(JSON.stringify({ ok: true, updated: 0, checked: 0 }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    let updated = 0;

    // Sequential to keep logs readable and avoid rate-limit spikes.
    for (const t of pendingTransactions) {
      const preferenceId = t.cus;

      try {
        const mpRes = await fetch(
          `https://api.mercadopago.com/checkout/preferences/${encodeURIComponent(preferenceId)}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        const mpData: unknown = await mpRes.json().catch(() => ({}));

        if (!mpRes.ok) {
          writeLog(
            filename,
            "ERROR",
            "Mercado Pago rechazó inspección de preference (sync).",
            { preferenceId, mpStatus: mpRes.status, credentialSummary: summary }
          );
          continue;
        }

        // mpData is expected to be object. Inspect likely status fields,
        // but also try nested payment fields (payments[], last_payment, etc.)
        const mpAny = (typeof mpData === "object" && mpData !== null ? mpData : {}) as Record<string, unknown>;

        const paymentsVal = mpAny.payments ?? mpAny.charges ?? null;
        const lastPaymentVal = mpAny.last_payment ?? mpAny.lastPayment ?? null;

        const topStatus =
          (mpAny.status as string | undefined) ??
          (mpAny.payment_status as string | undefined) ??
          (mpAny.status_detail as string | undefined) ??
          (mpAny.status_code as string | undefined) ??
          (mpAny.collection_status as string | undefined) ??
          null;

        const paymentStatuses: string[] = [];
        if (Array.isArray(paymentsVal)) {
          for (const p of paymentsVal) {
            if (!p || typeof p !== "object") continue;
            const po = p as Record<string, unknown>;
            const s =
              (po.status as string | undefined) ??
              (po.payment_status as string | undefined) ??
              (po.status_detail as string | undefined) ??
              (po.status_code as string | undefined) ??
              null;
            if (s) paymentStatuses.push(String(s));
          }
        }

        let lastPaymentStatus: string | null = null;
        if (lastPaymentVal && typeof lastPaymentVal === "object") {
          const lp = lastPaymentVal as Record<string, unknown>;
          lastPaymentStatus =
            (lp.status as string | undefined) ??
            (lp.payment_status as string | undefined) ??
            (lp.status_detail as string | undefined) ??
            (lp.status_code as string | undefined) ??
            (lp.collection_status as string | undefined) ??
            null;
        }

        const mpStatus =
          topStatus ??
          lastPaymentStatus ??
          paymentStatuses[0] ??
          null;

        const mpStatusDebug = {
          topStatus,
          lastPaymentStatus,
          paymentStatuses: paymentStatuses.slice(0, 10),
          hasPayments: Array.isArray(paymentsVal),
          paymentsCount: Array.isArray(paymentsVal) ? paymentsVal.length : 0,
        };

        const mapped = mapMpStatusToTransactionStatus(mpStatus);

        if (!mapped) {
          // Keep pending if we can't map reliably
          writeLog(
            filename,
            "WARN",
            "No se pudo mapear estado MP (sync) — manteniendo status.",
            { preferenceId, mpStatus, credentialSummary: summary }
          );
          continue;
        }

        if (mapped !== t.status) {
          await prisma.transaction.update({
            where: { id: t.id },
            data: {
              status: mapped,
              statusReceivedAt: new Date(),
            },
          });
          updated += 1;
        }
      } catch (err) {
        writeLog(
          filename,
          "ERROR",
          "Error sincronizando transacción (sync).",
          { transactionId: t.id, preferenceId: t.cus, credentialSummary: summary },
          err instanceof Error ? err : String(err)
        );
      }
    }

    return new Response(
      JSON.stringify({
        ok: true,
        updated,
        checked: pendingTransactions.length,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        ok: false,
        message: "Error al sincronizar transacciones.",
        error: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
