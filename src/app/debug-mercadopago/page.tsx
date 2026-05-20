"use client";

import DebugMercadoPagoPanel from "@/components/dashboard/DebugMercadoPagoPanel";

export default function DebugMercadoPagoPage() {
  return (
    <div className="bg-background text-foreground min-h-screen px-4 py-10 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-2xl">
        <DebugMercadoPagoPanel />
      </div>
    </div>
  );
}
