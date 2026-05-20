"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useCart } from "@/components/cart/CartContext";
import { SiteHeader } from "@/components/SiteHeader";

const CO_DEPARTMENTS: Array<{ code: string; label: string }> = [
  { code: "ANTIOQUIA", label: "Antioquia" },
  { code: "ARAUCA", label: "Arauca" },
  { code: "ATLANTICO", label: "Atlántico" },
  { code: "BOLIVAR", label: "Bolívar" },
  { code: "BOYACA", label: "Boyacá" },
  { code: "CALDAS", label: "Caldas" },
  { code: "CAQUETA", label: "Caquetá" },
  { code: "CASANARE", label: "Casanare" },
  { code: "CAUCA", label: "Cauca" },
  { code: "CESAR", label: "Cesar" },
  { code: "CHOCO", label: "Chocó" },
  { code: "CORDOBA", label: "Córdoba" },
  { code: "CUNDINAMARCA", label: "Cundinamarca" },
  { code: "GUAINIA", label: "Guainía" },
  { code: "GUAVIARE", label: "Guaviare" },
  { code: "HUILA", label: "Huila" },
  { code: "MAGDALENA", label: "Magdalena" },
  { code: "META", label: "Meta" },
  { code: "NARIÑO", label: "Nariño" },
  { code: "NORTE_DE_SANTANDER", label: "Norte de Santander" },
  { code: "PUTUMAYO", label: "Putumayo" },
  { code: "QUINDIO", label: "Quindío" },
  { code: "RISARALDA", label: "Risaralda" },
  { code: "SANTANDER", label: "Santander" },
  { code: "SUCRE", label: "Sucre" },
  { code: "TOLIMA", label: "Tolima" },
  { code: "VALLE_DEL_CAUCA", label: "Valle del Cauca" },
  { code: "VAUPES", label: "Vaupés" },
  { code: "VICHADA", label: "Vichada" },
  { code: "BOGOTA_D_C", label: "Bogotá D.C." },
  { code: "OTRO", label: "Otro" },
];

const OTHER_DEPARTMENT_CODE = "OTRO";
const OTHER_CITY_VALUE = "OTRO";

const CO_CITIES_BY_DEPARTMENT: Record<string, string[]> = {
  ANTIOQUIA: ["Medellín", "Bello", "Envigado", "Itagüí", "Apartadó"],
  ARAUCA: ["Arauca", "Saravena", "Tame"],
  ATLANTICO: ["Barranquilla", "Soledad", "Malambo"],
  BOLIVAR: ["Cartagena", "Magangué", "Turbaco"],
  BOYACA: ["Tunja", "Duitama", "Sogamoso"],
  CALDAS: ["Manizales", "Villamaría", "La Dorada"],
  CAQUETA: ["Florencia", "San Vicente del Caguán"],
  CASANARE: ["Yopal", "Aguazul", "Villanueva"],
  CAUCA: ["Popayán", "Santander de Quilichao"],
  CESAR: ["Valledupar", "Aguachica"],
  CHOCO: ["Quibdó"],
  CORDOBA: ["Montería", "Cereté"],
  CUNDINAMARCA: ["Bogotá", "Soacha", "Chía", "Zipaquirá", "Girardot"],
  GUAINIA: ["Inírida"],
  GUAVIARE: ["San José del Guaviare"],
  HUILA: ["Neiva", "Garzón", "Pitalito"],
  MAGDALENA: ["Santa Marta", "Ciénaga"],
  META: ["Villavicencio", "Puerto López", "Granada"],
  "NARIÑO": ["Pasto", "Ipiales", "Tumaco"],
  NORTE_DE_SANTANDER: ["Cúcuta", "Villa del Rosario"],
  PUTUMAYO: ["Mocoa", "Sibundoy"],
  QUINDIO: ["Armenia", "Calarcá"],
  RISARALDA: ["Pereira", "Dosquebradas"],
  SANTANDER: ["Bucaramanga", "Floridablanca", "Girón"],
  SUCRE: ["Sincelejo", "Corozal", "Sincé"],
  TOLIMA: ["Ibagué", "Espinal", "Lérida"],
  VALLE_DEL_CAUCA: ["Cali", "Palmira", "Buenaventura"],
  VAUPES: ["Mitú"],
  VICHADA: ["Puerto Carreño"],
  BOGOTA_D_C: ["Bogotá"],
  OTRO: [],
};

type PaymentMethod = {
  id: string | null;
  name: string | null;
  payment_type_id: string | null;
};

type MercadoPagoCredentialSummary = {
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
  environment?: MercadoPagoCredentialSummary["environment"];
  warning?: string | null;
  message?: string;
  methods?: PaymentMethod[];
  pseMethods?: PaymentMethod[];
  totalMethods?: number;
  credentialSummary?: MercadoPagoCredentialSummary;
};

type CartLine = {
  item: {
    id: string;
    name: string;
    priceCOP: number;
    image: string;
    photo?: string;
  };
  quantity: number;
};

function CheckoutInner() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState(
    "Pago por Mercado Pago PSE"
  );
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null);
  const [credentialWarning, setCredentialWarning] = useState<string | null>(null);
  const [environmentLabel, setEnvironmentLabel] = useState<string>("unknown");
  const [availableMethods, setAvailableMethods] = useState<PaymentMethod[]>([]);
  const [pseMethods, setPSEMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [documentType, setDocumentType] = useState("CC");
  const [documentNumber, setDocumentNumber] = useState("");
  const [nitNumber, setNitNumber] = useState("");
  const [bankId, setBankId] = useState<string | null>(null);

  // Banco: búsqueda para no mostrar todo el listado
  const [bankSearch, setBankSearch] = useState<string>("");

  // Dirección (Colombia): Departamento -> Ciudad (dependiente)
  const [departmentCode, setDepartmentCode] = useState<string>("");
  const [cityOption, setCityOption] = useState<string>("");
  const [otherCity, setOtherCity] = useState<string>("");

  // PSE (bank_transfer) - campos adicionales para evitar payloads vacíos
  const [phoneAreaCode, setPhoneAreaCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  // Para que el usuario escriba una sola dirección (y no 3 campos separados),
  // parseamos esta línea a street_name / street_number / neighborhood.
  const [addressLine, setAddressLine] = useState("");

  const [streetName, setStreetName] = useState("");
  const [streetNumber, setStreetNumber] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [federalUnit, setFederalUnit] = useState("");

  // Código postal (ZIP) requerido por PSE
  const [postalCode, setPostalCode] = useState("");

  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [headerCollapsed, setHeaderCollapsed] = useState(false);

  const { lines, totalCOP } = useCart();

  

  useEffect(() => {
    let rafId: number | null = null;

    const apply = () => {
      const shouldCollapse = window.scrollY > 80;
      setHeaderCollapsed((prev) => (prev === shouldCollapse ? prev : shouldCollapse));
      rafId = null;
    };

    const onScroll = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(apply);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    apply();

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId !== null) window.cancelAnimationFrame(rafId);
    };
  }, []);

  const hydrateConnectionState = (
    data: MercadopagoCheckResponse
  ) => {
    setCredentialWarning(data.warning ?? null);
    setEnvironmentLabel(
      data.environment ?? data.credentialSummary?.environment ?? "unknown"
    );

    if (data.ok) {
      setConnectionStatus(
        `Conexión exitosa. Métodos detectados: ${data.totalMethods ?? 0}`
      );
      setAvailableMethods(data.methods ?? []);
      setPSEMethods(data.pseMethods ?? []);

      if (!selectedMethod) {
        const hasBank = (data.methods ?? []).some(
          (method) => method.payment_type_id === "bank_transfer"
        );
        if (hasBank) {
          setSelectedMethod("bank_transfer");
        }
      }
    } else {
      setConnectionStatus(`Conexión fallida: ${data.message ?? "Error desconocido"}`);
    }
  };

  const handleConnectionCheck = async () => {
    setChecking(true);
    setConnectionStatus(null);

    try {
      const response = await fetch("/api/mercadopago/check");
      const data = (await response.json()) as MercadopagoCheckResponse;

      if (!response.ok) {
        setConnectionStatus(
          `No se pudo conectar: ${data?.message ?? response.statusText}`
        );
        setCredentialWarning(data?.warning ?? null);
        setEnvironmentLabel(
          data?.environment ?? data?.credentialSummary?.environment ?? "unknown"
        );
      } else {
        hydrateConnectionState(data);
      }
    } catch (error) {
      setConnectionStatus(`Error de conexión: ${String(error)}`);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch("/api/mercadopago/check");
        if (!response.ok) return;
        const data = (await response.json()) as MercadopagoCheckResponse;
        hydrateConnectionState(data);
      } catch {
        // ignore
      }
    })();
  }, []);

  function parseCoAddressFull(
    value: string
  ): { zip_code: string; street_name: string; street_number: string; neighborhood: string } {
    // Esperado sugerido:
    // "ZIP calle / avenida # número - Barrio"
    // Ej: "110221 Calle 123 #45 - Centro"
    const raw = value.trim();
    const zipMatch = raw.match(/\b(\d{5})\b/);
    const zip_code = zipMatch?.[1] ?? "";

    const withoutZip = raw.replace(zipMatch?.[0] ?? "", "").trim();
    const partsDash = withoutZip.split(" - ").map((p) => p.trim()).filter(Boolean);
    const neighborhoodCandidate =
      partsDash.length >= 2 ? partsDash[partsDash.length - 1] : "";

    const hashMatch = withoutZip.match(/#\s*(\d+[a-zA-Z]?)/);
    let streetNumberCandidate = hashMatch?.[1] ?? "";

    let streetNameCandidate = withoutZip;

    if (hashMatch?.index !== undefined) {
      streetNameCandidate = withoutZip.slice(0, hashMatch.index).trim();
    } else if (!streetNumberCandidate) {
      const numMatch = withoutZip.match(/(\d+[a-zA-Z]?)/);
      streetNumberCandidate = numMatch?.[1] ?? "";
      if (numMatch?.index !== undefined) {
        streetNameCandidate = withoutZip.slice(0, numMatch.index).trim();
      }
    }

    const street_name = streetNameCandidate || withoutZip || "Direccion";
    const street_number = streetNumberCandidate || "0";
    const neighborhood = neighborhoodCandidate || "N/A";

    return { zip_code, street_name, street_number, neighborhood };
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setStatusMessage(null);

    try {
      const logData = {
        timestamp: new Date().toISOString(),
        name,
        email,
        amount: totalCOP,
        selectedMethod,
        selectedBank,
        environmentLabel,
      };

      if (
        selectedMethod === "bank_transfer" &&
        !/^\d{5}$/.test(postalCode.trim())
      ) {
        setStatusMessage(
          "Código postal (ZIP) es requerido para PSE y debe tener 5 dígitos."
        );
        return;
      }

      const response = await fetch("/api/mercadopago/preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          description,
          amount: totalCOP,
          items: (lines as CartLine[]).map((line) => ({
            title: line.item.name,
            quantity: line.quantity,
            unit_price: line.item.priceCOP,
          })),
          preferred_payment_type: selectedMethod,
                  payer:
            selectedMethod === "bank_transfer"
              ? (() => {
                  const parsed = parseCoAddressFull(addressLine);

                  // Si el usuario NO escribió ZIP en el campo único, no bloqueamos el pago.
                  // Usamos un fallback para evitar errores por campos obligatorios.
                  const zipCode = postalCode.trim();

                  return {
                    bank_id: selectedBank || bankId,
                    identification: {
                      type: documentType,
                      number:
                        documentType === "NIT" ? nitNumber : documentNumber,
                    },
                    phone: {
                      area_code: phoneAreaCode,
                      number: phoneNumber,
                    },
                    address: {
                      zip_code: zipCode,
                      street_name: parsed.street_name,
                      street_number: parsed.street_number,
                      neighborhood: parsed.neighborhood,
                      city,
                      federal_unit: federalUnit,
                    },
                  };
                })()
              : {
                  identification: {
                    type: documentType,
                    number:
                      documentType === "NIT" ? nitNumber : documentNumber,
                  },
                  bank_id: selectedBank || bankId,
                },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data?.message ?? response.statusText;
        setStatusMessage(`Error: ${errorMsg}`);

        await fetch("/api/log-error", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "preference_creation_failed",
            message: errorMsg,
            details: { ...logData, apiDetails: data?.details, warning: data?.warning },
          }),
        }).catch(() => {});
        return;
      }

      const checkoutUrl =
        data.checkout_url ?? data.sandbox_init_point ?? data.init_point;
      if (!checkoutUrl) {
        setStatusMessage("Preferencia creada pero no se obtuvo URL de pago.");
        return;
      }

      const cus = data.cus || data.preference_id;
      if (cus && lines.length > 0) {
        await fetch("/api/transactions/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cus,
            productNames: lines.map((line: CartLine) => line.item.name),
            productQuantities: lines.map((line: CartLine) => line.quantity),
            totalAmount: totalCOP,
            status: "pending",
            customerName: name,
            customerEmail: email,
            transactionDate: new Date().toISOString(),
          }),
        }).catch((err) => {
          console.error("Failed to save transaction:", err);
        });
      }

      window.location.href = checkoutUrl;
    } catch (error) {
      const errorMsg = String(error);
      setStatusMessage(`Error inesperado: ${errorMsg}`);

      await fetch("/api/log-error", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "client_error",
          message: errorMsg,
          stack: error instanceof Error ? error.stack : undefined,
        }),
      }).catch(() => {});
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background text-foreground min-h-screen px-4 py-10 sm:px-6 lg:px-10">
      <SiteHeader collapsed={headerCollapsed} />

      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-12 md:gap-6 items-start">
          <div className="md:col-span-8 rounded-3xl border border-foreground/10 bg-background p-8 shadow-sm">
            <h1 className="text-3xl font-semibold tracking-tight">
              Pago con Mercado Pago PSE
            </h1>
            <p className="mt-3 text-sm leading-6 text-foreground/70">
              Completa el formulario y haz clic en "Pagar con Mercado Pago" para
              iniciar el pago.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-foreground">
                    Nombre completo
                  </span>
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                    className="mt-2 w-full rounded-2xl border border-foreground/10 bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-orange-500/40"
                    placeholder="Juan Pérez"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-foreground">
                    Correo electrónico
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    className="mt-2 w-full rounded-2xl border border-foreground/10 bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-orange-500/40"
                    placeholder="correo@ejemplo.com"
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-sm font-medium text-foreground">
                  Descripción del pago
                </span>
                <input
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-foreground/10 bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-orange-500/40"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-foreground">
                    Método de pago
                  </span>
                  <div className="relative mt-2">
                    <select
                      value={selectedMethod ?? ""}
                      onChange={(e) =>
                        setSelectedMethod(e.target.value ?? null)
                      }
                      className="appearance-none mt-0 w-full rounded-2xl border border-foreground/10 bg-background px-4 py-3 text-sm text-foreground outline-none transition pr-10"
                    >
                      <option value="">Seleccionar método</option>
                      {Array.from(
                        new Map(
                          availableMethods.map((method) => [
                            method.payment_type_id,
                            method,
                          ])
                        ).values()
                      ).map((method) => (
                        <option
                          key={
                            method.payment_type_id ??
                            method.id ??
                            method.name ??
                            "unknown"
                          }
                          value={method.payment_type_id ?? ""}
                        >
                          {method.name ?? "Sin nombre"}
                        </option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-foreground/60">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M6 9l6 6 6-6"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </div>
                </label>

                <div className="block">
                  <span className="text-sm font-medium text-foreground">
                    Campos requeridos
                  </span>
                  <div className="mt-2 space-y-2 text-sm text-foreground/70">
                    {selectedMethod === "bank_transfer" ? (
                      <>
                        <p>
                          Documento (tipo y número) y banco son requeridos
                          para PSE.
                        </p>
                        <div className="mt-2 flex gap-2">
                          <select
                            value={documentType}
                            onChange={(e) =>
                              setDocumentType(e.target.value)
                            }
                            className="rounded-2xl border border-foreground/10 bg-background px-3 py-2"
                          >
                            <option value="CC">CC</option>
                            <option value="TI">TI</option>
                            <option value="CE">CE</option>
                            <option value="NIT">NIT</option>
                          </select>
                          {documentType === "NIT" ? (
                            <input
                              value={nitNumber}
                              onChange={(e) => setNitNumber(e.target.value)}
                              required={selectedMethod === "bank_transfer"}
                              placeholder="Número de NIT"
                              className="flex-1 rounded-2xl border border-foreground/10 bg-background px-3 py-2"
                            />
                          ) : (
                            <input
                              value={documentNumber}
                              onChange={(e) => setDocumentNumber(e.target.value)}
                              required={selectedMethod === "bank_transfer"}
                              placeholder="Número de documento"
                              className="flex-1 rounded-2xl border border-foreground/10 bg-background px-3 py-2"
                            />
                          )}
                        </div>

                        {documentType === "NIT" ? (
                          <p className="mt-1 text-xs text-foreground/60">
                            Escribe tu NIT sin puntos ni guiones (ej: 900123456).
                          </p>
                        ) : null}

                        <div className="mt-2">
                          <label className="mb-1 block text-xs text-foreground/70">
                            Banco (PSE)
                          </label>
                          <div className="relative">
                            <input
                              value={bankSearch}
                              onChange={(e) => setBankSearch(e.target.value)}
                              placeholder="Buscar banco…"
                              className="w-full rounded-2xl border border-foreground/10 bg-background px-3 py-2 pr-10"
                            />
                            <div className="relative mt-2">
                              <select
                                value={selectedBank ?? ""}
                                onChange={(e) =>
                                  setSelectedBank(e.target.value ?? null)
                                }
                                required={selectedMethod === "bank_transfer"}
                                className="w-full appearance-none rounded-2xl border border-foreground/10 bg-background px-3 py-2 pr-10"
                              >
                                <option value="">Selecciona un banco</option>
                                {pseMethods
                                  .filter((bank) => {
                                    const label = `${bank.name ?? ""}`.toLowerCase();
                                    const q = bankSearch.trim().toLowerCase();
                                    return q.length === 0 ? true : label.includes(q);
                                  })
                                  .map((bank) => (
                                    <option
                                      key={bank.id ?? bank.name ?? "bank"}
                                      value={bank.id ?? ""}
                                    >
                                      {bank.name ?? "Banco"}
                                    </option>
                                  ))}
                              </select>
                              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-foreground/60">
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M6 9l6 6 6-6"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </span>
                            </div>

                            {pseMethods.length === 0 ? (
                              <p className="mt-1 text-xs text-orange-500">
                                No hay bancos disponibles. Revisa la conexión.
                              </p>
                            ) : null}

                            {pseMethods.length > 0 &&
                            pseMethods.filter((bank) => {
                              const label = `${bank.name ?? ""}`.toLowerCase();
                              const q = bankSearch.trim().toLowerCase();
                              return q.length === 0 ? true : label.includes(q);
                            }).length === 0 ? (
                              <p className="mt-1 text-xs text-orange-500">
                                No encontramos bancos con ese texto.
                              </p>
                            ) : null}
                          </div>
                        </div>

                        <div className="mt-4 border-t border-foreground/10 pt-4">
                          <p className="text-xs font-medium text-foreground/70">
                            Teléfono (PSE)
                          </p>
                          <div className="mt-2 flex gap-2">
                            <input
                              value={phoneAreaCode}
                              onChange={(e) => setPhoneAreaCode(e.target.value)}
                              required={selectedMethod === "bank_transfer"}
                              placeholder="Código"
                              className="w-32 rounded-2xl border border-foreground/10 bg-background px-3 py-2"
                            />
                            <input
                              value={phoneNumber}
                              onChange={(e) => setPhoneNumber(e.target.value)}
                              required={selectedMethod === "bank_transfer"}
                              placeholder="Número"
                              className="flex-1 rounded-2xl border border-foreground/10 bg-background px-3 py-2"
                            />
                          </div>

                          <p className="mt-4 text-xs font-medium text-foreground/70">
                            Dirección (PSE)
                          </p>

                          <div className="mt-2 space-y-2">
                            <input
                              value={postalCode}
                              onChange={(e) => setPostalCode(e.target.value)}
                              required={selectedMethod === "bank_transfer"}
                              placeholder="Código postal (ZIP) - 5 dígitos (ej: 110221)"
                              className="w-full rounded-2xl border border-foreground/10 bg-background px-3 py-2"
                            />

                            <input
                              value={addressLine}
                              onChange={(e) => setAddressLine(e.target.value)}
                              required={selectedMethod === "bank_transfer"}
                              placeholder="Dirección completa: calle/número/barrio (ej: Calle 123 #45 - Centro)"
                              className="w-full rounded-2xl border border-foreground/10 bg-background px-3 py-2"
                            />

                            <select
                              value={departmentCode}
                              onChange={(e) => {
                                const depCode = e.target.value;
                                setDepartmentCode(depCode);

                                const dep = CO_DEPARTMENTS.find((d) => d.code === depCode);
                                setFederalUnit(dep?.label ?? "");

                                // reset ciudades
                                setCityOption("");
                                setOtherCity("");
                                setCity("");
                              }}
                              required={selectedMethod === "bank_transfer"}
                              className="w-full appearance-none rounded-2xl border border-foreground/10 bg-background px-3 py-2 pr-10"
                            >
                              <option value="">Selecciona un departamento</option>
                              {CO_DEPARTMENTS.filter((d) => d.code !== OTHER_DEPARTMENT_CODE).map(
                                (dep) => (
                                  <option key={dep.code} value={dep.code}>
                                    {dep.label}
                                  </option>
                                )
                              )}
                              <option value={OTHER_DEPARTMENT_CODE}>{CO_DEPARTMENTS.find((d)=>d.code===OTHER_DEPARTMENT_CODE)?.label ?? "Otro"}</option>
                            </select>

                            <div className="mt-2">
                              <select
                                value={cityOption}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setCityOption(val);

                                  if (val === OTHER_CITY_VALUE) {
                                    setCity("");
                                    setOtherCity("");
                                  } else {
                                    setCity(val);
                                    setOtherCity("");
                                  }
                                }}
                                required={selectedMethod === "bank_transfer"}
                                className="w-full appearance-none rounded-2xl border border-foreground/10 bg-background px-3 py-2 pr-10"
                                disabled={selectedMethod !== "bank_transfer"}
                              >
                                <option value="">Selecciona una ciudad</option>
                                {(departmentCode &&
                                  departmentCode !== OTHER_DEPARTMENT_CODE
                                  ? CO_CITIES_BY_DEPARTMENT[departmentCode] ?? []
                                  : []
                                ).map((c) => (
                                  <option key={c} value={c}>
                                    {c}
                                  </option>
                                ))}
                                <option value={OTHER_CITY_VALUE}>Otra</option>
                              </select>

                              {cityOption === OTHER_CITY_VALUE ? (
                                <input
                                  value={otherCity}
                                  onChange={(e) => {
                                    setOtherCity(e.target.value);
                                    setCity(e.target.value);
                                  }}
                                  required={selectedMethod === "bank_transfer"}
                                  placeholder="Escribe la ciudad"
                                  className="mt-2 w-full rounded-2xl border border-foreground/10 bg-background px-3 py-2"
                                />
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </>
                    ) : selectedMethod === "credit_card" ? (
                      <>
                        <p>
                          Para tarjetas recomendamos usar el flujo de
                          Mercado Pago (checkout). Si quieres probar en
                          sandbox, ingresa los datos de la tarjeta de
                          prueba.
                        </p>
                        <p className="text-xs text-foreground/60">
                          Campos: número de tarjeta, fecha de expiración, CVV,
                          titular.
                        </p>
                      </>
                    ) : selectedMethod ? (
                      <p>
                        Rellena los datos del pagador (nombre, email). Mercado
                        Pago pedirá datos adicionales según el método.
                      </p>
                    ) : (
                      <p>
                        Selecciona un método para ver los campos requeridos.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex h-12 items-center justify-center rounded-full bg-foreground px-6 text-sm font-medium text-background transition-colors hover:bg-foreground/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Redirigiendo…" : "Pagar con Mercado Pago"}
                </button>
                <p className="text-sm text-foreground/70">
                  El flujo usará la URL sandbox cuando las credenciales sean TEST-.
                </p>
              </div>

              {statusMessage ? (
                <p className="rounded-3xl border border-foreground/10 bg-foreground/[0.03] p-4 text-sm text-foreground/80">
                  {statusMessage}
                </p>
              ) : null}
            </form>
          </div>

          <aside className="md:col-span-4 mt-6 md:mt-0 rounded-3xl border border-foreground/10 bg-foreground/[0.02] p-4 w-full self-start">
            <h3 className="text-sm font-semibold text-foreground">
              Resumen del pedido
            </h3>

            {lines && lines.length > 0 ? (
              <>
                <ul className="mt-3 space-y-3">
                  {(lines as CartLine[]).map((line) => (
                    <li
                      key={line.item.id}
                      className="flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={line.item.photo ?? line.item.image}
                          alt={line.item.name}
                          className="w-14 h-14 rounded border border-foreground/10 bg-foreground/[0.02] object-cover"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground">
                            {line.item.name}
                          </p>
                          <p className="text-xs text-foreground/70">
                            Cantidad: {line.quantity} ×{" "}
                            {new Intl.NumberFormat("es-CO", {
                              style: "currency",
                              currency: "COP",
                              maximumFractionDigits: 0,
                            }).format(line.item.priceCOP)}
                          </p>
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-foreground">
                        {new Intl.NumberFormat("es-CO", {
                          style: "currency",
                          currency: "COP",
                          maximumFractionDigits: 0,
                        }).format(line.item.priceCOP * line.quantity)}
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="mt-4 flex items-center justify-between border-t border-foreground/10 pt-3">
                  <span className="text-sm text-foreground/80">Total</span>
                  <span className="text-lg font-semibold text-foreground">
                    {new Intl.NumberFormat("es-CO", {
                      style: "currency",
                      currency: "COP",
                      maximumFractionDigits: 0,
                    }).format(totalCOP)}
                  </span>
                </div>
              </>
            ) : (
              <p className="mt-3 text-sm text-foreground/70">
                Tu carrito está vacío.
              </p>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return <CheckoutInner />;
}
