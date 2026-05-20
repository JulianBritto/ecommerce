import type { NextRequest } from "next/server";
import { logPreferenceError } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, message, details, stack } = body;

    logPreferenceError(
      `[${type}] ${message}`,
      { timestamp: new Date().toISOString(), ...details },
      stack
    );

    return new Response(
      JSON.stringify({ ok: true, message: "Error logged" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error logging client error:", error);
    return new Response(
      JSON.stringify({ ok: false, message: "Failed to log error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
