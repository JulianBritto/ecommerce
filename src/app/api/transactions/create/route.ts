import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      cus,
      productNames,
      productQuantities,
      totalAmount,
      status,
      customerName,
      customerEmail,
      transactionDate,
    } = body;

    if (
      !cus ||
      !customerName ||
      !customerEmail ||
      !totalAmount ||
      !status
    ) {
      return new Response(
        JSON.stringify({
          ok: false,
          message: "Faltan campos requeridos",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const transaction = await prisma.transaction.create({
      data: {
        cus,
        productNames: JSON.stringify(productNames || []),
        productQuantities: JSON.stringify(productQuantities || []),
        totalAmount,
        status,
        customerName,
        customerEmail,
        transactionDate: new Date(transactionDate || new Date()),
        statusReceivedAt: new Date(),
      },
    });

    return new Response(
      JSON.stringify({
        ok: true,
        transaction,
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error creating transaction:", error);
    return new Response(
      JSON.stringify({
        ok: false,
        message: "Error al guardar la transacción",
        error: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
