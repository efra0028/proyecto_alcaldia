import type { VerificacionResult } from "../types/scanner.types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

/**
 * Verifies a QR code against the backend registry.
 * Expects the scanned raw string (e.g. a UUID or slug) as `codigo`.
 */
export async function verificarQr(codigo: string): Promise<VerificacionResult> {
  const res = await fetch(`${API_BASE}/registros/${encodeURIComponent(codigo)}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (res.status === 404) {
    return { found: false, mensaje: "El código QR no está registrado en el sistema." };
  }

  if (!res.ok) {
    throw new Error(`Error del servidor: ${res.status}`);
  }

  const data = await res.json();
  return { found: true, registro: data };
}
