// src/app/admin/qrGenerador/types/index.ts

// ── Resultado de subida de archivo ─────────────────────────────
export interface ArchivoSubidoResponse {
  url: string
  filename: string
  originalName: string
  mimetype: string
  size: number
}

// ── Opciones de personalización del QR ─────────────────────────
export type ErrorCorrection = 'L' | 'M' | 'Q' | 'H'

export interface QrOpcionesAdmin {
  fgColor: string
  bgColor: string
  size: number
  errorCorrection: ErrorCorrection
  includeMargin: boolean
  logoUrl: string
  logoSize: number   // % del QR
}

// ── Modos de entrada ────────────────────────────────────────────
export type ModoEntrada = 'url' | 'archivo'

// ── Estado del generador ────────────────────────────────────────
export type EstadoGenerador =
  | 'idle'        // Sin contenido
  | 'ready'       // URL/archivo listo, QR generado localmente
  | 'uploading'   // Subiendo archivo al backend
  | 'error'       // Error en algún paso

// ── Formato de descarga ─────────────────────────────────────────
export type QrFormatoDescarga = 'png' | 'jpeg' | 'svg'

// ── Item del historial local (session storage, no BD) ───────────
export interface QrHistorialItem {
  id: string
  fecha: string
  modo: ModoEntrada
  destino: string       // URL o nombre del archivo
  fgColor: string
  bgColor: string
  logoUrl: string
}

// ── Errores del formulario ──────────────────────────────────────
export interface FormErrorsAdmin {
  url?: string
  archivo?: string
  general?: string
}