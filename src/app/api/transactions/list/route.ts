import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: {
        transactionDate: "desc",
      },
    });

    // Parse JSON fields
    const parsedTransactions = transactions.map((t) => ({
      ...t,
      productNames: JSON.parse(t.productNames),
      productQuantities: JSON.parse(t.productQuantities),
    }));

    return new Response(
      JSON.stringify({
        ok: true,
        transactions: parsedTransactions,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return new Response(
      JSON.stringify({
        ok: false,
        message: "Error al obtener transacciones",
        error: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
