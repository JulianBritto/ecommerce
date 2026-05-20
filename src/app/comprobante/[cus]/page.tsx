import { prisma } from "@/lib/db";

type PageProps = {
  params: { cus: string };
  searchParams: { status?: string };
};

function parseJsonArray<T>(value: string): T[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

export default async function ComprobantePage({ params, searchParams }: PageProps) {
  const cus = params.cus;
  const status = searchParams.status ?? null;

  const transaction = await prisma.transaction.findUnique({
    where: { cus },
  });

  if (!transaction) {
    return (
      <div style={{ padding: 24, fontFamily: "system-ui" }}>
        <h1 style={{ fontSize: 20, marginBottom: 8 }}>Comprobante no encontrado</h1>
        <p style={{ margin: 0 }}>No existe una transacción con cus: {cus}</p>
      </div>
    );
  }

  const productNames = parseJsonArray<string>(transaction.productNames);
  const productQuantities = parseJsonArray<number>(transaction.productQuantities);

  const totalAmount = transaction.totalAmount;
  const createdAt = transaction.transactionDate;

  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>Comprobante</h1>

      <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 16, maxWidth: 720 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontWeight: 600 }}>Estado</div>
            <div>{status ?? transaction.status}</div>
          </div>

          <div>
            <div style={{ fontWeight: 600 }}>Total</div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>COP {totalAmount.toLocaleString("es-CO")}</div>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <div style={{ fontWeight: 600 }}>Cliente</div>
          <div>{transaction.customerName}</div>
          <div style={{ color: "#6b7280" }}>{transaction.customerEmail}</div>
        </div>

        <div style={{ marginTop: 12 }}>
          <div style={{ fontWeight: 600 }}>Fecha</div>
          <div>{createdAt.toISOString()}</div>
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
          cus: {transaction.cus}
        </div>
      </div>
    </div>
  );
}
