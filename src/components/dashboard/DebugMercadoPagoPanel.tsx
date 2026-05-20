"use client";

import { useEffect, useState } from "react";

type DebugResult = {
  ok?: boolean;
  tokenValid?: boolean;
  userId?: string;
  email?: string;
  type?: string;
  accountStatus?: string;
  status?: string;
  message?: string;
};

export default function DebugMercadoPagoPanel() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DebugResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheckToken = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/mercadopago/debug", {
        method: "POST",
      });

      const data = (await response.json()) as DebugResult;
      setResult(data);

      if (!response.ok) {
        setError(data.message || "Error al verificar token");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleCheckToken();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Debug Mercado Pago</h2>
        <p className="mt-2 text-sm text-foreground/70">
          Verifica la configuración y validez del token de acceso.
        </p>
      </div>

      <div className="rounded-3xl border border-foreground/10 bg-background p-6 space-y-6">
        {loading && !result ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
            <p className="mt-4 text-foreground/70">Verificando...</p>
          </div>
        ) : null}

        {error ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p className="font-semibold">Error</p>
            <p className="mt-1">{error}</p>
          </div>
        ) : null}

        {result ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-foreground/10 p-4">
              <p className="text-xs font-medium text-foreground/60 uppercase">
                Estado del Token
              </p>
              <p className="mt-2 text-2xl font-bold">
                {result.tokenValid ? (
                  <span className="text-green-600">✓ Válido</span>
                ) : (
                  <span className="text-red-600">✗ Inválido</span>
                )}
              </p>
            </div>

            {result.userId ? (
              <>
                <div className="rounded-2xl border border-foreground/10 p-4">
                  <p className="text-xs font-medium text-foreground/60 uppercase">ID Usuario</p>
                  <p className="mt-2 font-mono text-foreground">{result.userId}</p>
                </div>

                <div className="rounded-2xl border border-foreground/10 p-4">
                  <p className="text-xs font-medium text-foreground/60 uppercase">Email</p>
                  <p className="mt-2 text-foreground">{result.email}</p>
                </div>

                <div className="rounded-2xl border border-foreground/10 p-4">
                  <p className="text-xs font-medium text-foreground/60 uppercase">Tipo de Cuenta</p>
                  <p className="mt-2 text-foreground">{result.type}</p>
                </div>

                <div className="rounded-2xl border border-foreground/10 p-4">
                  <p className="text-xs font-medium text-foreground/60 uppercase">
                    Estado de Cuenta
                  </p>
                  <p className="mt-2">
                    {result.accountStatus === "active" ? (
                      <span className="text-green-600 font-semibold">Activa</span>
                    ) : (
                      <span className="text-yellow-600 font-semibold">{result.accountStatus}</span>
                    )}
                  </p>
                </div>

                <div className="rounded-2xl border border-foreground/10 p-4">
                  <p className="text-xs font-medium text-foreground/60 uppercase">Status</p>
                  <p className="mt-2 text-foreground">{result.status}</p>
                </div>

                {result.accountStatus !== "active" && (
                  <div className="rounded-3xl border border-yellow-200 bg-yellow-50 p-4">
                    <p className="font-semibold text-yellow-800">⚠️ Atención</p>
                    <p className="mt-2 text-sm text-yellow-700">
                      Tu cuenta de Mercado Pago está en estado "{result.accountStatus}". Es posible
                      que debas completar la verificación de tu cuenta en
                      <a
                        href="https://www.mercadopago.com/mco/account/security"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-1 font-semibold underline"
                      >
                        el panel de Mercado Pago
                      </a>
                      .
                    </p>
                  </div>
                )}
              </>
            ) : null}

            {!result.tokenValid && result.message ? (
              <div className="rounded-2xl border border-red-100 bg-red-50/50 p-4">
                <p className="text-xs font-medium text-red-600 uppercase">Detalle del Error</p>
                <p className="mt-2 text-sm text-red-700 font-mono">{result.message}</p>
              </div>
            ) : null}

            {result.ok === false && result.message === "Token no configurado" ? (
              <div className="rounded-3xl border border-red-200 bg-red-50 p-4">
                <p className="font-semibold text-red-800">Error: Token no configurado</p>
                <p className="mt-2 text-sm text-red-700">
                  Verifica que la variable{" "}
                  <code className="bg-red-100 px-2 py-1 rounded">MERCADO_PAGO_ACCESS_TOKEN</code>{" "}
                  esté definida en tu archivo{" "}
                  <code className="bg-red-100 px-2 py-1 rounded">.env</code>.
                </p>
              </div>
            ) : null}
          </div>
        ) : null}

        <button
          onClick={handleCheckToken}
          disabled={loading}
          className="w-full inline-flex items-center justify-center rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-foreground/90 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Verificando..." : "Verificar de Nuevo"}
        </button>
      </div>

      <div className="rounded-3xl border border-foreground/10 bg-foreground/[0.02] p-6">
        <h3 className="font-semibold text-foreground mb-4">Soluciones Comunes</h3>
        <ul className="space-y-3 text-sm text-foreground/70">
          <li>
            <strong>Error "una de las partes es de prueba":</strong> Asegúrate de usar un token válido
            de tu cuenta productiva o sandbox, no mezclés.
          </li>
          <li>
            <strong>Cuenta no verificada:</strong> Completa la verificación en el panel de Mercado Pago.
          </li>
          <li>
            <strong>Token inválido:</strong> Regenera el token en tu
            <a
              href="https://www.mercadopago.com/mco/account/credentials"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 font-semibold underline"
            >
              panel de credenciales
            </a>
            .
          </li>
        </ul>
      </div>
    </div>
  );
}
