"use client";

import { useState } from "react";

type PaymentMethod = {
  id: string | null;
  name: string | null;
  payment_type_id: string | null;
};

type CredentialSummary = {
  publicKeyConfigured: boolean;
  accessTokenConfigured: boolean;
  publicKeyPrefix: string | null;
  accessTokenPrefix: string | null;
  environment: "sandbox" | "production" | "mixed" | "unknown";
  forcedMode: "sandbox" | "production" | null;
  isMixed: boolean;
};

type MercadopagoCheckResponse = {
  ok: boolean;
  connection: boolean;
  environment?: CredentialSummary["environment"];
  warning?: string | null;
  message?: string;
  methods?: PaymentMethod[];
  pseMethods?: PaymentMethod[];
  totalMethods?: number;
  credentialSummary?: CredentialSummary;
  mpStatus?: number;
  mpStatusText?: string;
  details?: unknown;
};

type MercadopagoCredentialsResponse = {
  ok: boolean;
  publicKey: string | null;
  hasAccessToken: boolean;
};

const expectedMethods = [
  { key: "credit_card", label: "Tarjetas (crédito/débito)" },
  { key: "debit_card", label: "Tarjetas débito" },
  { key: "bank_transfer", label: "PSE (transferencia bancaria)" },
  { key: "atm", label: "ATM" },
  { key: "ticket", label: "Boleto / Ticket" },
  { key: "digital_wallet", label: "Billeteras digitales" },
] as const;

export default function ConnectionPanel() {
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [environment, setEnvironment] = useState<CredentialSummary["environment"]>("unknown");
  const [hasAccessToken, setHasAccessToken] = useState<boolean | null>(null);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [methods, setMethods] = useState<PaymentMethod[]>([]);

  const check = async () => {
    setChecking(true);
    setStatus(null);
    setWarning(null);

    try {
      const [respCheck, respCred] = await Promise.all([
        fetch("/api/mercadopago/check"),
        fetch("/api/mercadopago/credentials"),
      ]);

      const dataCheck = (await respCheck.json().catch(() => null)) as
        | MercadopagoCheckResponse
        | null;
      const dataCred = (await respCred.json().catch(() => null)) as
        | MercadopagoCredentialsResponse
        | null;

      setHasAccessToken(Boolean(dataCred?.hasAccessToken));
      setPublicKey(dataCred?.publicKey ?? null);
      setEnvironment(
        dataCheck?.environment ?? dataCheck?.credentialSummary?.environment ?? "unknown"
      );
      setWarning(dataCheck?.warning ?? null);

      if (!respCheck.ok || !dataCheck?.ok) {
        setStatus(
          `Error al verificar conexión: ${dataCheck?.message ?? respCheck.statusText}`
        );
        setMethods([]);
        return;
      }

      setStatus(`Conexión exitosa. Métodos detectados: ${dataCheck.totalMethods ?? 0}`);
      setMethods(dataCheck.methods ?? []);
    } catch (err) {
      setStatus(`Error: ${String(err)}`);
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Conexión a Mercado Pago</h2>
        <p className="mt-2 text-sm text-foreground/70">
          Verifica credenciales, ambiente y métodos disponibles antes de usar el checkout.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl border border-foreground/10 bg-foreground/[0.03] p-4">
          <p className="text-sm font-semibold text-foreground">Estado de conexión</p>
          <p className="mt-2 text-sm text-foreground/80">
            Presiona para verificar la conexión con la API de Mercado Pago.
          </p>

          <button
            type="button"
            onClick={check}
            disabled={checking}
            className="mt-4 inline-flex h-12 items-center justify-center rounded-full bg-foreground px-5 text-sm font-medium text-background transition-colors hover:bg-foreground/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {checking ? "Verificando…" : "Verificar conexión"}
          </button>

          {status ? (
            <p className="mt-3 rounded-3xl border border-foreground/10 bg-background p-3 text-sm text-foreground/80">
              {status}
            </p>
          ) : null}

          {warning ? (
            <p className="mt-3 rounded-3xl border border-orange-500/20 bg-orange-500/10 p-3 text-sm text-orange-700">
              {warning}
            </p>
          ) : null}

          <p className="mt-3 text-sm text-foreground/80">
            Ambiente detectado: <span className="font-medium">{environment}</span>
          </p>
        </div>

        <div className="rounded-3xl border border-foreground/10 bg-foreground/[0.03] p-4">
          <p className="text-sm font-semibold text-foreground">Credenciales</p>

          <div className="mt-3 space-y-2 text-sm text-foreground/70">
            <p>Public Key: {publicKey ?? "No configurada"}</p>
            <p>
              Access Token:{" "}
              {hasAccessToken === null ? "—" : hasAccessToken ? "Configurado" : "No configurado"}
            </p>
          </div>

          <div className="mt-4 rounded-2xl border border-foreground/10 bg-background p-3 text-sm text-foreground/80">
            <p className="font-medium text-foreground">Regla de uso</p>
            <p className="mt-1">No mezcles TEST con APP_USR. Ambos tokens deben ser del mismo entorno.</p>
          </div>
        </div>
      </div>

      {methods.length > 0 ? (
        <div className="rounded-3xl border border-foreground/10 bg-foreground/[0.03] p-4">
          <p className="text-sm font-semibold text-foreground">Métodos detectados</p>

          <ul className="mt-3 space-y-2">
            {expectedMethods.map((method) => {
              const available = methods.some(
                (item) => item.payment_type_id === method.key
              );
              const found = methods.find((item) => item.payment_type_id === method.key);

              return (
                <li key={method.key} className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm text-foreground">{method.label}</p>
                    <p className="text-xs text-foreground/70">
                      {found?.name ?? "No disponible"}
                    </p>
                  </div>

                  <div className={available ? "font-semibold text-green-600" : "font-semibold text-red-600"}>
                    {available ? "✓" : "✕"}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      <div className="text-sm text-foreground/70">
        <p>
          La página de checkout usa estos datos para bloquear ambientes mezclados y mostrar errores claros.
        </p>
      </div>
    </div>
  );
}
