import { prisma } from "@/lib/db";

type PageProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

function parseJsonArray<T>(value: string): T[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

export default async function ComprobanteRootPage({ searchParams }: PageProps) {
  const preferenceIdCandidate =
    searchParams["preference-id"] ??
    searchParams["preference_id"] ??
    searchParams["preferenceId"] ??
    null;

  const preferenceId = Array.isArray(preferenceIdCandidate)
    ? preferenceIdCandidate[0]
    : preferenceIdCandidate;

  const statusCandidate = searchParams.status ?? null;
  const status = Array.isArray(statusCandidate) ? statusCandidate[0] : statusCandidate;

  if (!preferenceId) {
    return (
      <div style={{ padding: 24, fontFamily: "system-ui" }}>
        <h1 style={{ fontSize: 20, marginBottom: 8 }}>Comprobante no encontrado</h1>
        <p style={{ margin: 0, color: "#6b7280" }}>
          No llegó el identificador de preferencia en el redirect. Estado: <code>{status ?? "—"}</code>
        </p>
        <pre style={{ marginTop: 12, whiteSpace: "pre-wrap", fontSize: 12 }}>
          {JSON.stringify(searchParams, null, 2)}
        </pre>
      </div>
    );
  }

  let transaction = await prisma.transaction.findUnique({
    where: { cus: preferenceId },
  });

  if (!transaction) {
    return (
      <div style={{ padding: 24, fontFamily: "system-ui" }}>
        <h1 style={{ fontSize: 20, marginBottom: 8 }}>Comprobante no encontrado</h1>
        <p style={{ margin: 0 }}>
          No existe una transacción con cus: <code>{preferenceId}</code>
        </p>
      </div>
    );
  }

  const mapStatus = (s: string | null) => {
    if (!s) return null;
    const normalized = s.toLowerCase();
    if (normalized === "success") return "approved";
    if (normalized === "failure") return "failed";
    if (normalized === "pending") return "pending";
    return normalized;
  };

  const mappedStatus = mapStatus(status);
  let displayedStatus: string = transaction.status;

  if (mappedStatus && mappedStatus !== transaction.status) {
    const updated = await prisma.transaction.update({
      where: { cus: preferenceId },
      data: {
        status: mappedStatus,
        statusReceivedAt: new Date(),
      },
    });

    transaction = updated;
    displayedStatus = updated.status;
  } else {
    displayedStatus = mappedStatus ?? transaction.status;
  }

  const productNames = parseJsonArray<string>(transaction.productNames);
  const productQuantities = parseJsonArray<number>(transaction.productQuantities);

  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>Comprobante</h1>

      <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 16, maxWidth: 720 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontWeight: 600 }}>Estado</div>
            <div>{displayedStatus}</div>
          </div>

          <div>
            <div style={{ fontWeight: 600 }}>Total</div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>
              COP {transaction.totalAmount.toLocaleString("es-CO")}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <div style={{ fontWeight: 600 }}>Cliente</div>
          <div>{transaction.customerName}</div>
          <div style={{ color: "#6b7280" }}>{transaction.customerEmail}</div>
        </div>

        <div style={{ marginTop: 12 }}>
          <div style={{ fontWeight: 600 }}>Fecha</div>
          <div>{transaction.transactionDate.toISOString()}</div>
        </div>

        <div style={{ marginTop: 12 }}>
          <div style={{ fontWeight: 600 }}>Productos</div>
          {productNames.length === 0 ? (
            <div style={{ color: "#6b7280" }}>—</div>
          ) : (
            <ul style={{ marginTop: 8, paddingLeft: 18 }}>
              {productNames.map((name, idx) => {
                const qty = productQuantities[idx] ?? 1;
                return (
                  <li key={`${name}-${idx}`}>
                    {name} × {qty}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div style={{ marginTop: 12, color: "#6b7280", fontSize: 12 }}>
          preference-id: {transaction.cus}
        </div>
      </div>
    </div>
  );
}
