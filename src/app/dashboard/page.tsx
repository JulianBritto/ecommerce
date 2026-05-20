"use client";

import { useState } from "react";
import TransactionsPanel from "@/components/dashboard/TransactionsPanel";
import ConnectionPanel from "@/components/dashboard/ConnectionPanel";
import DebugMercadoPagoPanel from "@/components/dashboard/DebugMercadoPagoPanel";

type TabKey = "transactions" | "connection" | "debug";

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: "transactions", label: "Transacciones" },
  { key: "connection", label: "Conexión" },
  { key: "debug", label: "Debug Mercado Pago" },
];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("transactions");

  return (
    <div className="min-h-screen bg-background text-foreground px-4 py-10 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-2 text-foreground/70">
            Visualiza transacciones y estado de integración con Mercado Pago.
          </p>
        </div>

        <div className="mb-6 rounded-3xl border border-foreground/10 bg-foreground/[0.02] p-2">
          <div className="flex flex-col sm:flex-row gap-2">
            {TABS.map((tab) => {
              const isActive = tab.key === activeTab;

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={[
                    "flex-1 sm:flex-none inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold transition-colors",
                    isActive
                      ? "bg-foreground text-background"
                      : "bg-transparent text-foreground/80 hover:bg-foreground/10",
                  ].join(" ")}
                  aria-current={isActive ? "page" : undefined}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          {activeTab === "transactions" ? <TransactionsPanel /> : null}
          {activeTab === "connection" ? <ConnectionPanel /> : null}
          {activeTab === "debug" ? <DebugMercadoPagoPanel /> : null}
        </div>
      </div>
    </div>
  );
}
