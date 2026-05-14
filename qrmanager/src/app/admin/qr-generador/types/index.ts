// ── Tipos base ───────────────────────────────────────────────────────────────

export type EstadoRegistro = 'activo' | 'suspendido' | 'vencido'

export interface Sistema {
  id: string
  nombre: string
  color_hex: string
  icono?: string   // ← opcional, igual que en QrCodigoRegistroResponse
}

export interface Registro {
  id: string
  sistema_id: string
  sistema?: Sistema
  referencia_externa: string
  datos_display: Record<string, unknown>
  fecha_inicio: string
  fecha_vencimiento?: string
  estado_id: number
  estado?: EstadoRegistro
  suspendido_por?: number
  suspendido_en?: string
  motivo_suspension?: string
  created_at?: string
  updated_at?: string
  created_by?: number
  updated_by?: number
}

export interface QrCodigo {
  id: number
  registro_id: string
  registro?: Registro
  codigo_unico: string
  url_intermedia: string
  imagen_qr_url?: string | null
  created_at?: string
}

// ── Form ─────────────────────────────────────────────────────────────────────

export interface QrFormData {
  sistema_id: string
  referencia_externa: string
  fecha_inicio: string
  fecha_vencimiento: string
  estado: EstadoRegistro
  datos_display_raw: string
}

export interface FormErrors {
  sistema_id?: string
  referencia_externa?: string
  fecha_inicio?: string
  datos_display_raw?: string
}

// ── UI helpers ────────────────────────────────────────────────────────────────

export interface ToastState {
  msg: string
  type: 'success' | 'error'
}

export type SortKey = 'referencia_externa' | 'sistema_id' | 'estado' | 'created_at' | 'fecha_vencimiento'
export type SortDir = 'asc' | 'desc'