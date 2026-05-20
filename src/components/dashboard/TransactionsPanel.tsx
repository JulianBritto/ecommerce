"use client";

import { useEffect, useMemo, useState } from "react";
import { formatCOP } from "@/lib/catalog";

type Transaction = {
  id: string;
  cus: string;
  productNames: string[];
  productQuantities: number[];
  totalAmount: number;
  status: string;
  customerName: string;
  customerEmail: string;
  transactionDate: string;
  statusReceivedAt: string;
  createdAt: string;
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-800",
};

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return {
    date: date.toLocaleDateString("es-CO", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }),
    time: date.toLocaleTimeString("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
  };
}

function getStatusBadge(status: string) {
  const normalized = status.trim().toLowerCase();
  const colorClass = statusColors[normalized] || "bg-gray-100 text-gray-800";
  const label = status ? status.charAt(0).toUpperCase() + status.slice(1) : "—";

  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${colorClass}`}
    >
      {label}
    </span>
  );
}

export default function TransactionsPanel() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);

        // Sync en backend: pending -> approved/failed consultando Mercado Pago
        await fetch("/api/transactions/sync").catch(() => null);

        const response = await fetch("/api/transactions/list");
        const data = await response.json();

        if (!response.ok || !data.ok) {
          throw new Error(data.message || "Error al obtener transacciones");
        }

        setTransactions(data.transactions || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const summary = useMemo(() => {
    const approvedCount = transactions.filter((t) => t.status === "approved").length;
    const pendingCount = transactions.filter((t) => t.status === "pending").length;
    const totalAmount = transactions.reduce((sum, t) => sum + t.totalAmount, 0);

    return {
      totalCount: transactions.length,
      approvedCount,
      pendingCount,
      totalAmount,
    };
  }, [transactions]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Transacciones</h2>
        <p className="mt-2 text-sm text-foreground/70">
          Historial de todas las transacciones realizadas en la plataforma.
        </p>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-foreground/10 bg-foreground/[0.02] p-8 text-center">
          <p className="text-foreground/70">Cargando transacciones...</p>
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
          <p className="text-red-700">Error: {error}</p>
        </div>
      ) : transactions.length === 0 ? (
        <div className="rounded-3xl border border-foreground/10 bg-foreground/[0.02] p-8 text-center">
          <p className="text-foreground/70">No hay transacciones registradas aún</p>
        </div>
      ) : (
        <div className="rounded-3xl border border-foreground/10 bg-background overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-foreground/10 bg-foreground/[0.02]">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">CUS</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Productos
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Cantidad
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">
                    Monto Total
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Cliente
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Fecha Transacción
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Hora Estado
                  </th>
                </tr>
              </thead>

              <tbody>
                {transactions.map((transaction) => {
                  const transactionDateFormatted = formatDate(transaction.transactionDate);
                  const statusDateFormatted = formatDate(transaction.statusReceivedAt);
                  const totalQuantity = transaction.productQuantities.reduce(
                    (sum, qty) => sum + qty,
                    0
                  );

                  return (
                    <tr
                      key={transaction.id}
                      className="border-b border-foreground/5 hover:bg-foreground/[0.02] transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-mono text-foreground/70">
                        {transaction.cus.slice(0, 8)}...
                      </td>

                      <td className="px-6 py-4 text-sm text-foreground">
                        <div className="space-y-1">
                          {transaction.productNames.map((name, idx) => (
                            <div key={idx} className="text-foreground/90">
                              {name}
                            </div>
                          ))}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-foreground">
                        <div className="space-y-1">
                          {transaction.productQuantities.map((qty, idx) => (
                            <div key={idx} className="text-foreground/90">
                              {qty}
                            </div>
                          ))}
                        </div>
                        <div className="text-xs text-foreground/60 mt-2 font-medium">
                          Total: {totalQuantity}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm font-semibold text-foreground text-right">
                        {formatCOP(transaction.totalAmount)}
                      </td>

                      <td className="px-6 py-4 text-sm">{getStatusBadge(transaction.status)}</td>

                      <td className="px-6 py-4 text-sm">
                        <div className="text-foreground">{transaction.customerName}</div>
                        <div className="text-xs text-foreground/60">
                          {transaction.customerEmail}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-foreground/80">
                        {transactionDateFormatted.date}
                      </td>

                      <td className="px-6 py-4 text-sm text-foreground/80">
                        {statusDateFormatted.time}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="border-t border-foreground/10 bg-foreground/[0.02] p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
              <div>
                <p className="text-xs font-medium text-foreground/60 uppercase">Total</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{summary.totalCount}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-foreground/60 uppercase">Aprobadas</p>
                <p className="mt-1 text-2xl font-bold text-green-600">{summary.approvedCount}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-foreground/60 uppercase">Total vendido</p>
                <p className="mt-1 text-2xl font-bold text-foreground">
                  {formatCOP(summary.totalAmount)}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-foreground/60 uppercase">Pendientes</p>
                <p className="mt-1 text-2xl font-bold text-yellow-600">{summary.pendingCount}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
