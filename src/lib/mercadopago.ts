export type MercadoPagoEnvironment = "sandbox" | "production" | "mixed" | "unknown";

export interface MercadoPagoCredentialSummary {
  publicKeyConfigured: boolean;
  accessTokenConfigured: boolean;
  publicKeyPrefix: string | null;
  accessTokenPrefix: string | null;
  environment: MercadoPagoEnvironment;
  forcedMode: "sandbox" | "production" | null;
  isMixed: boolean;
  sandboxReady: boolean;
  productionReady: boolean;
}

function getCredentialPrefix(value: string | undefined | null): string | null {
  if (!value) return null;
  if (value.startsWith("TEST-")) return "TEST";
  if (value.startsWith("APP_USR-")) return "APP_USR";
  return null;
}

function normalizeForcedMode(value: string | undefined | null): "sandbox" | "production" | null {
  const normalized = value?.trim().toLowerCase();
  if (normalized === "sandbox" || normalized === "production") {
    return normalized;
  }
  return null;
}

export function getMercadoPagoCredentialSummary(): MercadoPagoCredentialSummary {
  const publicKey = process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY ?? null;
  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN ?? null;
  const forcedMode = normalizeForcedMode(process.env.MERCADO_PAGO_ENV);

  const publicKeyPrefix = getCredentialPrefix(publicKey);
  const accessTokenPrefix = getCredentialPrefix(accessToken);

  const sandboxReady = publicKeyPrefix === "TEST" && accessTokenPrefix === "TEST";
  const productionReady = publicKeyPrefix === "APP_USR" && accessTokenPrefix === "APP_USR";

  let environment: MercadoPagoEnvironment = "unknown";

  if (sandboxReady) {
    environment = "sandbox";
  } else if (productionReady) {
    environment = "production";
  } else if (publicKeyPrefix || accessTokenPrefix) {
    environment = "mixed";
  }

  if (forcedMode === "sandbox") {
    environment = sandboxReady ? "sandbox" : "mixed";
  } else if (forcedMode === "production") {
    environment = productionReady ? "production" : "mixed";
  }

  return {
    publicKeyConfigured: Boolean(publicKey),
    accessTokenConfigured: Boolean(accessToken),
    publicKeyPrefix,
    accessTokenPrefix,
    environment,
    forcedMode,
    isMixed: environment === "mixed",
    sandboxReady,
    productionReady,
  };
}

export function isMercadoPagoSandbox(): boolean {
  return getMercadoPagoCredentialSummary().environment === "sandbox";
}

export function getMercadoPagoEnvironmentLabel(): string {
  const summary = getMercadoPagoCredentialSummary();

  if (summary.forcedMode) {
    return summary.forcedMode;
  }

  return summary.environment;
}

export function getMercadoPagoEnvironmentWarning(): string | null {
  const summary = getMercadoPagoCredentialSummary();

  if (!summary.publicKeyConfigured || !summary.accessTokenConfigured) {
    return "Faltan credenciales de Mercado Pago en el entorno.";
  }

  if (summary.forcedMode === "sandbox" && !summary.sandboxReady) {
    return "Sandbox está activado, pero las credenciales no son TEST-. Debes usar Public Key y Access Token de prueba.";
  }

  if (summary.forcedMode === "production" && !summary.productionReady) {
    return "Producción está activada, pero las credenciales no son APP_USR-. Debes usar credenciales de producción.";
  }

  if (summary.environment === "mixed") {
    return "Estás mezclando credenciales TEST y APP_USR. Usa credenciales del mismo entorno.";
  }

  if (summary.environment === "unknown") {
    return "No se pudo detectar el entorno de Mercado Pago. Verifica el prefijo de las credenciales.";
  }

  return null;
}
