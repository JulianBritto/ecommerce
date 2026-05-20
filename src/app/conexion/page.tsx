"use client";

import ConnectionPanel from "@/components/dashboard/ConnectionPanel";

export default function ConexionPage() {
  return (
    <div className="bg-background text-foreground min-h-screen px-4 py-10 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-4xl">
        <ConnectionPanel />
      </div>
    </div>
  );
}
